import torch
import tensorflow as tf
import onnx
import numpy as np
from typing import Dict, Any, List, Optional, BinaryIO
import os
import json
import hashlib
from datetime import datetime
import logging
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from ..models.sql_models import Model
from ..core.config import settings
import asyncio
import aiofiles
import requests
from tqdm import tqdm

logger = logging.getLogger(__name__)

class ModelManager:
    def __init__(self):
        self.model_cache = {}
        self.model_configs = {}
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Ensure model directory exists
        os.makedirs(settings.MODEL_DIR, exist_ok=True)

    async def upload_model(
        self,
        db: Session,
        file: UploadFile,
        metadata: Dict[str, Any],
        user_id: int
    ) -> Model:
        """Upload and register a new model."""
        try:
            # Validate model file
            await self._validate_model_file(file)
            
            # Generate unique model ID
            model_id = self._generate_model_id(file, metadata)
            
            # Save model file
            model_path = os.path.join(settings.MODEL_DIR, f"{model_id}.onnx")
            await self._save_model_file(file, model_path)
            
            # Create model record
            model = Model(
                id=model_id,
                name=metadata['name'],
                version=metadata['version'],
                type=metadata['type'],
                framework=metadata['framework'],
                file_path=model_path,
                configuration=metadata.get('configuration', {}),
                owner_id=user_id,
                status='uploaded'
            )
            
            db.add(model)
            db.commit()
            db.refresh(model)
            
            # Validate and optimize model
            await self._process_uploaded_model(model)
            
            return model
        except Exception as e:
            # Cleanup on failure
            if 'model_path' in locals() and os.path.exists(model_path):
                os.remove(model_path)
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    async def download_pretrained_model(
        self,
        db: Session,
        model_info: Dict[str, Any],
        user_id: int
    ) -> Model:
        """Download and register a pre-trained model."""
        try:
            # Generate unique model ID
            model_id = self._generate_model_id(None, model_info)
            
            # Download model file
            model_path = os.path.join(settings.MODEL_DIR, f"{model_id}.onnx")
            await self._download_model(model_info['url'], model_path)
            
            # Create model record
            model = Model(
                id=model_id,
                name=model_info['name'],
                version=model_info['version'],
                type=model_info['type'],
                framework=model_info['framework'],
                file_path=model_path,
                configuration=model_info.get('configuration', {}),
                owner_id=user_id,
                status='downloading'
            )
            
            db.add(model)
            db.commit()
            db.refresh(model)
            
            # Validate and optimize model
            await self._process_uploaded_model(model)
            
            return model
        except Exception as e:
            # Cleanup on failure
            if 'model_path' in locals() and os.path.exists(model_path):
                os.remove(model_path)
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    async def load_model(self, model_id: str) -> Any:
        """Load a model into memory."""
        if model_id in self.model_cache:
            return self.model_cache[model_id]
        
        try:
            model_path = os.path.join(settings.MODEL_DIR, f"{model_id}.onnx")
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Load model configuration
            config_path = os.path.join(settings.MODEL_DIR, f"{model_id}_config.json")
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Load model based on framework
            if config['framework'] == 'pytorch':
                model = self._load_pytorch_model(model_path, config)
            elif config['framework'] == 'tensorflow':
                model = self._load_tensorflow_model(model_path, config)
            else:
                model = self._load_onnx_model(model_path, config)
            
            self.model_cache[model_id] = model
            self.model_configs[model_id] = config
            
            return model
        except Exception as e:
            logger.error(f"Error loading model {model_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

    async def unload_model(self, model_id: str):
        """Unload a model from memory."""
        if model_id in self.model_cache:
            del self.model_cache[model_id]
        if model_id in self.model_configs:
            del self.model_configs[model_id]

    async def delete_model(self, db: Session, model_id: str) -> bool:
        """Delete a model."""
        try:
            model = db.query(Model).filter(Model.id == model_id).first()
            if not model:
                return False
            
            # Remove model files
            if os.path.exists(model.file_path):
                os.remove(model.file_path)
            
            config_path = os.path.join(settings.MODEL_DIR, f"{model_id}_config.json")
            if os.path.exists(config_path):
                os.remove(config_path)
            
            # Unload from memory
            await self.unload_model(model_id)
            
            # Delete from database
            db.delete(model)
            db.commit()
            
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting model {model_id}: {str(e)}")
            return False

    async def optimize_model(
        self, model_id: str, optimization_config: Dict[str, Any]
    ) -> bool:
        """Optimize a model for inference."""
        try:
            model_path = os.path.join(settings.MODEL_DIR, f"{model_id}.onnx")
            optimized_path = os.path.join(settings.MODEL_DIR, f"{model_id}_optimized.onnx")
            
            # Load original model
            model = onnx.load(model_path)
            
            # Apply optimizations
            if optimization_config.get('quantization'):
                model = self._quantize_model(model)
            
            if optimization_config.get('pruning'):
                model = self._prune_model(model)
            
            # Save optimized model
            onnx.save(model, optimized_path)
            
            # Update model path
            os.replace(optimized_path, model_path)
            
            return True
        except Exception as e:
            logger.error(f"Error optimizing model {model_id}: {str(e)}")
            return False

    async def _validate_model_file(self, file: UploadFile):
        """Validate uploaded model file."""
        # Check file size
        await file.seek(0, 2)  # Seek to end
        size = await file.tell()
        await file.seek(0)  # Seek back to start
        
        if size > 1024 * 1024 * 1024:  # 1GB limit
            raise ValueError("Model file too large")
        
        # Check file format
        try:
            content = await file.read(1024)  # Read first 1KB
            await file.seek(0)
            
            # Check if it's a valid ONNX file
            if not content.startswith(b'ONNX'):
                raise ValueError("Invalid model format. Only ONNX models are supported")
        except Exception as e:
            raise ValueError(f"Error validating model file: {str(e)}")

    async def _save_model_file(self, file: UploadFile, path: str):
        """Save uploaded model file."""
        async with aiofiles.open(path, 'wb') as f:
            while content := await file.read(1024 * 1024):  # Read 1MB at a time
                await f.write(content)

    async def _download_model(self, url: str, path: str):
        """Download model from URL with progress bar."""
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        
        with open(path, 'wb') as f, tqdm(
            total=total_size,
            unit='iB',
            unit_scale=True
        ) as pbar:
            for data in response.iter_content(chunk_size=1024):
                size = f.write(data)
                pbar.update(size)

    def _generate_model_id(
        self, file: Optional[BinaryIO], metadata: Dict[str, Any]
    ) -> str:
        """Generate unique model ID."""
        hash_input = f"{metadata['name']}_{metadata['version']}_{datetime.utcnow().isoformat()}"
        if file:
            hash_input += hashlib.md5(file.read()).hexdigest()
        return hashlib.sha256(hash_input.encode()).hexdigest()[:16]

    async def _process_uploaded_model(self, model: Model):
        """Process and validate uploaded model."""
        try:
            # Convert to ONNX if needed
            if model.framework != 'onnx':
                await self._convert_to_onnx(model)
            
            # Validate model
            self._validate_onnx_model(model.file_path)
            
            # Optimize model
            await self.optimize_model(model.id, {
                'quantization': True,
                'pruning': False
            })
            
            # Update model status
            model.status = 'ready'
            
        except Exception as e:
            model.status = 'error'
            model.error_message = str(e)
            raise

    def _load_pytorch_model(self, path: str, config: Dict[str, Any]) -> torch.nn.Module:
        """Load PyTorch model."""
        model = torch.jit.load(path, map_location=self.device)
        model.eval()
        return model

    def _load_tensorflow_model(self, path: str, config: Dict[str, Any]) -> tf.keras.Model:
        """Load TensorFlow model."""
        return tf.saved_model.load(path)

    def _load_onnx_model(self, path: str, config: Dict[str, Any]) -> onnx.ModelProto:
        """Load ONNX model."""
        return onnx.load(path)

    def _quantize_model(self, model: onnx.ModelProto) -> onnx.ModelProto:
        """Quantize model to reduce size and improve inference speed."""
        from onnxruntime.quantization import quantize_dynamic
        
        # Create temporary files for quantization
        temp_input = "temp_model_input.onnx"
        temp_output = "temp_model_output.onnx"
        
        try:
            onnx.save(model, temp_input)
            quantize_dynamic(
                temp_input,
                temp_output,
                weight_type=onnx.TensorProto.INT8
            )
            quantized_model = onnx.load(temp_output)
            return quantized_model
        finally:
            # Cleanup temporary files
            for temp_file in [temp_input, temp_output]:
                if os.path.exists(temp_file):
                    os.remove(temp_file)

    def _prune_model(self, model: onnx.ModelProto) -> onnx.ModelProto:
        """Prune model to remove unnecessary weights."""
        # Implement model pruning logic here
        return model

    def _validate_onnx_model(self, path: str):
        """Validate ONNX model structure."""
        model = onnx.load(path)
        onnx.checker.check_model(model)

    async def _convert_to_onnx(self, model: Model):
        """Convert model to ONNX format."""
        if model.framework == 'pytorch':
            await self._convert_pytorch_to_onnx(model)
        elif model.framework == 'tensorflow':
            await self._convert_tensorflow_to_onnx(model)

    async def _convert_pytorch_to_onnx(self, model: Model):
        """Convert PyTorch model to ONNX."""
        # Implement PyTorch to ONNX conversion
        pass

    async def _convert_tensorflow_to_onnx(self, model: Model):
        """Convert TensorFlow model to ONNX."""
        # Implement TensorFlow to ONNX conversion
        pass

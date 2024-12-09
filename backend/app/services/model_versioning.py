from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import os
from sqlalchemy.orm import Session
from ..models.sql_models import Model, ModelVersion, ModelMetrics
from ..core.config import settings
import logging
import hashlib

logger = logging.getLogger(__name__)

class ModelVersionManager:
    def __init__(self):
        self.version_cache = {}
        os.makedirs(settings.MODEL_VERSIONS_DIR, exist_ok=True)

    async def create_version(
        self,
        db: Session,
        model_id: str,
        version_data: Dict[str, Any],
        metrics: Optional[Dict[str, float]] = None
    ) -> ModelVersion:
        """Create a new version of a model."""
        try:
            # Generate version hash
            version_hash = self._generate_version_hash(version_data)
            
            # Create version directory
            version_dir = os.path.join(settings.MODEL_VERSIONS_DIR, model_id, version_hash)
            os.makedirs(version_dir, exist_ok=True)
            
            # Save version metadata
            metadata_path = os.path.join(version_dir, 'metadata.json')
            with open(metadata_path, 'w') as f:
                json.dump(version_data, f)
            
            # Create version record
            version = ModelVersion(
                hash=version_hash,
                model_id=model_id,
                metadata=version_data,
                status='created'
            )
            
            db.add(version)
            
            # Add metrics if provided
            if metrics:
                for metric_name, value in metrics.items():
                    metric = ModelMetrics(
                        version_hash=version_hash,
                        metric_name=metric_name,
                        value=value,
                        timestamp=datetime.utcnow()
                    )
                    db.add(metric)
            
            db.commit()
            db.refresh(version)
            
            return version
        
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating version: {str(e)}")
            raise

    async def get_version_history(
        self,
        db: Session,
        model_id: str,
        limit: int = 10
    ) -> List[ModelVersion]:
        """Get version history for a model."""
        return (
            db.query(ModelVersion)
            .filter(ModelVersion.model_id == model_id)
            .order_by(ModelVersion.created_at.desc())
            .limit(limit)
            .all()
        )

    async def compare_versions(
        self,
        db: Session,
        version_hash1: str,
        version_hash2: str
    ) -> Dict[str, Any]:
        """Compare two model versions."""
        v1 = db.query(ModelVersion).filter(ModelVersion.hash == version_hash1).first()
        v2 = db.query(ModelVersion).filter(ModelVersion.hash == version_hash2).first()
        
        if not v1 or not v2:
            raise ValueError("One or both versions not found")
        
        # Get metrics for both versions
        metrics1 = (
            db.query(ModelMetrics)
            .filter(ModelMetrics.version_hash == version_hash1)
            .all()
        )
        metrics2 = (
            db.query(ModelMetrics)
            .filter(ModelMetrics.version_hash == version_hash2)
            .all()
        )
        
        # Compare metrics
        metrics_comparison = {}
        for m1 in metrics1:
            for m2 in metrics2:
                if m1.metric_name == m2.metric_name:
                    metrics_comparison[m1.metric_name] = {
                        'v1': m1.value,
                        'v2': m2.value,
                        'diff': m2.value - m1.value,
                        'diff_percent': ((m2.value - m1.value) / m1.value) * 100
                    }
        
        return {
            'version1': {
                'hash': v1.hash,
                'metadata': v1.metadata,
                'created_at': v1.created_at
            },
            'version2': {
                'hash': v2.hash,
                'metadata': v2.metadata,
                'created_at': v2.created_at
            },
            'metrics_comparison': metrics_comparison
        }

    async def rollback_version(
        self,
        db: Session,
        model_id: str,
        version_hash: str
    ) -> bool:
        """Rollback to a previous version."""
        try:
            # Get version
            version = (
                db.query(ModelVersion)
                .filter(ModelVersion.model_id == model_id)
                .filter(ModelVersion.hash == version_hash)
                .first()
            )
            
            if not version:
                raise ValueError("Version not found")
            
            # Get model
            model = db.query(Model).filter(Model.id == model_id).first()
            if not model:
                raise ValueError("Model not found")
            
            # Copy version files to model directory
            version_dir = os.path.join(settings.MODEL_VERSIONS_DIR, model_id, version_hash)
            model_dir = os.path.join(settings.MODEL_DIR, model_id)
            
            # Update model metadata
            model.configuration = version.metadata
            model.updated_at = datetime.utcnow()
            
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error rolling back version: {str(e)}")
            return False

    def _generate_version_hash(self, version_data: Dict[str, Any]) -> str:
        """Generate unique hash for version."""
        data_str = json.dumps(version_data, sort_keys=True)
        return hashlib.sha256(
            f"{data_str}_{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()[:16]

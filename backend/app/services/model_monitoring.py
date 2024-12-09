from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.sql_models import Model, ModelMetrics, ModelPrediction
import logging
import json
import os
from ..core.config import settings
import pandas as pd
from sklearn.metrics import confusion_matrix, classification_report
import plotly.graph_objects as go
import plotly.express as px

logger = logging.getLogger(__name__)

class ModelMonitor:
    def __init__(self):
        self.metrics_cache = {}
        os.makedirs(settings.MODEL_METRICS_DIR, exist_ok=True)

    async def log_prediction(
        self,
        db: Session,
        model_id: str,
        input_data: Dict[str, Any],
        prediction: Any,
        ground_truth: Optional[Any] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ModelPrediction:
        """Log a model prediction for monitoring."""
        try:
            prediction_record = ModelPrediction(
                model_id=model_id,
                input_data=input_data,
                prediction=prediction,
                ground_truth=ground_truth,
                metadata=metadata or {},
                timestamp=datetime.utcnow()
            )
            
            db.add(prediction_record)
            db.commit()
            db.refresh(prediction_record)
            
            # Update real-time metrics if ground truth is available
            if ground_truth is not None:
                await self.update_metrics(db, model_id, prediction, ground_truth)
            
            return prediction_record
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error logging prediction: {str(e)}")
            raise

    async def update_metrics(
        self,
        db: Session,
        model_id: str,
        prediction: Any,
        ground_truth: Any
    ):
        """Update model metrics based on prediction results."""
        try:
            # Calculate accuracy
            is_correct = prediction == ground_truth
            
            metrics = {
                'accuracy': float(is_correct),
                'prediction_count': 1
            }
            
            # Add metrics records
            for metric_name, value in metrics.items():
                metric = ModelMetrics(
                    model_id=model_id,
                    metric_name=metric_name,
                    value=value,
                    timestamp=datetime.utcnow()
                )
                db.add(metric)
            
            db.commit()
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating metrics: {str(e)}")
            raise

    async def get_performance_metrics(
        self,
        db: Session,
        model_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        metric_names: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Get model performance metrics for a time period."""
        if not start_time:
            start_time = datetime.utcnow() - timedelta(days=7)
        if not end_time:
            end_time = datetime.utcnow()
            
        query = (
            db.query(
                ModelMetrics.metric_name,
                func.avg(ModelMetrics.value).label('avg_value'),
                func.min(ModelMetrics.value).label('min_value'),
                func.max(ModelMetrics.value).label('max_value'),
                func.count(ModelMetrics.id).label('count')
            )
            .filter(ModelMetrics.model_id == model_id)
            .filter(ModelMetrics.timestamp.between(start_time, end_time))
        )
        
        if metric_names:
            query = query.filter(ModelMetrics.metric_name.in_(metric_names))
            
        results = (
            query.group_by(ModelMetrics.metric_name)
            .all()
        )
        
        metrics_summary = {}
        for result in results:
            metrics_summary[result.metric_name] = {
                'average': float(result.avg_value),
                'min': float(result.min_value),
                'max': float(result.max_value),
                'count': int(result.count)
            }
            
        return metrics_summary

    async def generate_performance_report(
        self,
        db: Session,
        model_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Generate a comprehensive performance report."""
        if not start_time:
            start_time = datetime.utcnow() - timedelta(days=7)
        if not end_time:
            end_time = datetime.utcnow()
            
        # Get predictions with ground truth
        predictions = (
            db.query(ModelPrediction)
            .filter(ModelPrediction.model_id == model_id)
            .filter(ModelPrediction.timestamp.between(start_time, end_time))
            .filter(ModelPrediction.ground_truth != None)
            .all()
        )
        
        if not predictions:
            return {"error": "No predictions with ground truth found"}
            
        # Convert to arrays
        y_true = [p.ground_truth for p in predictions]
        y_pred = [p.prediction for p in predictions]
        
        # Calculate metrics
        conf_matrix = confusion_matrix(y_true, y_pred)
        class_report = classification_report(y_true, y_pred, output_dict=True)
        
        # Generate visualizations
        figures = await self._generate_visualizations(
            db, model_id, start_time, end_time
        )
        
        # Save report
        report = {
            'model_id': model_id,
            'period': {
                'start': start_time.isoformat(),
                'end': end_time.isoformat()
            },
            'metrics': {
                'confusion_matrix': conf_matrix.tolist(),
                'classification_report': class_report
            },
            'visualizations': figures,
            'prediction_count': len(predictions),
            'generated_at': datetime.utcnow().isoformat()
        }
        
        # Save report to file
        report_path = os.path.join(
            settings.MODEL_METRICS_DIR,
            f"report_{model_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        )
        with open(report_path, 'w') as f:
            json.dump(report, f)
            
        return report

    async def _generate_visualizations(
        self,
        db: Session,
        model_id: str,
        start_time: datetime,
        end_time: datetime
    ) -> Dict[str, Any]:
        """Generate visualizations for the performance report."""
        # Get metrics over time
        metrics = (
            db.query(ModelMetrics)
            .filter(ModelMetrics.model_id == model_id)
            .filter(ModelMetrics.timestamp.between(start_time, end_time))
            .all()
        )
        
        # Convert to DataFrame
        df = pd.DataFrame([
            {
                'metric_name': m.metric_name,
                'value': m.value,
                'timestamp': m.timestamp
            }
            for m in metrics
        ])
        
        figures = {}
        
        if not df.empty:
            # Metrics over time
            fig = px.line(
                df,
                x='timestamp',
                y='value',
                color='metric_name',
                title='Metrics Over Time'
            )
            figures['metrics_over_time'] = fig.to_json()
            
            # Distribution of metric values
            fig = px.histogram(
                df,
                x='value',
                color='metric_name',
                title='Metric Value Distribution'
            )
            figures['metric_distribution'] = fig.to_json()
            
        return figures

    async def set_monitoring_alerts(
        self,
        db: Session,
        model_id: str,
        alerts_config: Dict[str, Any]
    ) -> bool:
        """Configure monitoring alerts for a model."""
        try:
            model = db.query(Model).filter(Model.id == model_id).first()
            if not model:
                raise ValueError("Model not found")
                
            # Update model configuration with alerts
            config = model.configuration or {}
            config['monitoring_alerts'] = alerts_config
            model.configuration = config
            
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error setting monitoring alerts: {str(e)}")
            return False

    async def check_alerts(
        self,
        db: Session,
        model_id: str
    ) -> List[Dict[str, Any]]:
        """Check if any monitoring alerts are triggered."""
        model = db.query(Model).filter(Model.id == model_id).first()
        if not model or not model.configuration.get('monitoring_alerts'):
            return []
            
        alerts = []
        alerts_config = model.configuration['monitoring_alerts']
        
        # Get recent metrics
        recent_metrics = await self.get_performance_metrics(
            db,
            model_id,
            start_time=datetime.utcnow() - timedelta(hours=1)
        )
        
        # Check each alert condition
        for metric_name, thresholds in alerts_config.items():
            if metric_name in recent_metrics:
                metric_value = recent_metrics[metric_name]['average']
                
                if 'min' in thresholds and metric_value < thresholds['min']:
                    alerts.append({
                        'model_id': model_id,
                        'metric_name': metric_name,
                        'current_value': metric_value,
                        'threshold': thresholds['min'],
                        'type': 'below_minimum',
                        'timestamp': datetime.utcnow().isoformat()
                    })
                    
                if 'max' in thresholds and metric_value > thresholds['max']:
                    alerts.append({
                        'model_id': model_id,
                        'metric_name': metric_name,
                        'current_value': metric_value,
                        'threshold': thresholds['max'],
                        'type': 'above_maximum',
                        'timestamp': datetime.utcnow().isoformat()
                    })
                    
        return alerts

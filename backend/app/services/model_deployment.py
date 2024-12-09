from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import asyncio
import docker
from kubernetes import client, config
import logging
import os
import json
from sqlalchemy.orm import Session
from ..models.sql_models import Model, ModelDeployment
from ..core.config import settings
import yaml

logger = logging.getLogger(__name__)

class ModelDeploymentManager:
    def __init__(self):
        self.docker_client = docker.from_env()
        try:
            config.load_kube_config()
            self.k8s_apps_v1 = client.AppsV1Api()
            self.k8s_core_v1 = client.CoreV1Api()
            self.k8s_available = True
        except:
            self.k8s_available = False
            logger.warning("Kubernetes configuration not found. Only Docker deployments will be available.")

    async def deploy_model(
        self,
        db: Session,
        model_id: str,
        deployment_config: Dict[str, Any]
    ) -> ModelDeployment:
        """Deploy a model using specified configuration."""
        try:
            # Validate model exists
            model = db.query(Model).filter(Model.id == model_id).first()
            if not model:
                raise ValueError("Model not found")

            # Create deployment record
            deployment = ModelDeployment(
                model_id=model_id,
                config=deployment_config,
                status='pending'
            )
            db.add(deployment)
            db.commit()
            db.refresh(deployment)

            # Deploy based on platform
            platform = deployment_config.get('platform', 'docker')
            if platform == 'docker':
                await self._deploy_docker(deployment, model)
            elif platform == 'kubernetes' and self.k8s_available:
                await self._deploy_kubernetes(deployment, model)
            else:
                raise ValueError(f"Unsupported deployment platform: {platform}")

            return deployment

        except Exception as e:
            db.rollback()
            logger.error(f"Error deploying model: {str(e)}")
            raise

    async def _deploy_docker(
        self,
        deployment: ModelDeployment,
        model: Model
    ):
        """Deploy model using Docker."""
        try:
            # Create Dockerfile
            dockerfile_content = self._generate_dockerfile(model, deployment.config)
            dockerfile_path = os.path.join(settings.MODEL_DIR, model.id, 'Dockerfile')
            
            with open(dockerfile_path, 'w') as f:
                f.write(dockerfile_content)

            # Build Docker image
            image_tag = f"visionave-model-{model.id}:{deployment.id}"
            self.docker_client.images.build(
                path=os.path.join(settings.MODEL_DIR, model.id),
                tag=image_tag,
                rm=True
            )

            # Run container
            container = self.docker_client.containers.run(
                image_tag,
                detach=True,
                ports={
                    f"{deployment.config.get('port', 8000)}/tcp": deployment.config.get('port', 8000)
                },
                environment=deployment.config.get('environment', {}),
                name=f"visionave-model-{deployment.id}"
            )

            # Update deployment record
            deployment.status = 'running'
            deployment.endpoint = f"http://localhost:{deployment.config.get('port', 8000)}"
            deployment.container_id = container.id

        except Exception as e:
            deployment.status = 'failed'
            deployment.error_message = str(e)
            raise

    async def _deploy_kubernetes(
        self,
        deployment: ModelDeployment,
        model: Model
    ):
        """Deploy model using Kubernetes."""
        try:
            # Generate Kubernetes manifests
            deployment_manifest = self._generate_k8s_deployment(model, deployment)
            service_manifest = self._generate_k8s_service(model, deployment)

            # Create deployment
            self.k8s_apps_v1.create_namespaced_deployment(
                body=deployment_manifest,
                namespace=deployment.config.get('namespace', 'default')
            )

            # Create service
            service = self.k8s_core_v1.create_namespaced_service(
                body=service_manifest,
                namespace=deployment.config.get('namespace', 'default')
            )

            # Update deployment record
            deployment.status = 'running'
            deployment.endpoint = f"http://{service.spec.cluster_ip}:{service.spec.ports[0].port}"

        except Exception as e:
            deployment.status = 'failed'
            deployment.error_message = str(e)
            raise

    def _generate_dockerfile(
        self,
        model: Model,
        config: Dict[str, Any]
    ) -> str:
        """Generate Dockerfile for model deployment."""
        return f"""
FROM python:3.9-slim

WORKDIR /app

# Copy model files
COPY . /app/model/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install additional dependencies
RUN pip install --no-cache-dir fastapi uvicorn

# Copy deployment code
COPY deployment.py /app/

# Expose port
EXPOSE {config.get('port', 8000)}

# Start server
CMD ["uvicorn", "deployment:app", "--host", "0.0.0.0", "--port", "{config.get('port', 8000)}"]
"""

    def _generate_k8s_deployment(
        self,
        model: Model,
        deployment: ModelDeployment
    ) -> Dict[str, Any]:
        """Generate Kubernetes deployment manifest."""
        return {
            'apiVersion': 'apps/v1',
            'kind': 'Deployment',
            'metadata': {
                'name': f"visionave-model-{deployment.id}",
                'labels': {
                    'app': f"visionave-model-{model.id}",
                    'deployment': str(deployment.id)
                }
            },
            'spec': {
                'replicas': deployment.config.get('replicas', 1),
                'selector': {
                    'matchLabels': {
                        'app': f"visionave-model-{model.id}"
                    }
                },
                'template': {
                    'metadata': {
                        'labels': {
                            'app': f"visionave-model-{model.id}"
                        }
                    },
                    'spec': {
                        'containers': [{
                            'name': f"visionave-model-{model.id}",
                            'image': f"visionave-model-{model.id}:{deployment.id}",
                            'ports': [{
                                'containerPort': deployment.config.get('port', 8000)
                            }],
                            'resources': deployment.config.get('resources', {
                                'requests': {
                                    'cpu': '100m',
                                    'memory': '512Mi'
                                },
                                'limits': {
                                    'cpu': '500m',
                                    'memory': '1Gi'
                                }
                            })
                        }]
                    }
                }
            }
        }

    def _generate_k8s_service(
        self,
        model: Model,
        deployment: ModelDeployment
    ) -> Dict[str, Any]:
        """Generate Kubernetes service manifest."""
        return {
            'apiVersion': 'v1',
            'kind': 'Service',
            'metadata': {
                'name': f"visionave-model-{deployment.id}",
                'labels': {
                    'app': f"visionave-model-{model.id}"
                }
            },
            'spec': {
                'selector': {
                    'app': f"visionave-model-{model.id}"
                },
                'ports': [{
                    'protocol': 'TCP',
                    'port': deployment.config.get('port', 8000),
                    'targetPort': deployment.config.get('port', 8000)
                }],
                'type': deployment.config.get('service_type', 'ClusterIP')
            }
        }

    async def get_deployment_status(
        self,
        db: Session,
        deployment_id: str
    ) -> Dict[str, Any]:
        """Get status of a model deployment."""
        deployment = (
            db.query(ModelDeployment)
            .filter(ModelDeployment.id == deployment_id)
            .first()
        )
        
        if not deployment:
            raise ValueError("Deployment not found")
            
        status = {
            'id': deployment.id,
            'model_id': deployment.model_id,
            'status': deployment.status,
            'endpoint': deployment.endpoint,
            'created_at': deployment.created_at.isoformat(),
            'error_message': deployment.error_message
        }
        
        if deployment.status == 'running':
            # Add platform-specific status
            if deployment.config['platform'] == 'docker':
                try:
                    container = self.docker_client.containers.get(deployment.container_id)
                    status['container_status'] = container.status
                    status['container_stats'] = container.stats(stream=False)
                except:
                    status['container_status'] = 'unknown'
            
            elif deployment.config['platform'] == 'kubernetes':
                try:
                    deployment_status = self.k8s_apps_v1.read_namespaced_deployment_status(
                        name=f"visionave-model-{deployment.id}",
                        namespace=deployment.config.get('namespace', 'default')
                    )
                    status['replicas'] = {
                        'desired': deployment_status.spec.replicas,
                        'available': deployment_status.status.available_replicas,
                        'ready': deployment_status.status.ready_replicas
                    }
                except:
                    status['replicas'] = 'unknown'
                    
        return status

    async def update_deployment(
        self,
        db: Session,
        deployment_id: str,
        updates: Dict[str, Any]
    ) -> ModelDeployment:
        """Update a model deployment."""
        deployment = (
            db.query(ModelDeployment)
            .filter(ModelDeployment.id == deployment_id)
            .first()
        )
        
        if not deployment:
            raise ValueError("Deployment not found")
            
        try:
            # Update configuration
            deployment.config.update(updates)
            
            # Apply updates based on platform
            if deployment.config['platform'] == 'docker':
                container = self.docker_client.containers.get(deployment.container_id)
                
                # Update container configuration
                container.update(
                    mem_limit=updates.get('memory_limit'),
                    cpu_quota=updates.get('cpu_limit')
                )
                
            elif deployment.config['platform'] == 'kubernetes':
                # Update Kubernetes deployment
                deployment_manifest = self._generate_k8s_deployment(
                    db.query(Model).filter(Model.id == deployment.model_id).first(),
                    deployment
                )
                
                self.k8s_apps_v1.patch_namespaced_deployment(
                    name=f"visionave-model-{deployment.id}",
                    namespace=deployment.config.get('namespace', 'default'),
                    body=deployment_manifest
                )
                
            db.commit()
            db.refresh(deployment)
            return deployment
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating deployment: {str(e)}")
            raise

    async def delete_deployment(
        self,
        db: Session,
        deployment_id: str
    ) -> bool:
        """Delete a model deployment."""
        deployment = (
            db.query(ModelDeployment)
            .filter(ModelDeployment.id == deployment_id)
            .first()
        )
        
        if not deployment:
            raise ValueError("Deployment not found")
            
        try:
            # Clean up based on platform
            if deployment.config['platform'] == 'docker':
                try:
                    container = self.docker_client.containers.get(deployment.container_id)
                    container.stop()
                    container.remove()
                except:
                    logger.warning(f"Container {deployment.container_id} not found")
                    
            elif deployment.config['platform'] == 'kubernetes':
                try:
                    # Delete Kubernetes resources
                    self.k8s_apps_v1.delete_namespaced_deployment(
                        name=f"visionave-model-{deployment.id}",
                        namespace=deployment.config.get('namespace', 'default')
                    )
                    
                    self.k8s_core_v1.delete_namespaced_service(
                        name=f"visionave-model-{deployment.id}",
                        namespace=deployment.config.get('namespace', 'default')
                    )
                except:
                    logger.warning(f"Kubernetes resources for deployment {deployment.id} not found")
                    
            # Delete deployment record
            db.delete(deployment)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting deployment: {str(e)}")
            return False

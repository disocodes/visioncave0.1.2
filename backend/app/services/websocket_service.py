from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, module: str):
        await websocket.accept()
        if module not in self.active_connections:
            self.active_connections[module] = []
        self.active_connections[module].append(websocket)
        logger.info(f"Client connected to module: {module}")

    def disconnect(self, websocket: WebSocket, module: str):
        if module in self.active_connections:
            self.active_connections[module].remove(websocket)
            logger.info(f"Client disconnected from module: {module}")

    async def broadcast_to_module(self, message: dict, module: str):
        if module in self.active_connections:
            for connection in self.active_connections[module]:
                try:
                    await connection.send_json(message)
                except WebSocketDisconnect:
                    await self.disconnect(connection, module)
                except Exception as e:
                    logger.error(f"Error broadcasting message: {str(e)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {str(e)}")

manager = ConnectionManager()

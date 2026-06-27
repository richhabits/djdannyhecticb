import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pythonjsonlogger import jsonlogger

# --- Structured Logging Setup ---
log_handler = logging.StreamHandler(sys.stdout)
formatter = jsonlogger.JsonFormatter(
    fmt='%(asctime)s %(levelname)s %(name)s %(message)s',
    json_ensure_ascii=False
)
log_handler.setFormatter(formatter)
root_logger = logging.getLogger()
root_logger.addHandler(log_handler)
root_logger.setLevel(os.getenv("LOG_LEVEL", "INFO"))

logger = logging.getLogger("broadcast-engine")

# --- App Initialization ---
app = FastAPI(title="DJ Danny Hectic B - Broadcast Engine API")

# --- Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception occurred", extra={
        "path": request.url.path,
        "error": str(exc),
        "method": request.method
    })
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc) if os.getenv("DEBUG") else "An unexpected error occurred"},
    )

# Configure strict CORS for Vite development and production
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global State ---
class StreamState:
    def __init__(self):
        self.listener_count = 0
        self.cpu_load = 0.0
        self.current_track = "Off Air"
        self.is_live = False
        self.last_update = datetime.utcnow()

    def to_dict(self):
        return {
            "listeners": self.listener_count,
            "cpu": self.cpu_load,
            "track": self.current_track,
            "live": self.is_live,
            "timestamp": self.last_update.isoformat()
        }

state = StreamState()
active_connections: List[WebSocket] = []

# --- Liquidsoap Harbor Connector ---
async def connect_liquidsoap_harbor():
    """
    Maintains a resilient connection to Liquidsoap for metrics and control.
    Implements automatic reconnection with exponential backoff.
    """
    host = os.getenv("LIQUIDSOAP_HOST", "localhost")
    port = int(os.getenv("LIQUIDSOAP_PORT", 8005))
    retry_delay = 1

    while True:
        try:
            logger.info("Connecting to Liquidsoap harbor...", extra={"host": host, "port": port})
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(host, port),
                timeout=5.0
            )

            logger.info("Matrix link established with Liquidsoap")
            state.is_live = True
            retry_delay = 1 # Reset backoff on success

            while True:
                # Command Liquidsoap for status
                writer.write(b"stats.json\n")
                await writer.drain()

                line = await reader.read(4096)
                if not line:
                    break

                try:
                    raw_data = json.loads(line.decode().strip())
                    state.listener_count = raw_data.get("listeners", 0)
                    state.current_track = raw_data.get("current_track", "Unknown")
                    state.cpu_load = raw_data.get("cpu", 0.0)
                    state.last_update = datetime.utcnow()

                    # Broadcast to all dashboard clients
                    await broadcast_metrics()
                except Exception as e:
                    logger.error("Failed to parse Liquidsoap telemetry", extra={"error": str(e)})

                await asyncio.sleep(5) # Poll every 5 seconds

        except (asyncio.TimeoutError, ConnectionRefusedError, OSError) as e:
            state.is_live = False
            logger.warning("Broadcast harbor connection dropped. Retrying...", extra={
                "delay": retry_delay,
                "error": str(e)
            })
            await asyncio.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, 60) # Exponential backoff max 60s
        except Exception as e:
            logger.error("Unexpected error in Liquidsoap connector", extra={"error": str(e)})
            await asyncio.sleep(5)

# --- WebSocket Hub ---
async def broadcast_metrics():
    if not active_connections:
        return

    payload = json.dumps({
        "type": "metrics",
        "data": state.to_dict()
    })

    disconnected = []
    for connection in active_connections:
        try:
            await connection.send_text(payload)
        except Exception:
            disconnected.append(connection)

    for conn in disconnected:
        active_connections.remove(conn)

@app.websocket("/ws/metrics")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    logger.info("New dashboard telemetry link established", extra={"client": str(websocket.client)})

    # Send initial state
    await websocket.send_text(json.dumps({
        "type": "welcome",
        "data": state.to_dict()
    }))

    try:
        while True:
            # Keep connection alive, listen for any client messages
            data = await websocket.receive_text()
            # Handle heartbeat or client commands here if needed
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info("Dashboard telemetry link severed")
    except Exception as e:
        logger.error("WebSocket error", extra={"error": str(e)})
        if websocket in active_connections:
            active_connections.remove(websocket)

# --- Lifecycle Hooks ---
@app.on_event("startup")
async def startup_event():
    logger.info("Broadcast Engine API initializing...")
    asyncio.create_task(connect_liquidsoap_harbor())

@app.get("/")
def read_root():
    return {
        "status": "online",
        "broadcast_state": state.to_dict(),
        "api_docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "matrix_link": state.is_live}

"""
scripts/server.py - Servidor Web de Produção para BlobSling Shenanigans
Porta: 8097
Domínio: https://blobslingshenanigans.kinomuse.com.br
"""
import os
import sys
import time
from pathlib import Path
from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

ROOT_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT_DIR / "dist"
LOGS_DIR = ROOT_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="BlobSling Shenanigans Web Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVER_START_TIME = int(time.time())
PORT = 8097

NO_CACHE_HEADERS = {
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0"
}

@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "service": "BlobSling Shenanigans",
        "port": PORT,
        "domain": "https://blobslingshenanigans.kinomuse.com.br",
        "uptime_seconds": int(time.time() - SERVER_START_TIME),
        "version": "1.0.0"
    }

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.endswith((".html", ".js", ".css", ".json")) or request.url.path == "/":
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_game(full_path: str, request: Request):
    if full_path in ["sw.js", "manifest.json", "favicon.ico"]:
        file_path = DIST_DIR / full_path
        if file_path.exists():
            return FileResponse(file_path, headers=NO_CACHE_HEADERS)

    file_path = DIST_DIR / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path, headers=NO_CACHE_HEADERS)

    index_file = DIST_DIR / "index.html"
    return FileResponse(index_file, headers=NO_CACHE_HEADERS)

def run():
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="warning")

if __name__ == "__main__":
    run()

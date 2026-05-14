"""
Vercel Python serverless function que baixa o áudio de um vídeo do YouTube
e faz upload direto para a AssemblyAI, devolvendo o upload_url.

Mantém o fluxo original (AssemblyAI transcribe) viável em produção, já que
o yt-dlp binário não existe no runtime serverless padrão.
"""

from http.server import BaseHTTPRequestHandler
import glob
import json
import os
import uuid

import requests
import yt_dlp


ASSEMBLYAI_API_KEY = os.environ.get("ASSEMBLYAI_API_KEY")
ASSEMBLYAI_UPLOAD_URL = "https://api.assemblyai.com/v2/upload"
YOUTUBE_PROXY_URL = os.environ.get("YOUTUBE_PROXY_URL")


def download_and_upload(youtube_url: str) -> dict:
    file_id = uuid.uuid4().hex
    out_template = f"/tmp/{file_id}.%(ext)s"

    ydl_opts = {
        "format": "bestaudio[ext=m4a]/bestaudio/best",
        "outtmpl": out_template,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "extractor_args": {
            "youtube": {"player_client": ["default", "android_vr"]}
        },
    }
    if YOUTUBE_PROXY_URL:
        ydl_opts["proxy"] = YOUTUBE_PROXY_URL

    downloaded_path = None
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            duration = info.get("duration")

        matches = glob.glob(f"/tmp/{file_id}.*")
        if not matches:
            raise RuntimeError("yt-dlp não produziu arquivo de áudio")
        downloaded_path = matches[0]

        with open(downloaded_path, "rb") as f:
            res = requests.post(
                ASSEMBLYAI_UPLOAD_URL,
                headers={"Authorization": ASSEMBLYAI_API_KEY},
                data=f,
                timeout=120,
            )
        res.raise_for_status()
        upload_url = res.json()["upload_url"]

        return {
            "upload_url": upload_url,
            "duration_seconds": duration,
        }
    finally:
        if downloaded_path and os.path.exists(downloaded_path):
            try:
                os.unlink(downloaded_path)
            except OSError:
                pass


def _send_json(rh: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    body = json.dumps(payload).encode("utf-8")
    rh.send_response(status)
    rh.send_header("Content-Type", "application/json")
    rh.send_header("Content-Length", str(len(body)))
    rh.end_headers()
    rh.wfile.write(body)


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        try:
            if not ASSEMBLYAI_API_KEY:
                _send_json(self, 500, {"error": "ASSEMBLYAI_API_KEY não configurado"})
                return

            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length > 0 else b""
            data = json.loads(raw or b"{}")
            youtube_url = (data.get("url") or "").strip()

            if not youtube_url:
                _send_json(self, 400, {"error": "url é obrigatório"})
                return

            result = download_and_upload(youtube_url)
            _send_json(self, 200, result)
        except yt_dlp.utils.DownloadError as e:
            _send_json(self, 502, {"error": f"yt-dlp falhou: {str(e)}"})
        except requests.HTTPError as e:
            _send_json(self, 502, {"error": f"AssemblyAI upload falhou: {str(e)}"})
        except Exception as e:
            _send_json(self, 500, {"error": str(e)})

    def do_GET(self) -> None:
        _send_json(self, 200, {"status": "ok", "method": "POST com {url} no body"})

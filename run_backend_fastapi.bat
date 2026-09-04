@echo off
echo Starting Islamic Research Tool FastAPI Backend...
cd /d "%~dp0"
if exist "backend\venv\Scripts\python.exe" (
    .\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
)
pause


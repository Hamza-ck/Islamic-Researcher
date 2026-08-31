@echo off
echo ========================================================
echo   Starting Islamic Research Tool (FastAPI + React)
echo ========================================================
echo.
start "FastAPI Backend (Port 8000)" cmd /k "%~dp0run_backend_fastapi.bat"
timeout /t 2 >nul
start "React Frontend (Port 3000/5173)" cmd /k "%~dp0run_frontend_react.bat"
echo.
echo Both servers have been launched!
echo - FastAPI backend: http://127.0.0.1:8000
echo - Swagger Docs:    http://127.0.0.1:8000/docs
echo - React Frontend:  http://localhost:3000 or http://localhost:5173
echo.
pause

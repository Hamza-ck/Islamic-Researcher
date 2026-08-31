@echo off
echo Starting Islamic Research Tool with Streamlit...
cd /d "%~dp0backend"
.\venv\Scripts\python.exe -m streamlit run streamlit_app.py --server.port 8502
pause

@echo off
echo ========================================================
echo  MetroMesh - Arrival-Aware Urban Transit Pooling Engine
echo  BITS Hyderabad - Hack4SDG [UN SDG 11.2]
echo ========================================================
echo.

set PATH=C:\Users\parth\AppData\Local\Python\pythoncore-3.15-64;C:\Users\parth\AppData\Local\Python\pythoncore-3.15-64\Scripts;C:\Users\parth\AppData\Local\Programs\nodejs;%PATH%

echo [1/2] Verifying Frontend Production Build...
cd /d "%~dp0frontend"
if not exist "dist" (
    echo Building Vite frontend...
    call npm run build
)

echo.
echo [2/2] Starting MetroMesh FastAPI Engine on http://localhost:8000 ...
cd /d "%~dp0"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause

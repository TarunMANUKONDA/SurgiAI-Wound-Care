@echo off
echo ====================================
echo  Surgical Wound Care - Django Backend
echo ====================================
echo.

cd /d "%~dp0"

:: Navigate to backend directory
cd backend

:: Activate virtual environment
if exist "venv_new" (
    call venv_new\Scripts\activate
) else if exist "venv" (
    call venv\Scripts\activate
) else (
    echo venv not found in backend directory!
    pause
    exit /b
)

:: Start the Django server
echo Starting Django backend server...
echo Server will be available at: http://localhost:8000
echo.

python manage.py runserver 0.0.0.0:8000

pause

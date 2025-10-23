@echo off
REM Script to setup shared files in frontend and admin-panel (Windows)
REM Run this after cloning the project

echo Setting up shared files...
echo.

REM Setup for frontend
if exist "frontend" (
    echo Setting up frontend...
    mkdir "frontend\src\shared\utils" 2>nul
    mkdir "frontend\src\shared\constants" 2>nul
    
    REM Note: In Windows, you need to manually copy the files or use this script after extracting
    echo Please copy the following files:
    echo   shared/utils/apiClient.js TO frontend/src/shared/utils/apiClient.js
    echo   shared/constants/api.js TO frontend/src/shared/constants/api.js
    echo.
) else (
    echo ERROR: frontend directory not found!
)

REM Setup for admin-panel
if exist "admin-panel" (
    echo Setting up admin-panel...
    mkdir "admin-panel\src\shared\utils" 2>nul
    mkdir "admin-panel\src\shared\constants" 2>nul
    
    echo Please copy the following files:
    echo   shared/utils/apiClient.js TO admin-panel/src/shared/utils/apiClient.js
    echo   shared/constants/api.js TO admin-panel/src/shared/constants/api.js
    echo.
)

echo.
echo Setup directories created!
echo.
echo Next steps:
echo 1. Copy shared files (see above)
echo 2. cd frontend and run: yarn install
echo 3. cd backend and run: pip install -r requirements.txt
echo 4. Create .env files (see SETUP_GUIDE_FA.md)
echo 5. Run the project (see QUICK_START.md)
echo.
pause

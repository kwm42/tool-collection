@echo off
echo Starting ComfyUI Trigger...
echo.

echo Starting backend server...
start "ComfyUI Backend" cmd /k "cd backend\comfyui-server && node src\index.js"

echo Starting frontend preview...
start "ComfyUI Frontend" cmd /k "cd web-tools\comfyui-trigger && pnpm preview"

timeout /t 2 /nobreak >nul

echo Opening frontend in browser...
start http://localhost:4173

echo.
echo Both servers started!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:4173
echo.
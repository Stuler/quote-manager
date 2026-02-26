@echo off
taskkill /IM caddy.exe /F >nul 2>&1
echo Server stopped.
pause

@echo off
setlocal
cd /d "%~dp0"

set PORT=8787

echo Starting local server on http://127.0.0.1:%PORT%
echo Keep this window open while using the app.
echo.

start "" "http://127.0.0.1:%PORT%"

caddy.exe file-server --root ".\site" --listen "127.0.0.1:%PORT%" --access-log
endlocal

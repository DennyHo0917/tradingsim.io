@echo off
echo Starting Trading Simulator Local Server...
echo.
echo Available options:
echo 1. Python 3 (recommended)
echo 2. Python 2 (fallback)
echo 3. Node.js (if installed)
echo.

:choice
set /p choice="Select option (1-3): "

if "%choice%"=="1" (
    echo Starting Python 3 HTTP server on port 8000...
    echo Open your browser and go to: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
    goto end
)

if "%choice%"=="2" (
    echo Starting Python 2 HTTP server on port 8000...
    echo Open your browser and go to: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    python -m SimpleHTTPServer 8000
    goto end
)

if "%choice%"=="3" (
    echo Starting Node.js HTTP server on port 8000...
    echo Open your browser and go to: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    npx http-server -p 8000
    goto end
)

echo Invalid choice. Please select 1, 2, or 3.
goto choice

:end
pause 
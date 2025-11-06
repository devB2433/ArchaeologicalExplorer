@echo off
REM Local Docker Test Script for Windows (PowerShell/CMD)
REM Tests Docker deployment locally before deploying to production server

echo.
echo ===============================
echo   Local Docker Deployment Test
echo ===============================
echo.

REM Check if Docker is running
echo Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    exit /b 1
)
echo [OK] Docker is running
echo.

REM Create test environment file
echo Creating test .env file...
if not exist .env (
    (
        echo # Test Environment Configuration
        echo EMAIL_SERVICE=hostinger
        echo EMAIL_USER=hello@pokemonrangers.com
        echo EMAIL_PASS="765r6G3KZg#A77"
        echo SMTP_HOST=smtp.hostinger.com
        echo SMTP_PORT=465
        echo PORT=3001
        echo NODE_ENV=production
        echo JWT_SECRET=test-secret-key-for-local-testing-only
        echo APP_DOMAIN=localhost
        echo APP_URL=http://localhost:3001
        echo DB_PATH=/app/data/database.sqlite
    ) > .env
    echo [OK] Test .env created
) else (
    echo [WARN] .env already exists, using existing file
)
echo.

REM Build Docker image
echo Building Docker image...
docker build -t archaeology-game:test .
if errorlevel 1 (
    echo [ERROR] Failed to build image
    exit /b 1
)
echo [OK] Image built
echo.

REM Stop existing test container if running
echo Cleaning up existing test container...
docker stop archaeology-game-test >nul 2>&1
docker rm archaeology-game-test >nul 2>&1
echo [OK] Cleanup done
echo.

REM Create test volume
echo Creating test data volume...
docker volume create archaeology-game-test-data >nul 2>&1
echo [OK] Volume created
echo.

REM Run container
echo Starting test container...
docker run -d --name archaeology-game-test -p 3001:3001 -v archaeology-game-test-data:/app/data -v "%cd%\.env:/app/.env:ro" archaeology-game:test
if errorlevel 1 (
    echo [ERROR] Failed to start container
    docker logs archaeology-game-test
    exit /b 1
)
echo [OK] Container started
echo.

REM Wait for startup
echo Waiting for application to start...
timeout /t 5 /nobreak >nul
echo.

REM Check container status
echo Checking container status...
docker ps | findstr archaeology-game-test >nul
if errorlevel 1 (
    echo [ERROR] Container failed to start
    echo Container logs:
    docker logs archaeology-game-test
    exit /b 1
)
echo [OK] Container is running
echo.

REM Test health endpoint
echo Testing health endpoint...
curl -f http://localhost:3001/api/health >nul 2>&1
if errorlevel 1 (
    echo [WARN] Health check failed (this might be OK if still starting)
) else (
    echo [OK] Health check passed
)
echo.

REM Show success message
echo ===============================
echo   Local test completed!
echo ===============================
echo.
echo Application running at: http://localhost:3001
echo.
echo Useful commands:
echo   View logs:    docker logs -f archaeology-game-test
echo   Stop test:    docker stop archaeology-game-test
echo   Remove test:  docker rm archaeology-game-test
echo   Shell access: docker exec -it archaeology-game-test sh
echo.
echo To stop and cleanup: test-local-cleanup.bat
echo.
echo Press any key to view logs (Ctrl+C to exit logs)...
pause >nul
docker logs -f archaeology-game-test

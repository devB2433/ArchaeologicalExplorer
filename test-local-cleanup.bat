@echo off
REM Cleanup script for local Docker test

echo.
echo Cleaning up local Docker test...
echo.

docker stop archaeology-game-test >nul 2>&1
docker rm archaeology-game-test >nul 2>&1
echo [OK] Container removed

REM Optional: Remove test volume (uncomment to remove data)
REM docker volume rm archaeology-game-test-data >nul 2>&1
REM echo [OK] Volume removed

REM Optional: Remove test image (uncomment to rebuild from scratch)
REM docker rmi archaeology-game:test >nul 2>&1
REM echo [OK] Image removed

echo.
echo Cleanup complete!
echo.
pause

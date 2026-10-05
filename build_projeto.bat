@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo [*] Compilando projeto BlobSling Shenanigans para producao...
call npm run build
pause

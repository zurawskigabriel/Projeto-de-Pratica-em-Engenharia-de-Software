@echo off
echo ============================================
echo       Limpando projeto para Docker
echo ============================================

REM Para containers se estiverem rodando
docker-compose down 2>nul

REM Remove node_modules do frontend (pode ter permissões problemáticas)
if exist "Frontend\node_modules" (
    echo Removendo Frontend\node_modules...
    rmdir /s /q "Frontend\node_modules" 2>nul
    if exist "Frontend\node_modules" (
        echo Tentando remover com PowerShell...
        powershell -Command "Remove-Item -Recurse -Force 'Frontend\node_modules' -ErrorAction SilentlyContinue"
    )
)

REM Remove package-lock.json se existir (para evitar conflitos)
if exist "Frontend\package-lock.json" (
    echo Removendo Frontend\package-lock.json...
    del "Frontend\package-lock.json"
)

REM Remove build artifacts do Spring Boot
if exist "api-principal\target" (
    echo Removendo api-principal\target...
    rmdir /s /q "api-principal\target"
)

REM Remove cache do Python
if exist "match\__pycache__" (
    echo Removendo match\__pycache__...
    rmdir /s /q "match\__pycache__"
)

REM Remove imagens Docker antigas do projeto
echo Removendo imagens Docker antigas...
for /f "tokens=1" %%i in ('docker images -q --filter "dangling=true"') do docker rmi %%i 2>nul

REM Lista imagens relacionadas ao projeto
echo.
echo Imagens Docker relacionadas ao projeto:
docker images | findstr -i "meleva\|meadota\|api\|match\|frontend"

echo.
echo ============================================
echo Limpeza concluída!
echo Agora você pode executar: start_docker_windows.bat
echo ============================================
pause
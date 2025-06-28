@echo off
echo ============================================
echo       Me Leva - Parando containers
echo ============================================

REM Para todos os containers
docker-compose down

REM Remove containers parados e imagens não utilizadas (opcional)
set /p cleanup="Deseja limpar containers e imagens não utilizadas? (s/n): "
if /i "%cleanup%"=="s" (
    echo Limpando containers e imagens não utilizadas...
    docker system prune -f
)

echo.
echo Containers parados com sucesso!
pause
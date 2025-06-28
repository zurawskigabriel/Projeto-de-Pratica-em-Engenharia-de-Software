@echo off
echo ============================================
echo       Me Leva - Iniciando com Docker
echo ============================================

REM Verifica se o Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker não está instalado ou não está no PATH
    echo Por favor, instale o Docker Desktop primeiro
    pause
    exit /b 1
)

REM Verifica se o Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker não está rodando
    echo Por favor, inicie o Docker Desktop primeiro
    pause
    exit /b 1
)

REM Obtém o IP local da máquina
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found_ip
    )
)
:found_ip

REM Remove espaços em branco do IP
set LOCAL_IP=%LOCAL_IP: =%

echo IP local detectado: %LOCAL_IP%

REM Atualiza o arquivo de configuração da API no frontend
echo Atualizando configuração da API no frontend...
if exist "Frontend\src\api\api.ts" (
    powershell -Command "(Get-Content 'Frontend\src\api\api.ts') -replace 'http://.*:8080', 'http://%LOCAL_IP%:8080' | Set-Content 'Frontend\src\api\api.ts'"
    powershell -Command "(Get-Content 'Frontend\src\api\api.ts') -replace 'http://.*:9000', 'http://%LOCAL_IP%:9000' | Set-Content 'Frontend\src\api\api.ts'"
)

REM Para containers existentes (se houver)
echo Parando containers existentes...
docker-compose down

REM Limpa node_modules problemático se existir
if exist "Frontend\node_modules" (
    echo Removendo node_modules problemático...
    rmdir /s /q "Frontend\node_modules" 2>nul
    if exist "Frontend\node_modules" (
        powershell -Command "Remove-Item -Recurse -Force 'Frontend\node_modules' -ErrorAction SilentlyContinue"
    )
)

REM =================================================================
REM                        MUDANÇA PRINCIPAL
REM =================================================================

REM 1. Constrói e inicia APENAS os serviços de backend (api e match) em background
echo Construindo e iniciando os serviços de backend...
docker-compose up --build -d api match

echo.
echo Aguardando 5 segundos para a inicialização dos serviços...
timeout /t 5 /nobreak >nul

REM 2. Abre os logs dos serviços de backend em janelas separadas
echo.
echo Abrindo janelas de log para os serviços de backend...
start "API Logs" cmd /k "docker-compose logs -f api"
start "Match Logs" cmd /k "docker-compose logs -f match"

REM 3. Inicia o frontend em MODO INTERATIVO em sua própria janela
echo.
echo Iniciando o Frontend em modo interativo para gerar o QR Code...
start "Frontend QR Code" cmd /k "docker-compose up --build frontend"

echo.
echo ============================================
echo Containers iniciados com sucesso!
echo.
echo Serviços disponíveis:
echo - API Principal: http://%LOCAL_IP%:8080
echo - Serviço Match: http://%LOCAL_IP%:9000
echo - Frontend Expo: http://%LOCAL_IP%:8081
echo.
echo Para acessar o app mobile:
echo 1. Instale o Expo Go (SDK 52) no seu celular
echo 2. Escaneie o QR code que aparecerá na janela 'Frontend QR Code'
echo.
echo Para parar todos os containers, feche estas janelas e execute o script 'stop_docker_windows.bat'
echo ============================================
echo.
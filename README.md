# Me Leva - Plataforma de Adoção de Pets

Este projeto é uma plataforma para adoção de pets, consistindo em um backend principal desenvolvido em Spring Boot, um serviço de matching em Python (FastAPI) e um frontend mobile em React Native (Expo).

## Arquitetura

O sistema é composto por três componentes principais:

1.  **API Principal (`api-principal/`)**: Um serviço backend construído com Spring Boot e Java. Ele gerencia os dados de usuários, pets, adoções e outras funcionalidades centrais da plataforma.
2.  **Serviço de Match (`match/`)**: Um microsserviço em Python utilizando FastAPI e Uvicorn. Este serviço é responsável por calcular a compatibilidade (match) entre adotantes e pets com base em seus perfis e preferências.
3.  **Frontend (`Frontend/`)**: Uma aplicação mobile desenvolvida com React Native e Expo, permitindo que os usuários interajam com a plataforma, visualizem pets, solicitem adoções e gerenciem seus perfis.

## Pré-requisitos

Antes de executar a aplicação, certifique-se de que você tem as seguintes dependências instaladas em seu sistema:

*   **Node.js**: Versão 18 ou superior (inclui npm).
*   **Java Development Kit (JDK)**: Versão 21.
*   **Apache Maven**: Versão 3.8 ou superior (para compilar e executar o serviço Spring Boot).
*   **Python**: Versão 3.13.
*   **pip**: Gerenciador de pacotes Python (geralmente vem com a instalação do Python).
*   **Expo Go**: É necessário usar estritamente a versão SDK 52 do aplicativo Expo Go, disponível em https://expo.dev/go?sdkVersion=52&platform=android&device=false

## Configuração e Execução

Para facilitar a execução dos diferentes componentes da aplicação, foram criados scripts para ambientes Linux e Windows. Esses scripts automatizam a obtenção do IP local da máquina, a atualização dos endpoints da API no frontend e a inicialização de todos os serviços.

### Instruções Gerais

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DA_PASTA_DO_PROJETO>
    ```

2.  **Verifique as dependências:** Certifique-se de que todos os pré-requisitos listados acima estão instalados e configurados corretamente em seu PATH.

### Executando em Linux

1.  **Navegue até a raiz do projeto.**
2.  **Dê permissão de execução para o script:**
    ```bash
    chmod +x start_linux.sh
    ```
3.  **Execute o script:**
    ```bash
    ./start_linux.sh
    ```
    Este script irá:
    *   Detectar o endereço IP local da sua máquina.
    *   Atualizar o arquivo `Frontend/src/api/api.ts` com este IP para que o frontend possa se comunicar com os backends.
    *   Iniciar o serviço Spring Boot (`api-principal`).
    *   Instalar as dependências Python (listadas em `match/requirements.txt`) e iniciar o serviço FastAPI (`match`).
    *   Instalar as dependências Node.js (listadas em `Frontend/package.json`) e iniciar o servidor de desenvolvimento do Expo (`Frontend`).
    *   **Importante**: Um dos terminais abertos irá exibir um QR Code que pode ser escaneado com o aplicativo Expo Go para renderizar a interface no seu celular e permitir o teste da aplicação mobile.

### Executando em Windows

1.  **Navegue até a raiz do projeto.**
2.  **Execute o script `start_windows.bat` clicando duas vezes nele ou executando-o pelo terminal:**
    ```bash
    start_windows.bat
    ```
    Este script irá:
    *   Detectar o endereço IP local da sua máquina.
    *   Atualizar o arquivo `Frontend/src/api/api.ts` com este IP.
    *   Iniciar o serviço Spring Boot (`api-principal`) em uma nova janela do console.
    *   Instalar as dependências Python (listadas em `match/requirements.txt`) e iniciar o serviço FastAPI (`match`) em uma nova janela do console.
    *   Instalar as dependências Node.js (listadas em `Frontend/package.json`) e iniciar o servidor de desenvolvimento do Expo (`Frontend`) em uma nova janela do console.
    *   **Importante**: Um dos terminais abertos irá exibir um QR Code que pode ser escaneado com o aplicativo Expo Go para renderizar a interface no seu celular e permitir o teste da aplicação mobile.

## Testando no Dispositivo Móvel

Após executar os scripts de inicialização:

1. **Instale o Expo Go**: Baixe e instale o aplicativo Expo Go (SDK 52) em seu dispositivo móvel através do link: https://expo.dev/go?sdkVersion=52&platform=android&device=false
2. **Escaneie o QR Code**: Um dos terminais abertos após a execução do script exibirá um QR Code. Use o aplicativo Expo Go para escaneá-lo.
3. **Teste a aplicação**: A interface da aplicação será renderizada diretamente no seu celular, permitindo testar todas as funcionalidades mobile da plataforma.

### Observações Adicionais

*   **Serviço de Match (`match/`)**: Antes de rodar o serviço Python pela primeira vez (ou se as dependências mudarem), é necessário instalar os pacotes listados em `match/requirements.txt`. Os scripts `start_linux.sh` e `start_windows.bat` já cuidam disso. Se for executar manualmente:
    ```bash
    cd match
    pip install -r requirements.txt
    python -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload
    ```
*   **API Principal (`api-principal/`)**: Para executar manualmente o serviço Spring Boot:
    ```bash
    cd api-principal
    ./mvnw spring-boot:run  # Linux/macOS
    # ou
    mvnw.cmd spring-boot:run # Windows
    ```
*   **Frontend (`Frontend/`)**: Para executar manualmente o frontend:
    ```bash
    cd Frontend
    npm install
    npm start
    ```
    Após o `npm start`, o Expo Metro Bundler será iniciado. Você poderá então abrir o aplicativo em um emulador/simulador ou escanear o QR code com o aplicativo Expo Go em seu dispositivo móvel.

## Acesso aos Serviços

Após iniciar todos os componentes:

*   **API Principal (Spring Boot)**: Estará acessível em `http://<SEU_IP_LOCAL>:8080/api`
*   **Serviço de Match (Python/FastAPI)**: Estará acessível em `http://<SEU_IP_LOCAL>:9000`
*   **Frontend (React Native/Expo)**: Siga as instruções do Metro Bundler (geralmente acessível via `http://localhost:8081` ou `http://<SEU_IP_LOCAL>:8081` e pelo app Expo Go).

Lembre-se de substituir `<SEU_IP_LOCAL>` pelo endereço IP da máquina que está executando os serviços. Os scripts de inicialização cuidam da configuração deste IP no frontend automaticamente.
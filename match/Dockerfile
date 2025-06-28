FROM python:3.11-slim

WORKDIR /app

# Instala curl para healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copia apenas requirements.txt primeiro para melhor cache do Docker
COPY requirements.txt .

# Instala dependências Python
RUN pip install fastapi uvicorn openai python-dotenv

# Copia o resto do código
COPY . .

# Expõe a porta
EXPOSE 9000

# Comando para iniciar a aplicação
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]
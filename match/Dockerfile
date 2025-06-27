FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .

RUN pip install fastapi uvicorn openai python-dotenv

COPY . /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]

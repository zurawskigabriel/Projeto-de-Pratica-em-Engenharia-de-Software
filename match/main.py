from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
import logging

# Configuração básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carrega variáveis do .env
load_dotenv(dotenv_path="key.env")

# Inicializa cliente OpenAI
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logger.error("A chave da API da OpenAI não foi encontrada no arquivo .env.")
    # Você pode querer que o aplicativo pare se a chave não estiver disponível
    # exit() 
client = OpenAI(api_key=api_key)

app = FastAPI()

@app.get("/health")
def read_health():
    return {"status": "UP"}

# ---------------------- ARMAZENAMENTO EM MEMÓRIA (PARA DEMONSTRAÇÃO) ----------------------
# Em um ambiente de produção, use um banco de dados como Redis para isso.
tasks_storage: Dict[str, Dict] = {}

# ---------------------- MODELOS ----------------------

class Pet(BaseModel):
    id: int
    nome: str
    especie: str
    sexo: str
    porte: str
    raca: str
    idadeAno: int
    idadeMes: int
    peso: float
    bio: str
    idUsuario: int
    fotos: Optional[List] = None
    historicoMedico: Optional[List] = []

class Perfil(BaseModel):
    id: int
    usuarioId: int
    gato: bool
    cachorro: bool
    macho: bool
    femea: bool
    pequeno: bool
    medio: bool
    grande: bool
    conviveBem: bool
    necessidadesEspeciais: bool
    raca: str

class Requisicao(BaseModel):
    perfil: Perfil
    pets: List[Pet]

# ---------------------- FUNÇÃO DA TAREFA EM SEGUNDO PLANO ----------------------

def processar_match_em_background(user_id: str, requisicao: Requisicao):
    """
    Esta função roda em segundo plano. Ela chama a API da OpenAI e armazena o resultado.
    """
    global tasks_storage
    
    # Adicionado log/print solicitado
    logger.info(f"✅ [ID: {user_id}] Recebida requisição de match. Iniciando processamento com GPT...")

    prompt = f"""
Você é um sistema que compara um perfil com uma lista de pets e retorna os pets com um score de compatibilidade baseado nas preferências do perfil. O score vai de 0 a 100.
O 100% é dificil, apenas se der tudo perfeito. O 0% também deve ser difícil e apenas caso o pet tenha problemas de saúde e o usuário não queira lidar.

Faça com que os scores pareçam orgânicos, e não repita muito. Também evite que sejam números redondos com final 0 ou 5. Mantenha também o Score com média geral mais alta perto dos 80% ou 90%.

Quero que mesmo se o usuário quiser apenas uma das espécies, que alguns pets da outra espécie sejam considerados. Isso também vale para porte e sexo.

Perfil:
{json.dumps(requisicao.perfil.dict(), indent=2)}

Pets:
{json.dumps([pet.dict() for pet in requisicao.pets], indent=2)}

Responda no formato JSON:
{{
  "result": [
    {{ "id": <id_do_pet>, "score": <valor> }},
    ...
  ]
}}

sem nada mais de explicações ou texto adicional. Apenas o objeto JSON.
"""

    try:
        resposta = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "Você compara perfis com pets e retorna compatibilidade em formato JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"} # Usar modo JSON para garantir a saída
        )

        conteudo = resposta.choices[0].message.content
        resultado_json = json.loads(conteudo)
        
        logger.info(f"✅ [ID: {user_id}] Processamento com GPT concluído com sucesso.")
        # Armazena o resultado e atualiza o status
        tasks_storage[user_id] = {"status": "completed", "result": resultado_json.get("result", [])}

    except Exception as e:
        logger.error(f"❌ [ID: {user_id}] Erro ao processar com GPT: {e}")
        tasks_storage[user_id] = {"status": "error", "message": str(e)}


# ---------------------- ENDPOINTS ----------------------

@app.post("/avaliar/{user_id}")
async def iniciar_avaliacao(user_id: str, requisicao: Requisicao, background_tasks: BackgroundTasks):
    """
    Inicia a avaliação em segundo plano e retorna imediatamente.
    """
    global tasks_storage
    
    # Garante que não haja uma tarefa antiga para o mesmo usuário
    if tasks_storage.get(user_id) and tasks_storage[user_id].get("status") == "processing":
        raise HTTPException(status_code=409, detail="Uma avaliação para este usuário já está em andamento.")

    # Define o status inicial
    tasks_storage[user_id] = {"status": "processing", "result": None}
    
    # Adiciona a tarefa demorada para ser executada em segundo plano
    background_tasks.add_task(processar_match_em_background, user_id, requisicao)
    
    logger.info(f"▶️ [ID: {user_id}] Tarefa de match iniciada em segundo plano.")
    
    # Retorna uma resposta imediata para o cliente não ter que esperar
    return {"message": "Avaliação iniciada com sucesso. Verifique o status para obter os resultados."}


@app.get("/avaliar/status/{user_id}")
async def obter_status_avaliacao(user_id: str):
    """
    Permite que o cliente verifique o status da tarefa.
    """
    task = tasks_storage.get(user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Nenhuma tarefa de avaliação encontrada para este usuário.")
    
    return task

@app.delete("/avaliar/resultado/{user_id}")
async def limpar_resultado_avaliacao(user_id: str):
    """
    Remove o resultado da memória após o cliente tê-lo consumido.
    """
    if user_id in tasks_storage:
        del tasks_storage[user_id]
        logger.info(f"🗑️ [ID: {user_id}] Resultado da tarefa limpo da memória.")
        return {"message": "Resultado limpo com sucesso."}
    return {"message": "Nenhum resultado para limpar."}
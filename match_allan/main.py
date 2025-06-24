from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Carrega variáveis do .env
load_dotenv(dotenv_path="key.env")

# Inicializa cliente OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
print("Token carregado:", os.getenv("OPENAI_API_KEY"))

app = FastAPI()

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

# ---------------------- ENDPOINT ----------------------

@app.post("/avaliar")
async def avaliar(requisicao: Requisicao):
    prompt = f"""
Você é um sistema que compara um perfil com uma lista de pets e retorna os pets com um score de compatibilidade baseado nas preferências do perfil. O score vai de 0 a 100.
O 100% é dificil, apenas se der tudo perfeito. O 0% também deve ser difícil e apenas caso o pet tenha problemas de saúde e o usuário não queira lidar.

Faça com que os scores pareçam orgânicos, e não repita muito. Também evite que sejam números redondos com final 0 ou 5. Mantenha também o Score com média geral mais alta perto dos 80% ou 90%.

Quero que mesmo se o usuário quiser apenas uma das espécies, que alguns pets da outra espécie sejam considerados. Isso também vale para porte e sexo.

Perfil:
{json.dumps(requisicao.perfil.dict(), indent=2)}

Pets:
{json.dumps([pet.dict() for pet in requisicao.pets], indent=2)}

Responda no formato:
[
  {{ "id": <id_do_pet>, "score": <valor> }},
  ...
]

sem nada mais de explicações.

"""

    try:
        resposta = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "Você compara perfis com pets e retorna compatibilidade."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        conteudo = resposta.choices[0].message.content
        result = json.loads(conteudo)
        return {"result": result}

    except json.JSONDecodeError:
        return {
            "erro": "A resposta do modelo não está em formato JSON válido.",
            "resposta_original": conteudo
        }
    except Exception as e:
        return {"erro": str(e)}

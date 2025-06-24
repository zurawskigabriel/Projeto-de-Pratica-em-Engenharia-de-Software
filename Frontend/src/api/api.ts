import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Importar Axios para controle de timeout

//const BASE_URL = "http://192.168.0.197:8080/api";
const BASE_URL = "http://192.168.0.48:8080/api";
const BASE_URL_GPT = "http://192.168.0.197:9000/api";

// URL do serviço de match (ajuste conforme necessário)
// const MATCH_ALLAN_URL = "http://127.0.0.1:9000"; // Endereço padrão do FastAPI
const MATCH_ALLAN_URL = "http://192.168.0.48:9000"; // Enderço Gabriel

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ... (todas as outras funções de API: solicitarAdocaoPet, criarUsuario, etc. permanecem as mesmas)
// ... (cole aqui todas as suas funções existentes que não foram alteradas)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// Solicitação de Adoção
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Para o Adotante: Cria uma nova solicitação de adoção para um pet.
 */
export async function solicitarAdocaoPet(idPet: number, idAdotante: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/solicitacoes-adocao/adotante`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ idPet, idAdotante }),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao solicitar adoção: ${erro}`);
  }

  return true;
}

/**
 * Para o Adotante: Busca o histórico de solicitações de um usuário específico.
 */
export async function buscarSolicitacoesUsuario(idUsuario: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/solicitacoes-adocao/adotante/${idUsuario}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    // Permite que uma resposta vazia (sem solicitações) não seja um erro.
    if (response.status === 404) return [];
    const texto = await response.text();
    throw new Error(`Erro ao buscar solicitações: ${texto}`);
  }
  
  return await response.json(); // deve retornar uma lista de solicitações
}

/**
 * Para o Protetor: Busca todas as solicitações de adoção para os pets de um protetor.
 */
export async function buscarSolicitacoesProtetor(idProtetor: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/solicitacoes-adocao/protetor/${idProtetor}`, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    if (response.status === 404) return [];
    const texto = await response.text();
    throw new Error(`Erro ao buscar solicitações do protetor: ${texto}`);
  }

  return await response.json();
}

/**
 * Para o Protetor: Busca todas as solicitações de adoção para um pet específico.
 */
export async function buscarSolicitacoesPorPet(idPet: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/solicitacoes-adocao/pet/${idPet}/situacao`, {
    method: 'GET',
    headers,
  });

  if (response.status === 404) {
    // É normal um pet não ter solicitações, retorna lista vazia.
    return [];
  }

  if (!response.ok) {
    const textoErro = await response.text();
    console.error(`❌ Erro ao buscar solicitações do pet: ${response.status}`, textoErro);
    throw new Error(`Erro ${response.status}: ${textoErro}`);
  }

  return await response.json();
}

/**
 * Para o Protetor: Atualiza a situação de uma solicitação (Aceita ou Recusada).
 */
export async function atualizarSituacaoSolicitacao(idSolicitacao: number, novaSituacao: 'Aceita' | 'Recusada') {
    const headers = await getAuthHeaders();

    const response = await fetch(`${BASE_URL}/solicitacoes-adocao/${idSolicitacao}/situacao`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ situacao: novaSituacao }),
    });

    if (!response.ok) {
        const erro = await response.text();
        throw new Error(`Erro ao atualizar situação da adoção: ${erro}`);
    }

    return true;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// Usuário
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function criarUsuario(dadosUsuario) {
  const response = await fetch(`${BASE_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dadosUsuario),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao criar usuário: ${erro}`);
  }

  return await response.json();
}

export async function fazerLogin(username: string, password: string) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro no login: ${erro}`);
  }

  return await response.json(); // espera-se { token, userId }
}

export async function buscarUsuarioPorId(id: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao buscar usuário: ${erro}`);
  }

  return await response.json();
}

export async function excluirUsuario(id: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao excluir usuário: ${erro}`);
  }

  return true;
}
export async function atualizarUsuario(id, dados) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao atualizar usuário: ${erro}`);
  }

  return await response.json();
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// Pet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function criarPet(dadosPet) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/pets`, {
    method: "POST",
    headers,
    body: JSON.stringify(dadosPet),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao criar pet: ${erro}`);
  }

  return await response.json();
}

export async function buscarPet(id: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/pets/${id}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao buscar pet: ${erro}`);
  }

  return await response.json();
}

export async function listarPets() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/pets`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao listar pets: ${erro}`);
  }

  return await response.json();
}

export async function deletarPet(id: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/pets/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao deletar pet: ${erro}`);
  }

  return true;
}

export async function atualizarPet(id: number, dadosPet) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/pets/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(dadosPet),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao atualizar pet: ${erro}`);
  }

  return await response.json();
}

export async function favoritarPet(idUsuario: number, idPet: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/pets-favoritos`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ idUsuario, idPet }),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao favoritar pet: ${erro}`);
  }

  return true;
}

export async function listarFavoritosDoUsuario(idUsuario: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/pets-favoritos/${idUsuario}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao buscar favoritos: ${erro}`);
  }

  return await response.json();
}

export async function desfavoritarPet(idUsuario: number, idPet: number) {
    const headers = await getAuthHeaders();

  const resposta = await fetch(`${BASE_URL}/pets-favoritos/${idUsuario}/${idPet}`, {
    method: 'DELETE',
    headers,
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao desfavoritar o pet (status: ${resposta.status})`);
  }

  return true;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// Perfil de Match
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Busca o perfil de match de um usuário.
 * Retorna o perfil ou null se não existir.
 */
export async function buscarPerfilMatch(idUsuario: number) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/perfil-match/usuario/${idUsuario}`, {
    method: 'GET',
    headers,
  });

  if (response.status === 404) {
    return null; // Perfil não encontrado, o que é um estado válido
  }

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao buscar perfil de match: ${erro}`);
  }

  return await response.json();
}

/**
 * Salva ou atualiza o perfil de match de um usuário.
 */
export async function salvarPerfilMatch(idUsuario: number, dadosPerfil: any) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/perfil-match/usuario/${idUsuario}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(dadosPerfil),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao salvar o perfil de match: ${erro}`);
  }

  return await response.json();
}

/**
 * Exclui o perfil de match de um usuário.
 */
export async function excluirPerfilMatch(idUsuario: number) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/perfil-match/usuario/${idUsuario}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok && response.status !== 404) {
    const erro = await response.text();
    throw new Error(`Erro ao excluir o perfil de match: ${erro}`);
  }

  return true; // Sucesso na exclusão ou perfil já não existia
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
// Funções de Match com o backend match_allan (ASSÍNCRONO)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Transforma o perfil do usuário para o formato esperado pela API de Match.
 * ESTA FUNÇÃO CORRIGE O BUG DE INCOMPATIBILIDADE DE DADOS.
 */
function formatarPerfilParaMatchAPI(perfilUsuario: any) {
    // Valores padrão para evitar erros se os campos estiverem ausentes
    const especie = perfilUsuario.especiePreferida || 'ambos';
    const sexo = perfilUsuario.sexoPreferido || 'ambos';
    const porte = perfilUsuario.portePreferido || 'todos';

    return {
        id: perfilUsuario.id || 0,
        usuarioId: perfilUsuario.idUsuario,
        gato: especie === 'gato' || especie === 'ambos',
        cachorro: especie === 'cachorro' || especie === 'ambos',
        macho: sexo === 'macho' || sexo === 'ambos',
        femea: sexo === 'femea' || sexo === 'ambos',
        pequeno: porte === 'pequeno' || porte === 'todos',
        medio: porte === 'medio' || porte === 'todos',
        grande: porte === 'grande' || porte === 'todos',
        conviveBem: perfilUsuario.conviveBemComOutrosAnimais || false,
        necessidadesEspeciais: perfilUsuario.aceitaPetComNecessidadesEspeciais || false,
        raca: perfilUsuario.racaPreferida || 'qualquer',
    };
}


/**
 * 1. Inicia a avaliação de match no backend.
 */
export async function iniciarAvaliacaoMatch(userId: number, perfilUsuario: any, pets: any[]) {
  if (!perfilUsuario || !pets || pets.length === 0) {
    throw new Error("Perfil do usuário ou lista de pets ausente para iniciar a avaliação.");
  }
  
  const perfilFormatado = formatarPerfilParaMatchAPI(perfilUsuario);

  const petsFormatados = pets.map(p => ({
    id: p.id,
    nome: p.nome || "N/I",
    especie: p.especie || "N/I",
    sexo: p.sexo || "N/I",
    porte: p.porte || "N/I",
    raca: p.raca || "N/I",
    idadeAno: p.idadeAno || 0,
    idadeMes: p.idadeMes || 0,
    peso: p.peso || 0,
    bio: p.bio || "",
    idUsuario: p.idUsuario,
    fotos: p.fotos || [],
    historicoMedico: p.historicoMedico || [],
  }));

  const requestBody = {
    perfil: perfilFormatado,
    pets: petsFormatados,
  };

  try {
    const response = await axios.post(`${MATCH_ALLAN_URL}/avaliar/${userId}`, requestBody, {
        timeout: 15000 // Timeout curto, pois a resposta deve ser imediata
    });
    
    // A API deve retornar 200 ou 202 com uma mensagem de sucesso
    if (response.status === 200 || response.status === 202) {
        console.log("Servidor iniciou a avaliação de match.");
        return true;
    } else {
        throw new Error(`Resposta inesperada do servidor ao iniciar avaliação: ${response.status}`);
    }
  } catch (error) {
    console.error("Erro ao iniciar a avaliação de match:", error);
    throw new Error(`Não foi possível iniciar a avaliação de compatibilidade. Tente novamente. Detalhes: ${error.message}`);
  }
}

/**
 * 2. Verifica o status da avaliação de match (polling).
 */
export async function verificarStatusMatch(userId: number) {
    try {
        const response = await axios.get(`${MATCH_ALLAN_URL}/avaliar/status/${userId}`, {
            timeout: 10000 // Timeout de 10 segundos
        });
        return response.data; // Deve retornar { status: 'processing' | 'completed' | 'error', result?: [...], message?: '...' }
    } catch (error) {
        console.error("Erro ao verificar status do match:", error);
        // Retorna um estado de erro para ser tratado na UI
        return { status: 'error', message: 'Não foi possível contatar o serviço de match.' };
    }
}

/**
 * 3. Limpa o resultado do match do servidor.
 */
export async function limparResultadoMatch(userId: number) {
    try {
        await axios.delete(`${MATCH_ALLAN_URL}/avaliar/resultado/${userId}`, {
            timeout: 10000
        });
        console.log("Resultado do match limpo no servidor.");
        return true;
    } catch (error) {
        console.error("Erro ao limpar resultado do match no servidor:", error);
        return false;
    }
}


export async function buscarPerfilMatchUsuario(userId) {
  // Simula perfil preenchido para alguns usuários
  if (userId === 1) {
    return {
      idUsuario: 1,
      especiePreferida: 'cachorro',
      faixaEtaria: 'jovem',
      porte: 'médio',
    };
  }
  // Simula perfil não preenchido
  return {};
} 
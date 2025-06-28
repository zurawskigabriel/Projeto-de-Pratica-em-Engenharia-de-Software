import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Importar Axios para controle de timeout

//const BASE_URL = "http://172.17.192.1:8080/api"; // Endereço Allan
const BASE_URL = "http://172.17.192.1:8080/api";    // Endereço Gabriel

// const MATCH_ALLAN_URL = "http://172.17.192.1:9000"; // Endereço padrão do FastAPI (Allan)
const MATCH_ALLAN_URL = "http://172.17.192.1:9000"; // Endereço Gabriel

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

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

export async function buscarUsuarioPorId(id: number, token: string) {
  // Não chame getAuthHeaders(). Crie os cabeçalhos diretamente aqui.
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'GET',
    headers, // Use os cabeçalhos recém-criados
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
 * O objeto do perfil já vem com a estrutura correta, então esta função
 * apenas garante a tipagem correta dos dados antes do envio.
 */
function formatarPerfilParaMatchAPI(perfilUsuario: any) {
  // O objeto 'perfilUsuario' já vem no formato correto.
  // Apenas garantimos que os tipos estão corretos e que campos essenciais existem.
  if (perfilUsuario.usuarioId == null) { // Checa tanto null quanto undefined
    throw new Error("O 'usuarioId' está ausente no perfil recebido e é obrigatório.");
  }

  return {
    id: Number(perfilUsuario.id || 0),
    usuarioId: Number(perfilUsuario.usuarioId),
    gato: Boolean(perfilUsuario.gato),
    cachorro: Boolean(perfilUsuario.cachorro),
    macho: Boolean(perfilUsuario.macho),
    femea: Boolean(perfilUsuario.femea),
    pequeno: Boolean(perfilUsuario.pequeno),
    medio: Boolean(perfilUsuario.medio),
    grande: Boolean(perfilUsuario.grande),
    conviveBem: Boolean(perfilUsuario.conviveBem),
    necessidadesEspeciais: Boolean(perfilUsuario.necessidadesEspeciais),
    raca: String(perfilUsuario.raca || ''),
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

  const petsFormatados = pets.map(p => {
      // Garante que o pet seja um objeto válido para evitar erros
      if (!p || typeof p !== 'object') {
          return null; // ou lançar um erro, ou continuar
      }

      return {
          id: Number(p.id) || 0,
          nome: String(p.nome || "Não informado"),
          especie: String(p.especie || "Não informada"),
          sexo: String(p.sexo || "Não informado"),
          porte: String(p.porte || "Não informado"),
          raca: String(p.raca || "Não informada"),
          idadeAno: Number(p.idadeAno) || 0,
          idadeMes: Number(p.idadeMes) || 0,
          peso: parseFloat(String(p.peso)) || 0.0,
          bio: String(p.bio || ""),
          idUsuario: Number(p.idUsuario) || 0,
          fotos: Array.isArray(p.fotos) ? p.fotos : [],
          historicoMedico: Array.isArray(p.historicoMedico) ? p.historicoMedico : []
      };
  }).filter(p => p !== null); // Remove pets que eram inválidos

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

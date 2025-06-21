import AsyncStorage from '@react-native-async-storage/async-storage';

//const BASE_URL = "http://192.168.0.197:8080/api";
const BASE_URL = "http://192.168.0.48:8080/api";
const BASE_URL_GPT = "http://192.168.0.197:9000/api";

export async function buscarSolicitacoesUsuario(idUsuario: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/solicitacoes-adocao/adotante/${idUsuario}`, {
    method: 'GET',
    headers,
  });

  const texto = await response.text();

  if (!response.ok) {
    //throw new Error(`Erro ao buscar solicitações: ${texto}`);
  }
  
  return JSON.parse(texto); // deve retornar uma lista de solicitações
}

export async function buscarSituacaoPet(idPet: number) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/solicitacoes-adocao/pet/${idPet}/situacao`, {
    method: 'GET',
    headers,
  });

  if (response.status === 404) {
    // Pet sem solicitações
    return [];
  }

  const textoErro = await response.text();

  if (!response.ok) {
    console.error(`❌ Erro ao buscar situação do pet: ${response.status}`, textoErro);
    //throw new Error(`Erro ${response.status}: ${textoErro}`);
  }

  return JSON.parse(textoErro);
}


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

// Simula busca de pontuação de match para cada pet (score aleatório entre 0 e 100)
export async function buscarPontuacaoMatch(pets) {
  return pets.map(pet => ({
    id: pet.id,
    score: Math.random() * 100, // score aleatório entre 0 e 100
  }));
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



async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export function gerarLinkPet(id: number): string {
  return `${BASE_URL}/pets/${id}`;
}


// ---------------- USUÁRIO ----------------

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
    const erro = await response.text(); // ← aqui ainda pode usar text()
    throw new Error(`Erro ao atualizar usuário: ${erro}`);
  }

  return await response.json(); // retorna os dados atualizados
}


// ---------------- PETS ----------------

export async function buscarStatusPet(idDoPet: number) {
  const headers = await getAuthHeaders();

  try {
    const url = `${BASE_URL}/solicitacoes-adocao/pet/${idDoPet}/situacao`;
    console.log(`📡 Fazendo requisição para: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const textoErro = await response.text();

    if (!response.ok) {
      //console.error(`❌ Erro HTTP ao buscar status do pet ${idDoPet}:`, response.status, textoErro);
      //throw new Error(`Erro ${response.status}: ${textoErro}`);
    }

    const dados = JSON.parse(textoErro); // já pegou texto antes
    console.log(`✅ Resposta da API para pet ${idDoPet}:`, dados);

    return dados.length > 0 ? dados[dados.length - 1].situacao : 'Sem solicitação';

  } catch (err) {
    //console.error(`⚠️ Erro de rede ou código em buscarStatusPet(${idDoPet}):`, err.message);
    //throw err;
  }
}


export async function criarPet(dadosPet) {
  const token = await AsyncStorage.getItem('token');

  const response = await fetch(`${BASE_URL}/pets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ✅ Aqui garante que o Spring Security reconheça
    },
    body: JSON.stringify(dadosPet),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao criar pet: ${erro}`);
  }

  return await response.json();
}

export async function adicionarPet(dadosPet) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/pets`, {
    method: "POST",
    headers,
    body: JSON.stringify(dadosPet),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao adicionar pet: ${erro}`);
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

export async function listarPets(id: number) {
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

  return await response.json(); // retorna os dados atualizados do pet
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

  return await response.json(); // espera-se uma lista de objetos com idPet
}

export async function desfavoritarPet(idUsuario: number, idPet: number) {
  const token = await AsyncStorage.getItem('token'); // ou como você guarda

  const resposta = await fetch(`${BASE_URL}/pets-favoritos/${idUsuario}/${idPet}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao desfavoritar o pet (status: ${resposta.status})`);
  }

  return true;
}

// ---------------- PERFIL DE MATCH ----------------

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




// ... (resto do arquivo)


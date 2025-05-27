import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = "http://192.168.0.198:8080/api"; // IP do Allan
const BASE_URL = "http://192.168.0.48:8080/api"; // IP do Gabriel 

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
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

// ---------------- PETS ----------------

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
  console.log(`[api.ts] Iniciando buscarPet para id: ${id}`); // Log API 1
  const headers = await getAuthHeaders();
  const url = `${BASE_URL}/pets/${id}`;
  console.log(`[api.ts] URL da requisição: ${url}`); // Log API 2

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log(`[api.ts] Status da resposta para ${url}: ${response.status}`); // Log API 3

    if (!response.ok) {
      const erroText = await response.text(); // Tenta ler o corpo do erro como texto
      console.error(`[api.ts] Erro na API (status ${response.status}) para ${url}: ${erroText}`); // Log API 4
      throw new Error(`Erro ao buscar pet (status ${response.status}): ${erroText}`);
    }

    const data = await response.json();
    console.log(`[api.ts] Dados recebidos da API para ${url}:`, data); // Log API 5
    return data;

  } catch (error) {
    console.error(`[api.ts] Exceção na função buscarPet para id ${id}:`, error); // Log API 6
    // É importante re-lançar o erro para que o catch em TelaDetalhesPet possa lidar com ele e atualizar a UI.
    throw error;
  }
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

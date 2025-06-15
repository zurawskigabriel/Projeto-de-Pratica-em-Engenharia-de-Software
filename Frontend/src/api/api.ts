import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "http://192.168.0.197:8080/api";

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


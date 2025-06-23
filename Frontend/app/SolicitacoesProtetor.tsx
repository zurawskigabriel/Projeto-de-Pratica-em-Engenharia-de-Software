import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { buscarSolicitacoesProtetor, buscarPet } from '../src/api/api';

// Tipos
interface PetDetalhado {
  id: number;
  nome: string;
  especie: string;
  // Adicionar outros campos do pet que você queira exibir
}

interface SolicitacaoDetalhada {
  id: number; // id da solicitação
  idPet: number;
  idAdotante: number;
  nomeAdotante?: string; // Será buscado depois
  situacao: 'Pendente' | 'Aceita' | 'Recusada';
  // Adicionar outros campos da solicitação se necessário
}

interface PetComSuasSolicitacoes {
  petDetails: PetDetalhado;
  solicitacoes: SolicitacaoDetalhada[];
  numeroSolicitacoesPendentes: number;
}

export default function SolicitacoesScreen() {
  const router = useRouter();
  const [petsComSuasSolicitacoes, setPetsComSuasSolicitacoes] = useState<PetComSuasSolicitacoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Não precisamos mais de userId no estado, pois será pego direto no fetch

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idSalvo = await AsyncStorage.getItem('userId');
      if (!idSalvo) {
        setError('Usuário não logado. Por favor, faça login novamente.');
        setLoading(false);
        // router.replace('/Login'); // Considerar redirecionar
        return;
      }
      const protetorId = parseInt(idSalvo, 10);

      // 1. Buscar todas as solicitações para os pets deste protetor
      const todasSolicitacoesDoProtetor: SolicitacaoDetalhada[] = await buscarSolicitacoesProtetor(protetorId);

      if (todasSolicitacoesDoProtetor.length === 0) {
        setPetsComSuasSolicitacoes([]);
        setLoading(false);
        return;
      }

      // 2. Agrupar solicitações por petId
      const solicitacoesPorPetId: { [petId: number]: SolicitacaoDetalhada[] } = {};
      for (const s of todasSolicitacoesDoProtetor) {
        if (!solicitacoesPorPetId[s.idPet]) {
          solicitacoesPorPetId[s.idPet] = [];
        }
        solicitacoesPorPetId[s.idPet].push(s);
      }

      // 3. Para cada petId, buscar detalhes do pet e construir o objeto final
      const petsAgrupados: PetComSuasSolicitacoes[] = [];
      for (const petIdStr in solicitacoesPorPetId) {
        const petId = parseInt(petIdStr, 10);
        try {
          const detalhesPet: PetDetalhado = await buscarPet(petId); // buscarPet já existe na api.ts
          const solicitacoesDestePet = solicitacoesPorPetId[petId];
          const pendentes = solicitacoesDestePet.filter(s => s.situacao === 'Pendente').length;

          petsAgrupados.push({
            petDetails: detalhesPet,
            solicitacoes: solicitacoesDestePet,
            numeroSolicitacoesPendentes: pendentes,
          });
        } catch (petError) {
          console.warn(`Erro ao buscar detalhes para o pet ID ${petId}:`, petError);
          // Pode-se optar por não adicionar o pet ou adicionar com info de erro
        }
      }

      // Ordenar pets, por exemplo, por nome ou por número de solicitações pendentes
      petsAgrupados.sort((a, b) => b.numeroSolicitacoesPendentes - a.numeroSolicitacoesPendentes || a.petDetails.nome.localeCompare(b.petDetails.nome));


      setPetsComSuasSolicitacoes(petsAgrupados);
    } catch (err) {
      console.error('Erro ao carregar dados das solicitações:', err);
      setError('Falha ao carregar dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]); // router como dependência se for usado para redirecionamento

  // useFocusEffect para recarregar os dados quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const renderPetItem = ({ item }: { item: PetComSuasSolicitacoes }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => router.push({
        pathname: '/DetalhesSolicitacaoProtetor', // Nome da rota para a próxima tela
        params: { petId: item.petDetails.id, nomePet: item.petDetails.nome }
      })}
    >
      <Image
        source={item.petDetails.especie?.toLowerCase().includes('cachorro') ? require('../assets/dog.jpg') : require('../assets/cat.jpg')}
        style={styles.petImage}
      />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.petDetails.nome}</Text>
        <Text style={styles.solicitacoesInfo}>
          {item.solicitacoes.length} {item.solicitacoes.length === 1 ? 'solicitação' : 'solicitações no total'}
        </Text>
        {item.numeroSolicitacoesPendentes > 0 ? (
          <Text style={styles.solicitacoesPendentes}>
            {item.numeroSolicitacoesPendentes} pendente{item.numeroSolicitacoesPendentes > 1 ? 's' : ''}
          </Text>
        ) : (
          <Text style={styles.nenhumaPendente}>Nenhuma solicitação pendente</Text>
        )}
      </View>
      <Text style={styles.verDetalhesIcon}>➔</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Carregando suas solicitações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (petsComSuasSolicitacoes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyMessage}>Nenhum dos seus pets possui solicitações de adoção no momento.</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Verificar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={petsComSuasSolicitacoes}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.petDetails.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.title}>Solicitações de Adoção Recebidas</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007bff"]} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8', // Um tom de fundo mais suave
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#2c3e50', // Cor mais escura para o título
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  petCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5, // Elevação para Android
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: 35, // Perfeitamente circular
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#e0e0e0'
  },
  petInfo: {
    flex: 1, // Ocupa o espaço restante
  },
  petName: {
    fontSize: 20,
    fontWeight: '600', // Um pouco mais de peso na fonte
    color: '#34495e', // Cor escura para o nome
    marginBottom: 4,
  },
  solicitacoesInfo: {
    fontSize: 15,
    color: '#7f8c8d', // Cinza para informações secundárias
    marginBottom: 2,
  },
  solicitacoesPendentes: {
    fontSize: 14,
    color: '#e67e22', // Laranja para pendentes
    fontWeight: '500',
  },
  nenhumaPendente: {
    fontSize: 14,
    color: '#2ecc71', // Verde para indicar que não há pendências
    fontStyle: 'italic',
  },
  verDetalhesIcon: {
    fontSize: 22,
    color: '#3498db', // Azul para o ícone de navegação
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f4f6f8',
  },
  errorText: {
    color: '#e74c3c', // Vermelho para erro
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyMessage: {
    fontSize: 17,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { buscarSolicitacoesUsuario, buscarPet } from '../src/api/api'; // Ajustado para ../src

interface PetInfo {
  id: number;
  nome: string;
  especie: string;
  // Adicionar urlImagem se disponível no DTO do Pet
}

interface SolicitacaoAdotante {
  idSolicitacao: number;
  petInfo: PetInfo | null;
  situacao: 'Pendente' | 'Aceita' | 'Recusada';
  dataSolicitacao?: string; // Opcional
  // Adicionar idPet para buscar detalhes do pet
  idPet: number;
}

export default function DetalhesSolicitacaoAdotanteScreen() {
  const router = useRouter();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAdotante[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSolicitacoesAdotante = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idSalvo = await AsyncStorage.getItem('userId');
      if (!idSalvo) {
        setError('Usuário não logado.');
        setLoading(false);
        // router.replace('/Login'); // Opcional
        return;
      }
      const adotanteId = parseInt(idSalvo, 10);

      const minhasSolicitacoesApi = await buscarSolicitacoesUsuario(adotanteId);

      if (minhasSolicitacoesApi.length === 0) {
        setSolicitacoes([]);
        setLoading(false);
        return;
      }

      const solicitacoesComDetalhes: SolicitacaoAdotante[] = await Promise.all(
        minhasSolicitacoesApi.map(async (sol) => {
          let petDetalhes: PetInfo | null = null;
          try {
            if (sol.idPet) {
              const petApi = await buscarPet(sol.idPet);
              petDetalhes = { id: petApi.id, nome: petApi.nome, especie: petApi.especie };
            }
          } catch (e) {
            console.warn(`Erro ao buscar informações do pet ID ${sol.idPet}:`, e);
          }
          return {
            idSolicitacao: sol.id, // Assumindo que 'id' no DTO é o id da solicitação
            idPet: sol.idPet,
            petInfo: petDetalhes,
            situacao: sol.situacao,
            // dataSolicitacao: sol.data // Se existir
          };
        })
      );

      // Ordenar: Pendentes primeiro, depois Aceitas, depois Recusadas
      solicitacoesComDetalhes.sort((a, b) => {
        const situacaoOrder = { 'Pendente': 0, 'Aceita': 1, 'Recusada': 2 };
        if (situacaoOrder[a.situacao] !== situacaoOrder[b.situacao]) {
            return situacaoOrder[a.situacao] - situacaoOrder[b.situacao];
        }
        return (a.petInfo?.nome || '').localeCompare(b.petInfo?.nome || '');
      });

      setSolicitacoes(solicitacoesComDetalhes);
    } catch (err) {
      console.error('Erro ao buscar solicitações do adotante:', err);
      setError('Falha ao carregar suas solicitações. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSolicitacoesAdotante();
    }, [fetchSolicitacoesAdotante])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSolicitacoesAdotante();
  }, [fetchSolicitacoesAdotante]);

  const getStatusStyle = (situacao: 'Pendente' | 'Aceita' | 'Recusada') => {
    switch (situacao) {
      case 'Aceita':
        return styles.statusAceita;
      case 'Recusada':
        return styles.statusRecusada;
      case 'Pendente':
      default:
        return styles.statusPendente;
    }
  };

  const getStatusBorderColor = (situacao: 'Pendente' | 'Aceita' | 'Recusada') => {
    switch (situacao) {
      case 'Aceita':
        return '#2ecc71'; // Verde
      case 'Recusada':
        return '#e74c3c'; // Vermelho
      case 'Pendente':
      default:
        return '#f39c12'; // Laranja
    }
  };

  const renderSolicitacaoItem = ({ item }: { item: SolicitacaoAdotante }) => (
    <TouchableOpacity
        style={[styles.solicitacaoCard, {borderColor: getStatusBorderColor(item.situacao)}]}
        onPress={() => router.push({ pathname: `/PerfilPet`, params: { id: item.idPet }})} // Navega para o perfil do Pet
    >
      <Image
        source={item.petInfo?.especie?.toLowerCase().includes('cachorro') ? require('../assets/dog.jpg') : require('../assets/cat.jpg')}
        style={styles.petImage}
      />
      <View style={styles.solicitacaoInfo}>
        <Text style={styles.petName}>
          Pet: {item.petInfo?.nome || 'Nome indisponível'}
        </Text>
        <Text style={[styles.statusText, getStatusStyle(item.situacao)]}>
          Situação: {item.situacao}
        </Text>
        {/* <Text style={styles.dataText}>Data: {item.dataSolicitacao || 'N/A'}</Text> */}
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
        <TouchableOpacity onPress={fetchSolicitacoesAdotante} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (solicitacoes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyMessage}>Você ainda não fez nenhuma solicitação de adoção.</Text>
         <TouchableOpacity onPress={() => router.push('/Explorar')} style={styles.exploreButton}>
            <Text style={styles.retryButtonText}>Explorar Pets</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>&lt; Voltar ao Perfil</Text>
        </TouchableOpacity>
      <FlatList
        data={solicitacoes}
        renderItem={renderSolicitacaoItem}
        keyExtractor={(item) => item.idSolicitacao.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.title}>Minhas Solicitações de Adoção</Text>}
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
    backgroundColor: '#f4f6f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#2c3e50',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  solicitacaoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    borderLeftWidth: 6,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  solicitacaoInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  statusPendente: { color: '#f39c12' /* Laranja */ },
  statusAceita: { color: '#2ecc71' /* Verde */ },
  statusRecusada: { color: '#e74c3c' /* Vermelho */ },
  // dataText: { fontSize: 13, color: '#95a5a6' },
  verDetalhesIcon: {
    fontSize: 20,
    color: '#3498db',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f4f6f8',
  },
  errorText: {
    color: '#e74c3c',
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
  exploreButton: {
    backgroundColor: '#27ae60', // Verde
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
   backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    margin:10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
  }
});

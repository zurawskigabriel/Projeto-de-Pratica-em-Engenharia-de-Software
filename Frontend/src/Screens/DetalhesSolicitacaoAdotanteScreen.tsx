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
import { buscarSolicitacoesUsuario, buscarPet } from '../api/api';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

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
        source={item.petInfo?.especie?.toLowerCase().includes('cachorro') ? require('../../assets/dog.jpg') : require('../../assets/cat.jpg')}
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
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONTS.sizeXLarge,
    fontFamily: FONTS.familyBold,
    textAlign: 'center',
    marginVertical: SIZES.spacingLarge,
    color: COLORS.dark,
  },
  listContainer: {
    paddingHorizontal: SIZES.spacingRegular,
    paddingBottom: SIZES.spacingLarge,
  },
  solicitacaoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingRegular,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.regular,
    borderLeftWidth: 6, // Mantido para diferenciação de status
  },
  petImage: {
    width: SIZES.wp(15), // ~60px
    height: SIZES.wp(15),
    borderRadius: SIZES.wp(7.5), // Metade da largura para ser círculo
    marginRight: SIZES.spacingMedium,
    borderWidth: SIZES.borderWidthThin,
    borderColor: COLORS.borderColor,
  },
  solicitacaoInfo: {
    flex: 1,
  },
  petName: {
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginBottom: SIZES.spacingTiny,
  },
  statusText: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    marginBottom: SIZES.spacingMicro,
  },
  statusPendente: { color: COLORS.statusPendente },
  statusAceita: { color: COLORS.statusAceita },
  statusRecusada: { color: COLORS.statusRecusada },
  verDetalhesIcon: {
    fontSize: FONTS.sizeLarge, // Aumentado um pouco para ser mais clicável
    color: COLORS.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingLarge,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    textAlign: 'center',
    marginBottom: SIZES.spacingRegular,
  },
  emptyMessage: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacingRegular,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadiusRegular,
    marginTop: SIZES.spacingSmall,
    ...SHADOWS.light,
  },
  exploreButton: {
    backgroundColor: COLORS.success, // Usando cor de sucesso do tema
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadiusRegular,
    marginTop: SIZES.spacingSmall,
    ...SHADOWS.light,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
  },
  backButton: {
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingRegular,
    alignSelf: 'flex-start',
    // margin: SIZES.spacingSmall, // Removido margin para usar padding no container se necessário
    // borderRadius: SIZES.borderRadiusSmall, // Removido para parecer mais um link de texto
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold, // Deixando bold para mais destaque
  },
});

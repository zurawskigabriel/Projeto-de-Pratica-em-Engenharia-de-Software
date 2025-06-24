import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { buscarSolicitacoesPorPet, buscarUsuarioPorId, atualizarSituacaoSolicitacao } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

interface Adotante {
  id: number;
  nome: string;
  // outros campos do usuário se necessário
}

interface SolicitacaoComAdotante {
  idSolicitacao: number; // ID da própria solicitação
  idPet: number;
  adotante: Adotante | null; // Adotante pode ser null inicialmente ou se houver erro
  situacao: 'Pendente' | 'Aceita' | 'Recusada';
  dataSolicitacao?: string; // Opcional, se disponível
}

export default function DetalhesSolicitacaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string; nomePet?: string }>();
  const petId = params.petId ? parseInt(params.petId, 10) : null;
  const nomePet = params.nomePet || 'Pet';

  const [solicitacoesComAdotantes, setSolicitacoesComAdotantes] = useState<SolicitacaoComAdotante[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protetorId, setProtetorId] = useState<number | null>(null);

  useEffect(() => {
    const loadProtetorId = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (id) setProtetorId(parseInt(id, 10));
    };
    loadProtetorId();
  }, []);

  const fetchDetalhesSolicitacoes = useCallback(async () => {
    if (!petId) {
      setError('ID do Pet não fornecido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const solicitacoesApi = await buscarSolicitacoesPorPet(petId);

      if (solicitacoesApi.length === 0) {
        setSolicitacoesComAdotantes([]);
        setLoading(false);
        return;
      }

      const detalhesCompletos: SolicitacaoComAdotante[] = await Promise.all(
        solicitacoesApi.map(async (sol) => {
          let adotanteInfo: Adotante | null = null;
          try {
            // O DTO da solicitação já deve vir com idAdotante
            if (sol.idAdotante) {
              const userInfo = await buscarUsuarioPorId(sol.idAdotante);
              adotanteInfo = { id: userInfo.id, nome: userInfo.nome };
            }
          } catch (e) {
            console.warn(`Erro ao buscar informações do adotante ID ${sol.idAdotante}:`, e);
          }
          return {
            idSolicitacao: sol.id, // Assumindo que 'id' no DTO é o id da solicitação
            idPet: sol.idPet,
            adotante: adotanteInfo,
            situacao: sol.situacao,
            // dataSolicitacao: sol.data // Se existir no DTO
          };
        })
      );

      // Ordenar: Pendentes primeiro, depois por nome do adotante ou data
      detalhesCompletos.sort((a, b) => {
        if (a.situacao === 'Pendente' && b.situacao !== 'Pendente') return -1;
        if (a.situacao !== 'Pendente' && b.situacao === 'Pendente') return 1;
        // Aqui pode adicionar mais critérios, como data da solicitação
        return (a.adotante?.nome || '').localeCompare(b.adotante?.nome || '');
      });

      setSolicitacoesComAdotantes(detalhesCompletos);
    } catch (err) {
      console.error(`Erro ao buscar detalhes das solicitações para o pet ${petId}:`, err);
      setError('Falha ao carregar os detalhes das solicitações.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      if (petId) { // Garante que petId está disponível antes de buscar
        fetchDetalhesSolicitacoes();
      }
    }, [petId, fetchDetalhesSolicitacoes]) // Adiciona petId como dependência
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDetalhesSolicitacoes();
  }, [fetchDetalhesSolicitacoes]);

  const handleAtualizarSituacao = async (idSolicitacao: number, novaSituacao: 'Aceita' | 'Recusada') => {
    Alert.alert(
      `Confirmar ${novaSituacao === 'Aceita' ? 'Aceitação' : 'Recusa'}`,
      `Tem certeza que deseja ${novaSituacao === 'Aceita' ? 'aceitar' : 'recusar'} esta solicitação?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await atualizarSituacaoSolicitacao(idSolicitacao, novaSituacao);
              Alert.alert('Sucesso!', `Solicitação ${novaSituacao === 'Aceita' ? 'aceita' : 'recusada'}.`);
              // Atualizar a lista localmente ou rebuscar
              setSolicitacoesComAdotantes(prev =>
                prev.map(s =>
                  s.idSolicitacao === idSolicitacao ? { ...s, situacao: novaSituacao } : s
                )
              );
            } catch (error) {
              console.error('Erro ao atualizar situação:', error);
              Alert.alert('Erro', 'Não foi possível atualizar a situação da solicitação.');
            }
          },
        },
      ]
    );
  };

  const renderSolicitacaoItem = ({ item }: { item: SolicitacaoComAdotante }) => (
    <View style={[styles.solicitacaoCard, styles[`status${item.situacao}`]]}>
      <View style={styles.solicitacaoInfo}>
        <Text style={styles.adotanteNome}>
          Adotante: {item.adotante?.nome || 'Nome não disponível'}
        </Text>
        <Text style={styles.adotanteId}>
          ID do Adotante: {item.adotante?.id || 'N/A'}
        </Text>
        <Text style={styles.statusText}>
          Situação: <Text style={styles.statusValue}>{item.situacao}</Text>
        </Text>
        {/* <Text style={styles.dataText}>Data: {item.dataSolicitacao || 'N/A'}</Text> */}
      </View>
      {item.situacao === 'Pendente' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.aceitarButton]}
            onPress={() => handleAtualizarSituacao(item.idSolicitacao, 'Aceita')}
          >
            <Text style={styles.actionButtonText}>Aceitar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.recusarButton]}
            onPress={() => handleAtualizarSituacao(item.idSolicitacao, 'Recusada')}
          >
            <Text style={styles.actionButtonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (!petId) { // Checagem adicional caso a navegação falhe em passar o petId
    return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>Erro: ID do Pet não encontrado.</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Carregando detalhes das solicitações para {nomePet}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchDetalhesSolicitacoes} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (solicitacoesComAdotantes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyMessage}>Nenhuma solicitação de adoção para {nomePet} no momento.</Text>
        <TouchableOpacity onPress={fetchDetalhesSolicitacoes} style={styles.retryButton}>
             <Text style={styles.retryButtonText}>Verificar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>&lt; Voltar para Lista de Pets</Text>
        </TouchableOpacity>
      <FlatList
        data={solicitacoesComAdotantes}
        renderItem={renderSolicitacaoItem}
        keyExtractor={(item) => item.idSolicitacao.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.title}>Solicitações para {nomePet}</Text>}
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
    paddingHorizontal: SIZES.spacingRegular, // Para evitar que o nome do pet quebre o layout
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
    ...SHADOWS.regular,
    borderLeftWidth: 6, // Mantido para diferenciação de status
  },
  statusPendente: { borderColor: COLORS.statusPendente },
  statusAceita: { borderColor: COLORS.statusAceita },
  statusRecusada: { borderColor: COLORS.statusRecusada },
  solicitacaoInfo: {
    marginBottom: SIZES.spacingSmall,
  },
  adotanteNome: {
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginBottom: SIZES.spacingTiny,
  },
  adotanteId: {
    fontSize: FONTS.sizeSmall,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingTiny,
  },
  statusText: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textLight,
    marginBottom: SIZES.spacingMicro,
  },
  statusValue: {
    fontFamily: FONTS.familyBold, // Para destacar o valor do status
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SIZES.spacingRegular,
    paddingTop: SIZES.spacingRegular,
    borderTopWidth: SIZES.borderWidthThin,
    borderTopColor: COLORS.borderColorLight,
  },
  actionButton: {
    paddingVertical: SIZES.spacingSmall,
    paddingHorizontal: SIZES.spacingMedium, // Aumentado um pouco para mais área de clique
    borderRadius: SIZES.borderRadiusRegular,
    minWidth: SIZES.wp(30), // ~30% da largura da tela
    alignItems: 'center',
    ...SHADOWS.light,
  },
  actionButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.sizeRegular,
  },
  aceitarButton: {
    backgroundColor: COLORS.success,
  },
  recusarButton: {
    backgroundColor: COLORS.danger,
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
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
  },
  backButton: {
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingRegular,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
  },
});

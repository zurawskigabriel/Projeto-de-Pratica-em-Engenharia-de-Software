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
import { buscarSolicitacoesProtetor, buscarPet } from '../api/api';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema
import FooterNav from '../components/Footer';

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
        source={item.petDetails.especie?.toLowerCase().includes('cachorro') ? require('../../assets/dog.jpg') : require('../../assets/cat.jpg')}
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
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Carregando suas solicitações...</Text>
        </View>
        <FooterNav />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
        <FooterNav />
      </View>
    );
  }

  if (petsComSuasSolicitacoes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyMessage}>Nenhum dos seus pets possui solicitações de adoção no momento.</Text>
          <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Verificar Novamente</Text>
          </TouchableOpacity>
        </View>
        <FooterNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
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
      <FooterNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
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
  petCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingRegular,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.regular,
  },
  petImage: {
    width: SIZES.wp(18), // ~70px
    height: SIZES.wp(18),
    borderRadius: SIZES.wp(9), // Circular
    marginRight: SIZES.spacingMedium,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: FONTS.sizeLarge, // Um pouco maior
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginBottom: SIZES.spacingTiny,
  },
  solicitacoesInfo: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingMicro,
  },
  solicitacoesPendentes: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold, // Bold para destacar
    color: COLORS.warning, // Usando warning do tema
  },
  nenhumaPendente: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.success, // Usando success do tema
    fontStyle: 'italic',
  },
  verDetalhesIcon: {
    fontSize: FONTS.sizeXLarge, // Maior para ser mais visível
    color: COLORS.primary,
    fontFamily: FONTS.familyBold, // Bold para o ícone
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingLarge,
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
});
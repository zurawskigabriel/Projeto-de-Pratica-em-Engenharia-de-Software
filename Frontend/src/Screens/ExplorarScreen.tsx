import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Dimensions, Modal,
  Pressable, StyleSheet, Alert, Platform
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // Adicionado useIsFocused
import {
  listarPets,
  listarFavoritosDoUsuario,
  favoritarPet,
  desfavoritarPet,
  buscarPontuacaoMatch,
  buscarPerfilMatch,
} from '../api/api';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';

const SEX_FILTERS = ['todos', 'M', 'F'];

const cardSpacingExplorar = SIZES.spacingRegular;
const cardWidthExplorar = (SIZES.wp(100) - cardSpacingExplorar * 3) / 2;
const cardHeightExplorar = SIZES.hp(28);

export default function ExplorarScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook para saber se a tela está focada
  const [data, setData] = useState<any[]>([]);
  const [listaOriginal, setListaOriginal] = useState<any[]>([]); // Lista de pets sem score de match
  const [favoritos, setFavoritos] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [canMatch, setCanMatch] = useState(false); // Indica se o usuário tem perfil de match
  const [matchActive, setMatchActive] = useState(false); // Indica se os scores de match estão sendo exibidos
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Função para carregar todos os pets e favoritos
  const loadAllPetsAndFavorites = async (userId: number) => {
    try {
      const [favAPI, allPetsResponse] = await Promise.all([
        listarFavoritosDoUsuario(userId),
        listarPets()
      ]);

      const favMap: { [key: number]: boolean } = {};
      favAPI.forEach(f => { if(f.idPet) favMap[f.idPet] = true; });
      setFavoritos(favMap);

      const allPets = allPetsResponse.filter(p => p);
      setListaOriginal(allPets); // Guarda a lista original sem scores
      setData(allPets); // Inicialmente, exibe todos os pets sem scores de match
      setMatchActive(false); // Garante que o modo match está desativado no carregamento inicial
    } catch (error) {
      console.error("Erro ao buscar dados dos pets ou favoritos:", error);
      Alert.alert("Erro", "Não foi possível carregar os pets. Tente atualizar.");
      setData([]);
      setListaOriginal([]);
    }
  };

  // Função principal para buscar dados e verificar perfil de match
  const fetchData = async (showAlertOnNoProfile = false) => {
    setLoading(true);
    const idStr = await AsyncStorage.getItem('userId');
    const userIdFromStorage = idStr ? parseInt(idStr, 10) : null;

    if (!userIdFromStorage) {
      Alert.alert("Usuário não autenticado.");
      setLoading(false);
      return;
    }
    setCurrentUserId(userIdFromStorage);

    // Carrega todos os pets e favoritos primeiro
    await loadAllPetsAndFavorites(userIdFromStorage);

    // Verifica o perfil de match
    let perfilOk = false;
    try {
      const perfil = await buscarPerfilMatch(userIdFromStorage);
      perfilOk = !!perfil;
    } catch (error) {
      console.warn("Erro ao buscar perfil match:", error);
      perfilOk = false;
    }
    setCanMatch(perfilOk);

    // Alerta para preencher o perfil de match na primeira carga, se aplicável
    if (showAlertOnNoProfile && !perfilOk) {
      const promptDismissed = await AsyncStorage.getItem('matchProfilePromptDismissed');
      if (promptDismissed !== 'true') {
        Alert.alert(
          'Complete seu Perfil de Match!',
          'Para encontrar os pets que mais combinam com você, que tal criar seu perfil de compatibilidade agora?',
          [
            {
              text: 'Criar Perfil',
              onPress: () => navigation.navigate('PerfilMatch'),
            },
            {
              text: 'Agora não',
              style: 'cancel',
              onPress: async () => {
                try {
                  await AsyncStorage.setItem('matchProfilePromptDismissed', 'true');
                } catch (e) {
                  console.error("Erro ao salvar dismiss do prompt:", e);
                }
              },
            },
          ],
          { cancelable: false }
        );
      }
    }
    setLoading(false);
    setIsFirstLoad(false);
  };

  // NOVO: Função para calcular e exibir os scores de match
  const calculateAndDisplayMatchScores = async () => {
    if (!currentUserId) {
      Alert.alert("Erro", "ID do usuário não disponível.");
      return;
    }
    setLoading(true);
    try {
      const perfilCompleto = await buscarPerfilMatch(currentUserId);
      if (!perfilCompleto) {
        Alert.alert(
          'Perfil de Match Não Encontrado',
          'Por favor, crie ou atualize seu perfil de match antes de calcular a compatibilidade.',
          [{ text: 'OK', onPress: () => navigation.navigate('PerfilMatch') }]
        );
        setLoading(false);
        setMatchActive(false);
        // Volta para a lista original sem scores se o perfil não for encontrado
        setData(listaOriginal);
        return;
      }

      const petsToEvaluate = listaOriginal.filter(p => p.idUsuario !== currentUserId); // Não avalia pets do próprio usuário
      const scores = await buscarPontuacaoMatch(perfilCompleto, petsToEvaluate);

      const enriched = listaOriginal.map(p => {
        const found = scores.find((s: any) => s.id === p.id);
        return { 
          ...p, 
          // Se o pet for do usuário logado, score é undefined para não mostrar % e não ser filtrado por match.
          // Se não for do usuário, usa o score encontrado ou 0 por padrão.
          score: p.idUsuario === currentUserId ? undefined : (found?.score ?? 0) 
        };
      }).sort((a, b) => {
        // Lógica de ordenação: pets com score vêm primeiro, depois pets sem score (do usuário)
        // E dentro dos com score, ordena do maior para o menor.
        if (a.score === undefined && b.score !== undefined) return 1; // a (sem score) depois de b (com score)
        if (a.score !== undefined && b.score === undefined) return -1; // a (com score) antes de b (sem score)
        if (a.score === undefined && b.score === undefined) return 0; // ambos sem score, mantém ordem
        return (b.score ?? 0) - (a.score ?? 0); // Ordena por score descendente
      });

      setData(enriched);
      setMatchActive(true); // Ativa o modo match (com scores exibidos)

    } catch (error) {
      console.error("Erro ao calcular e exibir scores de match:", error);
      Alert.alert("Erro", "Não foi possível calcular os scores de match.");
      setMatchActive(false);
      setData(listaOriginal); // Volta para a lista original em caso de erro
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (isFirstLoad) {
      fetchData(true); // Tenta buscar dados e alerta para perfil na primeira carga
    }
    // Ouve o foco da tela para atualizar dados (mas não alerta sobre perfil toda vez)
    const unsubscribe = navigation.addListener('focus', () => {
      // Se a tela for focada novamente (e não for a primeira carga), recarrega sem o alerta de perfil
      if (!isFirstLoad) {
        fetchData(false); 
      }
    });

    return unsubscribe;
  }, [navigation, isFirstLoad, isFocused]); // Adicionado isFocused para garantir re-renderização ao voltar para a tela

  const handleRefresh = () => {
    // Ao invés de chamar fetchData(false), garante que apenas os pets sejam recarregados e o match desativado
    fetchData(false); // Isso vai recarregar tudo e desativar o modo match
    setSearchTerm(''); // Limpa a busca
    setSelectedFilter('todos'); // Reseta o filtro
  };

  const toggleFav = async (pid: number) => {
    const idStr = await AsyncStorage.getItem('userId');
    const userId = parseInt(idStr || '', 10);
    if (!userId) return;
    const isFav = !!favoritos[pid];
    Alert.alert(
      isFav ? 'Remover dos favoritos?' : 'Adicionar aos favoritos?',
      '',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isFav ? 'Remover' : 'Adicionar',
          onPress: async () => {
            if (isFav) await desfavoritarPet(userId, pid);
            else await favoritarPet(userId, pid);
            setFavoritos(prev => ({ ...prev, [pid]: !isFav }));
          }
        }
      ]
    );
  };

  const filtered = data.filter(p => {
    const termo = searchTerm.toLowerCase();
    const ageStr = `${p.idadeAno}a ${p.idadeMes}m`.toLowerCase();
    
    // Filtro de busca
    const matchesSearch = 
      p.nome.toLowerCase().includes(termo) ||
      p.raca.toLowerCase().includes(termo) ||
      ageStr.includes(termo);

    if (!matchesSearch) return false;

    // Filtro de sexo
    if (selectedFilter !== 'todos' && p.sexo !== selectedFilter) return false;

    // Filtro de score: Mostrar pets com score 0 ou negativo apenas se o match NÃO estiver ativo
    // OU se o score for indefinido (meu pet), OU se o score for maior que 0.
    // Assim, removemos a linha problemática que escondia pets com score <= 0 quando o match estava ativo.
    // Agora, se o match estiver ativo, o pet será exibido com seu score (mesmo que 0), a menos que você queira filtrar
    // especificamente pets com score 0 para não aparecerem. Por padrão, deixarei aparecer.
    
    // Se você *ainda* quiser esconder pets com score 0 quando o match está ativo,
    // descomente e use a linha abaixo, mas considere se é a UX desejada:
    // if (matchActive && typeof p.score === 'number' && p.score <= 0 && p.idUsuario !== currentUserId) return false;
    
    return true;
  });

  // Removida a função ordenarMatch, que será substituída pelos novos botões

  const PetCardSquare = ({ item }: { item: any }) => {
    if (!item) return null;

    const isMyPet = item.idUsuario === currentUserId;
    const idadeAno = typeof item.idadeAno === 'number' ? item.idadeAno : 0;
    const idadeMes = typeof item.idadeMes === 'number' ? item.idadeMes : 0;
    const raca = item.raca || "N/I";
    const nome = item.nome || "Pet";

    const imgSrc = item.especie?.toLowerCase().includes('cachorro')
      ? require('../../assets/dog.jpg')
      : require('../../assets/cat.jpg');

    return (
      <TouchableOpacity
        style={[styles.cardSquare, isMyPet && styles.myPetCardOutlineSquare]}
        onPress={() => navigation.navigate('PerfilPet', { id: item.id })}
      >
        <Image source={imgSrc} style={styles.petImageSquare} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.shadowSquare} />

        {isMyPet && (
          <View style={styles.myPetIndicatorSquare}>
            <Ionicons name="home-sharp" size={SIZES.iconSmall - SIZES.spacingTiny} color={COLORS.white} />
          </View>
        )}

        <View style={styles.infoBoxSquare}>
          <View style={styles.nameRowSquare}>
            <Text style={styles.petNameSquare} numberOfLines={1}>{nome}</Text>
            {item.sexo && (
              <FontAwesome
                name={item.sexo === 'M' ? 'mars' : 'venus'}
                size={FONTS.sizeRegular}
                color={COLORS.white}
                style={styles.sexIconSquare}
              />
            )}
          </View>
          <Text style={styles.petSubSquare} numberOfLines={1}>
            {`${idadeAno}a ${idadeMes}m`}
          </Text>
        </View>

        <TouchableOpacity style={styles.favIconSquare} onPress={() => toggleFav(item.id)}>
          <FontAwesome
            name={favoritos[item.id] ? 'heart' : 'heart-o'}
            size={SIZES.iconMedium - SIZES.spacingTiny}
            color={favoritos[item.id] ? COLORS.danger : COLORS.white}
          />
        </TouchableOpacity>

        {matchActive && typeof item.score === 'number' && !isMyPet && (
          <View style={styles.scoreBadgeSquare}>
            <Ionicons name="flash" size={FONTS.sizeSmall} color={COLORS.white} />
            <Text style={styles.scoreTextSquare}>{`${item.score.toFixed(0)}%`}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const FilterModal = () => (
    <Modal visible={showFilter} transparent animationType="fade" onRequestClose={() => setShowFilter(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtrar por sexo</Text>
          {SEX_FILTERS.map(opt => (
            <Pressable
              key={opt}
              style={styles.filterOption}
              onPress={() => { setSelectedFilter(opt); setShowFilter(false); }}>
              <Text style={styles.filterOptionText}>
                {opt === 'todos' ? 'Todos' : opt === 'M' ? 'Machos' : 'Fêmeas'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topBarContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={SIZES.iconMedium} color={COLORS.textSecondary} />
          <TextInput
            placeholder="Buscar por nome, raça ou idade"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.input}
            placeholderTextColor={COLORS.textSecondary}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
            <Ionicons name="filter" size={SIZES.iconMedium} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <FilterModal />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2AA5FF" />
      ) : filtered.length > 0 ? (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainerSquare}
          renderItem={PetCardSquare}
          ListEmptyComponent={!loading && filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name="search" size={SIZES.iconLarge * 1.5} color={COLORS.textSecondary} style={{ opacity: 0.7 }} />
              <Text style={styles.emptyTitle}>Nenhum pet por aqui.</Text>
              <Text style={styles.emptySubtitle}>Tente ajustar sua busca ou filtros.</Text>
              {/* Botão para criar perfil de match na tela de vazio, se necessário */}
            </View>
          ) : null}
        />
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="paw" size={64} color="#B6E1FA" />
          <Text style={styles.emptyTitle}>Nenhum pet encontrado.</Text>
          {/* Botão para criar perfil de match na tela de vazio */}
        </View>
      )}

      <Footer />

      {/* Botões Flutuantes (FABs) */}
      {/* NOVO: Botão para ir para o Perfil de Match */}
      <TouchableOpacity
        style={styles.fabMatchProfileStyle}
        onPress={() => navigation.navigate('PerfilMatch')}
      >
        <Ionicons
          name="person-circle-outline" // Ícone representativo para perfil
          size={SIZES.iconLarge}
          color={COLORS.white}
        />
      </TouchableOpacity>

      {/* NOVO: Botão para Atualizar Scores de Match (substitui o antigo ordenarMatch) */}
      <TouchableOpacity
        style={[styles.fabUpdateMatchScoresStyle, !canMatch && styles.fabDisabled]}
        onPress={calculateAndDisplayMatchScores} // Nova função de callback
        disabled={!canMatch || loading} // Desabilita se não tiver perfil ou estiver carregando
      >
        <Ionicons
          name={matchActive ? "flame" : "flame-outline"} // Ícone de chama para match
          size={SIZES.iconLarge}
          color={canMatch ? COLORS.white : COLORS.buttonDisabledText}
        />
      </TouchableOpacity>

      {/* Botão de Refresh */}
      <TouchableOpacity
        style={styles.refreshFabStyle}
        onPress={handleRefresh}
      >
        <Ionicons name="refresh" size={SIZES.iconMedium} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingRegular,
    paddingTop: Platform.OS === 'android' ? SIZES.spacingLarge : SIZES.hp(5),
    paddingBottom: SIZES.spacingSmall,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: COLORS.background,
    ...SHADOWS.light,
  },
  searchBox: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SIZES.spacingMedium,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadiusCircle,
    height: SIZES.inputHeight,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizeRegular,
    marginLeft: SIZES.spacingSmall,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text,
  },
  filterBtn: {
    padding: SIZES.spacingSmall,
  },
  listContainerSquare: {
    paddingHorizontal: cardSpacingExplorar / 2,
    paddingTop: SIZES.hp(12),
    paddingBottom: SIZES.hp(12),
  },
  cardSquare: {
    width: cardWidthExplorar,
    height: cardHeightExplorar,
    borderRadius: SIZES.borderRadiusMedium,
    overflow: 'hidden',
    backgroundColor: COLORS.borderColorLight,
    ...SHADOWS.regular,
    marginBottom: cardSpacingExplorar,
    marginHorizontal: cardSpacingExplorar / 2,
    position: 'relative',
  },
  myPetCardOutlineSquare: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  petImageSquare: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shadowSquare: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: cardHeightExplorar * 0.5,
    borderBottomLeftRadius: SIZES.borderRadiusMedium,
    borderBottomRightRadius: SIZES.borderRadiusMedium,
  },
  infoBoxSquare: {
    position: 'absolute',
    bottom: SIZES.spacingSmall,
    left: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
  },
  nameRowSquare: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingTiny / 2,
  },
  petNameSquare: {
    color: COLORS.white,
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
    flexShrink: 1,
    marginRight: SIZES.spacingTiny,
  },
  sexIconSquare: {
    // Estilos adicionais, se necessário
  },
  petSubSquare: {
    color: COLORS.white,
    fontSize: FONTS.sizeSmall,
    fontFamily: FONTS.familyRegular,
  },
  favIconSquare: {
    position: 'absolute',
    top: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
    backgroundColor: `${COLORS.black}33`,
    padding: SIZES.spacingTiny,
    borderRadius: SIZES.borderRadiusCircle,
  },
  myPetIndicatorSquare: {
    position: 'absolute',
    top: SIZES.spacingSmall,
    left: SIZES.spacingSmall,
    backgroundColor: `${COLORS.primary}cc`,
    paddingHorizontal: SIZES.spacingTiny,
    paddingVertical: SIZES.spacingTiny / 1.5,
    borderRadius: SIZES.borderRadiusRegular,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    ...SHADOWS.light,
  },
  scoreBadgeSquare: {
    position: 'absolute',
    bottom: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
    backgroundColor: `${COLORS.black}59`,
    paddingHorizontal: SIZES.spacingSmall,
    paddingVertical: SIZES.spacingTiny,
    borderRadius: SIZES.borderRadiusSmall,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  scoreTextSquare: {
    color: COLORS.white,
    fontSize: FONTS.sizeXSmall,
    fontFamily: FONTS.familyBold,
    marginLeft: SIZES.spacingTiny / 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.hp(15),
    paddingHorizontal: SIZES.wp(10),
  },
  emptyTitle: {
    fontSize: FONTS.sizeXLarge,
    fontFamily: FONTS.familyBold,
    marginTop: SIZES.spacingLarge,
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.spacingSmall,
    lineHeight: FONTS.sizeRegular * 1.4,
  },
  emptyBtn: {
    marginTop: SIZES.spacingXLarge,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadiusCircle,
    ...SHADOWS.regular,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingLarge,
    width: SIZES.wp(80),
    ...SHADOWS.strong,
  },
  modalTitle: {
    fontSize: FONTS.sizeLarge,
    fontFamily: FONTS.familyBold,
    marginBottom: SIZES.spacingMedium,
    color: COLORS.text,
    textAlign: 'center',
  },
  filterOption: {
    paddingVertical: SIZES.spacingRegular,
    borderBottomWidth: SIZES.borderWidthThin,
    borderBottomColor: COLORS.borderColorLight,
  },
  filterOptionText: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text,
    textAlign: 'center',
  },
  // NOVO: Estilo para o botão de Perfil de Match
  fabMatchProfileStyle: {
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(24), // Posição acima dos outros FABs
    backgroundColor: COLORS.secondary, // Cor distinta
    width: SIZES.hp(6),
    height: SIZES.hp(6),
    borderRadius: SIZES.hp(3),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.regular,
    zIndex: 10,
  },
  // NOVO: Estilo para o botão de Atualizar Scores de Match
  fabUpdateMatchScoresStyle: {
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(17), // Abaixo do botão de perfil, acima do de refresh
    backgroundColor: COLORS.primary,
    width: SIZES.hp(7.5),
    height: SIZES.hp(7.5),
    borderRadius: SIZES.hp(3.75),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.strong,
    zIndex: 10,
  },
  fabDisabled: {
    backgroundColor: COLORS.buttonDisabledBackground,
    ...SHADOWS.light,
  },
  refreshFabStyle: {
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(10),
    backgroundColor: '#00BFFF', // Use uma cor diferente para o refresh
    width: SIZES.hp(6),
    height: SIZES.hp(6),
    borderRadius: SIZES.hp(3),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.regular,
    zIndex: 10,
  },
});
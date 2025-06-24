import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Dimensions, Modal,
  Pressable, StyleSheet, Alert, Platform // Platform foi adicionado na correção anterior
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
  const [data, setData] = useState<any[]>([]);
  const [listaOriginal, setListaOriginal] = useState<any[]>([]);
  const [favoritos, setFavoritos] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [canMatch, setCanMatch] = useState(false);
  const [matchActive, setMatchActive] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

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

      let perfilOk = false;
      try {
        const perfil = await buscarPerfilMatch(userIdFromStorage);
        perfilOk = !!perfil;
      } catch (error) {
        console.warn("Erro ao buscar perfil match:", error);
        perfilOk = false;
      }
      setCanMatch(perfilOk);

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

      try {
        const [favAPI, allPetsResponse] = await Promise.all([
          listarFavoritosDoUsuario(userIdFromStorage),
          listarPets()
        ]);

        const favMap: { [key: number]: boolean } = {};
        favAPI.forEach(f => { if(f.idPet) favMap[f.idPet] = true; });
        setFavoritos(favMap);

        const allPets = allPetsResponse.filter(p => p);
        setListaOriginal(allPets);

        if (perfilOk && allPets.length > 0) {
          const scores = await buscarPontuacaoMatch(allPets);
          const enriched = allPets.map(p => {
            const found = scores.find((s: any) => s.id === p.id);
            return { ...p, score: p.idUsuario === currentUserId ? undefined : (found?.score ?? 0) };
          }).sort((a, b) => {
            if (a.score === undefined && b.score !== undefined) return 1;
            if (a.score !== undefined && b.score === undefined) return -1;
            if (a.score === undefined && b.score === undefined) return 0;
            return (b.score ?? 0) - (a.score ?? 0);
          });
          setData(enriched);
          setMatchActive(true);
        } else {
          setData(allPets);
          setMatchActive(false);
        }
      } catch (error) {
        console.error("Erro ao buscar dados dos pets:", error);
        Alert.alert("Erro", "Não foi possível carregar os pets. Tente atualizar.");
        setData([]);
        setListaOriginal([]);
      } finally {
        setLoading(false);
        setIsFirstLoad(false);
      }
  };

  useEffect(() => {
    if (isFirstLoad) {
      fetchData(true);
    }
    const unsubscribe = navigation.addListener('focus', () => {
      if (!isFirstLoad) {
        // fetchData(false); // Removido para priorizar refresh manual
      }
    });

    return unsubscribe;
  }, [navigation, isFirstLoad]);

  const handleRefresh = () => {
    fetchData(false);
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
    if (
      !p.nome.toLowerCase().includes(termo) &&
      !p.raca.toLowerCase().includes(termo) &&
      !ageStr.includes(termo)
    ) return false;
    if (selectedFilter !== 'todos' && p.sexo !== selectedFilter) return false;
    if (p.score !== undefined && p.score <= 0 && matchActive) return false;
    return true;
  });

  const ordenarMatch = () => {
    if (!canMatch) {
      Alert.alert(
        'Disponível após criar perfil',
        'Crie seu perfil para ativar o botão.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Criar perfil', onPress: () => navigation.navigate('PerfilMatch') }
        ]
      );
      return;
    }
    if (matchActive) {
      setData(listaOriginal);
      setMatchActive(false);
    } else {
      const sorted = [...listaOriginal].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      setData(sorted);
      setMatchActive(true);
    }
  };

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
            {/* CORREÇÃO DO ERRO ABAIXO */}
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
              {!canMatch && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('PerfilMatch')}>
                  <Text style={styles.emptyBtnText}>Criar perfil match ❤️</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        />
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="paw" size={64} color="#B6E1FA" />
          <Text style={styles.emptyTitle}>Nenhum pet encontrado.</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('PerfilMatch')}>
            <Text style={styles.emptyBtnText}>Criar perfil match ❤️</Text>
          </TouchableOpacity>
        </View>
      )}

      <Footer />

      {/* Botões Flutuantes (FABs) */}
      <TouchableOpacity
        style={[styles.fabStyle, !canMatch && styles.fabDisabled]}
        onPress={ordenarMatch}
        disabled={!canMatch && loading}
      >
        <Ionicons
          name={matchActive ? "flame" : "flame-outline"}
          size={SIZES.iconLarge}
          color={canMatch ? COLORS.white : COLORS.buttonDisabledText}
        />
      </TouchableOpacity>

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
    backgroundColor: COLORS.background, // Fundo sólido para a barra superior
    ...SHADOWS.light, // Sombra para dar profundidade
  },
  searchBox: {
    flex: 1,
    backgroundColor: COLORS.cardBackground, // Fundo sólido para a caixa de pesquisa
    paddingHorizontal: SIZES.spacingMedium,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadiusCircle,
    height: SIZES.inputHeight,
    borderWidth: 1,
    borderColor: COLORS.borderColor, // Borda sutil
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizeRegular,
    marginLeft: SIZES.spacingSmall,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text, // Cor do texto
  },
  filterBtn: {
    padding: SIZES.spacingSmall,
  },
  // Botão de recarregar removido do topo
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
  fabStyle: {
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(17), // Movido para cima
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
  refreshFabStyle: { // Novo estilo para o botão de refresh flutuante
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(10), // Posicionado abaixo do botão de match
    backgroundColor: COLORS.secondary, // Cor diferente para distinguir
    width: SIZES.hp(6), // Um pouco menor que o FAB principal
    height: SIZES.hp(6),
    borderRadius: SIZES.hp(3),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.regular,
    zIndex: 10,
  },
});
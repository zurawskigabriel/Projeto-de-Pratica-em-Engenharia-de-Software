import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Modal,
  Pressable, StyleSheet, Alert, Platform
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
  listarPets,
  listarFavoritosDoUsuario,
  favoritarPet,
  desfavoritarPet,
  buscarPerfilMatch,
  iniciarAvaliacaoMatch,
  verificarStatusMatch,
  limparResultadoMatch
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
  const isFocused = useIsFocused();
  const [data, setData] = useState<any[]>([]);
  const [listaOriginal, setListaOriginal] = useState<any[]>([]);
  const [favoritos, setFavoritos] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [loading, setLoading] = useState(true); // Começa como true para mostrar o loading inicial
  const [showFilter, setShowFilter] = useState(false);
  const [canMatch, setCanMatch] = useState(false);
  const [matchActive, setMatchActive] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [isMatching, setIsMatching] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoadRef = useRef(true); // Usando ref para controlar o primeiro carregamento

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchData = async (showAlertOnNoProfile = false) => {
    setLoading(true);
    setMatchActive(false); // Desativa o match ao recarregar
    stopPolling(); // Para qualquer polling anterior

    try {
      const idStr = await AsyncStorage.getItem('userId');
      const userId = idStr ? parseInt(idStr, 10) : null;
      if (!userId) {
        Alert.alert("Usuário não autenticado.");
        setLoading(false);
        return;
      }
      setCurrentUserId(userId);

      const [favAPI, allPetsResponse] = await Promise.all([
        listarFavoritosDoUsuario(userId),
        listarPets()
      ]);
      const favMap: { [key: number]: boolean } = {};
      favAPI.forEach(f => { if(f.idPet) favMap[f.idPet] = true; });
      setFavoritos(favMap);

      const allPets = allPetsResponse.filter(p => p);
      setListaOriginal(allPets);
      setData(allPets);

      const perfil = await buscarPerfilMatch(userId);
      setCanMatch(!!perfil);

      if (showAlertOnNoProfile && !perfil) {
        const promptDismissed = await AsyncStorage.getItem('matchProfilePromptDismissed');
        if (promptDismissed !== 'true') {
          Alert.alert(
            'Complete seu Perfil de Match!',
            'Para encontrar os pets que mais combinam com você, que tal criar seu perfil de compatibilidade agora?',
            [
              { text: 'Criar Perfil', onPress: () => navigation.navigate('PerfilMatch') },
              {
                text: 'Agora não',
                style: 'cancel',
                onPress: async () => {
                  await AsyncStorage.setItem('matchProfilePromptDismissed', 'true');
                },
              },
            ],
            { cancelable: false }
          );
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os pets. Tente novamente.");
      setData([]);
      setListaOriginal([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchRequest = async () => {
    if (!currentUserId) {
      Alert.alert("Erro", "ID do usuário não disponível.");
      return;
    }
    setIsMatching(true);

    try {
      const perfilCompleto = await buscarPerfilMatch(currentUserId);
      console.log("Estrutura do Perfil Recebido:", JSON.stringify(perfilCompleto, null, 2));
      if (!perfilCompleto) {
        Alert.alert(
          'Perfil de Match Não Encontrado',
          'Por favor, crie seu perfil de match antes de calcular.',
          [{ text: 'OK', onPress: () => navigation.navigate('PerfilMatch') }]
        );
        setIsMatching(false);
        return;
      }
      
      const petsToEvaluate = listaOriginal.filter(p => p.idUsuario !== currentUserId);
      await iniciarAvaliacaoMatch(currentUserId, perfilCompleto, petsToEvaluate);

      pollingIntervalRef.current = setInterval(async () => {
        const statusResponse = await verificarStatusMatch(currentUserId);
        if (statusResponse.status === 'completed') {
          stopPolling();
          const scores = statusResponse.result || [];
          const enriched = listaOriginal.map(p => {
            const found = scores.find((s: any) => s.id === p.id);
            return { 
              ...p, 
              score: p.idUsuario === currentUserId ? undefined : (found?.score ?? 0) 
            };
          }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
          
          setData(enriched);
          setMatchActive(true);
          setIsMatching(false);
          await limparResultadoMatch(currentUserId);
          Alert.alert("Match Concluído!", "Encontramos os pets que mais combinam com você.");
        } else if (statusResponse.status === 'error') {
          stopPolling();
          setIsMatching(false);
          Alert.alert("Erro no Match", statusResponse.message || "Ocorreu um erro ao processar a compatibilidade.");
        }
      }, 5000);
    } catch (error) {
      stopPolling();
      setIsMatching(false);
      Alert.alert("Erro", error.message);
    }
  };

  // LÓGICA DE CARREGAMENTO CORRIGIDA
  useEffect(() => {
    if (isFocused) {
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false; // Marca que o primeiro carregamento já ocorreu
        fetchData(true); // Busca dados e mostra o alerta de perfil se necessário
      } else {
        fetchData(false); // Nas próximas vezes, apenas busca os dados
      }
    }
    return () => {
      stopPolling(); // Cleanup ao sair da tela
    };
  }, [isFocused]); // Depende APENAS de 'isFocused'

  const handleRefresh = () => {
    fetchData(false);
    setSearchTerm('');
    setSelectedFilter('todos');
  };

  const toggleFav = async (pid: number) => {
    if (!currentUserId) return;
    const isFav = !!favoritos[pid];
    Alert.alert(
      isFav ? 'Remover dos favoritos?' : 'Adicionar aos favoritos?',
      '',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isFav ? 'Remover' : 'Adicionar',
          onPress: async () => {
            try {
              if (isFav) await desfavoritarPet(currentUserId, pid);
              else await favoritarPet(currentUserId, pid);
              setFavoritos(prev => ({ ...prev, [pid]: !isFav }));
            } catch (error) {
              Alert.alert("Erro", "Não foi possível atualizar os favoritos.");
            }
          }
        }
      ]
    );
  };

  const filtered = data.filter(p => {
    const termo = searchTerm.toLowerCase();
    const ageStr = `${p.idadeAno}a ${p.idadeMes}m`.toLowerCase();
    
    const matchesSearch = 
      p.nome.toLowerCase().includes(termo) ||
      p.raca.toLowerCase().includes(termo) ||
      ageStr.includes(termo);

    if (!matchesSearch) return false;

    if (selectedFilter !== 'todos' && p.sexo !== selectedFilter) return false;
    
    return true;
  });

  const PetCardSquare = ({ item }: { item: any }) => {
    if (!item) return null;

    const isMyPet = item.idUsuario === currentUserId;
    const idadeAno = typeof item.idadeAno === 'number' ? item.idadeAno : 0;
    const idadeMes = typeof item.idadeMes === 'number' ? item.idadeMes : 0;
    const raca = item.raca || "N/I";
    const nome = item.nome || "Pet";

    // Lógica para exibir a imagem do pet
    let imageSource;
    if (item.fotos) {
      imageSource = { uri: `data:image/jpeg;base64,${item.fotos}` };
    } else {
      // Fallback para imagens locais se não houver foto na API
      imageSource = item.especie?.toLowerCase().includes('cachorro')
        ? require('../../assets/dog.jpg')
        : require('../../assets/cat.jpg');
    }

    return (
      <TouchableOpacity
        style={[styles.cardSquare, isMyPet && styles.myPetCardOutlineSquare]}
        onPress={() => navigation.navigate('PerfilPet', { id: item.id })}
      >
        <Image source={imageSource} style={styles.petImageSquare} />
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
      <Modal
        transparent={true}
        animationType="fade"
        visible={isMatching}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.processingModalContent}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.processingText}>Buscando pets ideais para você...</Text>
                <Text style={styles.processingSubText}>Isso pode levar um minuto.</Text>
            </View>
        </View>
      </Modal>

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
        <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainerSquare}
          renderItem={PetCardSquare}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome name="paw" size={64} color="#B6E1FA" />
              <Text style={styles.emptyTitle}>Nenhum pet encontrado.</Text>
              <Text style={styles.emptySubtitle}>Tente ajustar sua busca ou filtros.</Text>
            </View>
          }
        />
      )}

      <Footer />

      <TouchableOpacity
        style={styles.fabMatchProfileStyle}
        onPress={() => navigation.navigate('PerfilMatch')}
      >
        <Ionicons name="person-circle-outline" size={SIZES.iconLarge} color={COLORS.white} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fabUpdateMatchScoresStyle, !canMatch && styles.fabDisabled]}
        onPress={handleMatchRequest}
        disabled={!canMatch || loading || isMatching}
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
  // ... (Cole aqui os estilos da sua folha de estilos original)
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
    paddingTop: SIZES.hp(1), 
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
  fabMatchProfileStyle: {
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(24),
    backgroundColor: COLORS.secondary,
    width: SIZES.hp(6),
    height: SIZES.hp(6),
    borderRadius: SIZES.hp(3),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.regular,
    zIndex: 10,
  },
  fabUpdateMatchScoresStyle: {
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(17),
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
    backgroundColor: '#00BFFF',
    width: SIZES.hp(6),
    height: SIZES.hp(6),
    borderRadius: SIZES.hp(3),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.regular,
    zIndex: 10,
  },
   processingModalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingXLarge,
    width: SIZES.wp(80),
    alignItems: 'center',
    ...SHADOWS.strong,
  },
  processingText: {
    fontSize: FONTS.sizeLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginTop: SIZES.spacingLarge,
    textAlign: 'center',
  },
  processingSubText: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacingSmall,
    textAlign: 'center',
  },
});

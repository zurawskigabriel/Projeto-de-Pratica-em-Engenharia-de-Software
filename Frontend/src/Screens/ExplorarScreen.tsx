import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Dimensions, Modal,
  Pressable, StyleSheet, Alert
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
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

const SEX_FILTERS = ['todos', 'M', 'F'];

// Usar SIZES para consistência, similar a FavoritoScreen
const cardSpacingExplorar = SIZES.spacingRegular;
const cardWidthExplorar = (SIZES.wp(100) - cardSpacingExplorar * 3) / 2;
const cardHeightExplorar = SIZES.hp(28); // Pode ajustar conforme necessidade do design do card quadrado

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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Novo estado para userId
  const [isFirstLoad, setIsFirstLoad] = useState(true); // Para controlar o carregamento inicial

  const fetchData = async (showAlertOnNoProfile = false) => {
    setLoading(true);
    const idStr = await AsyncStorage.getItem('userId');
      const userIdFromStorage = idStr ? parseInt(idStr, 10) : null;

      if (!userIdFromStorage) {
        Alert.alert("Usuário não autenticado.");
        setLoading(false);
        // Idealmente, redirecionar para Login: navigation.replace('Login');
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
            { cancelable: false } // Forçar uma escolha para não ficar em loop se o usuário só fechar
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

        const allPets = allPetsResponse.filter(p => p); // Filtrar nulos se houver
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
          // Se match estava ativo antes, manter ativo, senão, ativar se houver scores.
          // Por padrão, vamos ativar se o perfil existe e há pets.
          setMatchActive(true);
        } else {
          setData(allPets);
          setMatchActive(false); // Desativa match se não há perfil ou pets
        }
      } catch (error) {
        console.error("Erro ao buscar dados dos pets:", error);
        Alert.alert("Erro", "Não foi possível carregar os pets. Tente atualizar.");
        setData([]); // Limpa os dados em caso de erro para evitar mostrar dados antigos
        setListaOriginal([]);
      } finally {
        setLoading(false);
        setIsFirstLoad(false);
      }
  };

  useEffect(() => {
    if (isFirstLoad) {
      fetchData(true); // Na primeira carga, verifica e mostra alerta de perfil match
    }
    // Listener para recarregar dados quando a tela Explorar ganha foco,
    // mas apenas se não for a primeira carga (que já foi tratada).
    // A lógica de atualização manual via botão será principal.
    // Poderíamos remover este listener de foco se a atualização for *estritamente* manual após a primeira carga.
    // Por enquanto, manteremos para consistência se o usuário navegar para outra tela e voltar.
    const unsubscribe = navigation.addListener('focus', () => {
      if (!isFirstLoad) { // Só recarrega no foco se não for o primeiro load
        // Decide se quer mostrar o alerta de perfil match em recargas de foco.
        // Geralmente, não é bom mostrar alertas repetidamente no foco.
        // fetchData(false); // false para não mostrar o alerta de perfil no foco
        // Ou melhor: apenas recarrega se o usuário explicitamente pedir via botão refresh.
        // Vamos comentar o refetch no focus para priorizar o botão de refresh.
        // Se o desejo é que *sempre* recarregue no focus, descomentar a linha abaixo.
        // fetchData(false);
      }
    });

    return unsubscribe;
  }, [navigation, isFirstLoad]);

  const handleRefresh = () => {
    fetchData(false); // Ao atualizar manualmente, não mostrar o alerta de perfil (ele já viu ou não tem)
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

  // Novo PetCard Quadrado para ExplorarScreen
  const PetCardSquare = ({ item }: { item: any }) => {
    if (!item) return null;

    const isMyPet = item.idUsuario === currentUserId;
    const idadeAno = typeof item.idadeAno === 'number' ? item.idadeAno : 0;
    const idadeMes = typeof item.idadeMes === 'number' ? item.idadeMes : 0;
    const raca = item.raca || "N/I"; // Raça não informada
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

        {/* Informações do Pet sobrepostas */}
        <View style={styles.infoBoxSquare}>
          <View style={styles.nameRowSquare}>
            <Text style={styles.petNameSquare} numberOfLines={1}>{nome}</Text>
            {item.sexo && (
              <FontAwesome
                name={item.sexo === 'M' ? 'mars' : 'venus'}
                size={FONTS.sizeRegular} // Ajustar tamanho
                color={COLORS.white}
                style={styles.sexIconSquare}
              />
            )}
          </View>
          <Text style={styles.petSubSquare} numberOfLines={1}>
            {`${idadeAno}a ${idadeMes}m`}
          </Text>
        </View>

        {/* Ícone de Favorito */}
        <TouchableOpacity style={styles.favIconSquare} onPress={() => toggleFav(item.id)}>
          <FontAwesome
            name={favoritos[item.id] ? 'heart' : 'heart-o'}
            size={SIZES.iconMedium - SIZES.spacingTiny} // Um pouco menor
            color={favoritos[item.id] ? COLORS.danger : COLORS.white} // Cor branca para não favoritado
          />
        </TouchableOpacity>

        {/* Badge de Score de Match (se aplicável) */}
        {matchActive && typeof item.score === 'number' && !isMyPet && (
          <View style={styles.scoreBadgeSquare}>
            <Ionicons name="flash" size={FONTS.sizeSmall} color={COLORS.white} />
            <Text style={styles.scoreTextSquare}>{item.score.toFixed(0)}%</Text>
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
      {/* Header antigo foi removido/simplificado. A barra de pesquisa agora ficará aqui em cima. */}
      {/* <View style={styles.header}> ... </View> */}

      {/* Barra de Pesquisa no Topo */}
      <View style={styles.topBarContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={SIZES.iconMedium} color={COLORS.white} /> {/* Ajustar cor para contraste */}
          <TextInput
            placeholder="Buscar pet..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.input}
            placeholderTextColor={COLORS.light} // Ajustar cor para contraste
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
            <Ionicons name="filter" size={SIZES.iconMedium} color={COLORS.white} /> {/* Ajustar cor para contraste */}
          </TouchableOpacity>
        </View>
        {/* Botão de Atualizar agora à direita da searchbox ou integrado */}
        <TouchableOpacity style={styles.refreshButtonTopBar} onPress={handleRefresh}>
          <Ionicons name="refresh-circle-outline" size={SIZES.iconLarge} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FilterModal />

      {/* Conteúdo da tela (Lista de Pets) */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2AA5FF" />
      ) : filtered.length > 0 ? (
        <FlatList
          data={filtered}
          numColumns={2} // Alterado para 2 colunas
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainerSquare} // Novo estilo para container da lista
          renderItem={PetCardSquare} // Usar o novo PetCardSquare
          // columnWrapperStyle={styles.rowSquare} // Para espaçamento entre colunas, se necessário
          ListEmptyComponent={!loading && filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name="search" size={SIZES.iconLarge * 1.5} color={COLORS.textSecondary} style={{ opacity: 0.7 }} />
              <Text style={styles.emptyTitle}>Nenhum pet por aqui.</Text>
              <Text style={styles.emptySubtitle}>Tente ajustar sua busca ou filtros.</Text>
              {/* Botão para criar perfil de match, se ainda não tiver */}
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
        // Este emptyState é para quando 'data' está vazio (antes de filtros)
        // ou se 'loading' for true e 'data' ainda não carregou.
        // O ListEmptyComponent acima trata o caso de 'filtered' ser vazio.
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

      {/* FAB para Perfil de Match */}
      <TouchableOpacity
        style={[styles.fabStyle, !canMatch && styles.fabDisabled]}
        onPress={ordenarMatch}
        disabled={!canMatch && loading} // Desabilita se não pode dar match E não está carregando (para evitar clicks enquanto verifica)
      >
        <Ionicons
          name={matchActive ? "flame" : "flame-outline"} // Ícone muda se o match está ativo
          size={SIZES.iconLarge} // Tamanho do ícone para FAB
          color={canMatch ? COLORS.white : COLORS.buttonDisabledText}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background // Mantém o fundo geral da tela
  },
  // O estilo 'header' original foi removido/comentado pois a barra de pesquisa assume essa posição.
  // header: { ... }
  // title: { ... }
  // refreshButton: { ... } // Estilo antigo do botão de refresh no header

  topBarContainer: { // Novo container para a barra de pesquisa e botão de refresh
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingRegular,
    paddingTop: Platform.OS === 'android' ? SIZES.spacingLarge : SIZES.hp(5), // Espaçamento do topo da tela
    paddingBottom: SIZES.spacingSmall,
    position: 'absolute', // Para flutuar sobre a lista
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Para garantir que fique acima da lista
    // backgroundColor: 'rgba(0,0,0,0.1)', // Debug: para ver a área do container
  },
  searchBox: {
    flex: 1, // Para ocupar a maior parte do espaço na topBarContainer
    // backgroundColor: COLORS.cardBackground, // Removido para ser transparente
    // margin: SIZES.spacingRegular, // Removido, padding será no topBarContainer
    paddingHorizontal: SIZES.spacingMedium,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadiusCircle,
    // ...SHADOWS.light, // Remover sombra se for flutuante sem fundo
    height: SIZES.inputHeight,
    // Adicionar uma borda sutil se necessário para contraste com imagens de pets
    borderWidth: 1,
    borderColor: `${COLORS.white}55`, // Branco com transparência
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizeRegular,
    marginLeft: SIZES.spacingSmall,
    fontFamily: FONTS.familyRegular,
    color: COLORS.white, // Cor do texto digitado
  },
  filterBtn: {
    padding: SIZES.spacingSmall,
  },
  refreshButtonTopBar: { // Estilo para o botão de refresh na nova barra do topo
    marginLeft: SIZES.spacingRegular, // Espaço entre a searchbox e o botão de refresh
    padding: SIZES.spacingTiny,
  },
  listContainerSquare: {
    paddingHorizontal: cardSpacingExplorar / 2,
    // paddingTop ajustado para acomodar a topBarContainer flutuante
    paddingTop: SIZES.hp(12), // Ex: SIZES.inputHeight + paddingTop do topBarContainer + algum extra
    paddingBottom: SIZES.hp(12),
  },
  cardSquare: {
    width: cardWidthExplorar,
    height: cardHeightExplorar, // Usar a altura calculada para card quadrado
    borderRadius: SIZES.borderRadiusMedium,
    overflow: 'hidden',
    backgroundColor: COLORS.borderColorLight,
    ...SHADOWS.regular,
    marginBottom: cardSpacingExplorar,
    marginHorizontal: cardSpacingExplorar / 2,
    position: 'relative', // Para posicionamento absoluto dos ícones
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
    height: cardHeightExplorar * 0.5, // Sombra um pouco maior
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
    marginRight: SIZES.spacingTiny, // Espaço para o ícone de sexo não cortar o nome
  },
  sexIconSquare: {
    // Estilos adicionais se necessário, como text shadow para contraste
    // textShadowColor: 'rgba(0, 0, 0, 0.5)',
    // textShadowOffset: { width: 0, height: 1 },
    // textShadowRadius: 1,
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
    backgroundColor: `${COLORS.black}33`, // Fundo semi-transparente para melhor visibilidade
    padding: SIZES.spacingTiny,
    borderRadius: SIZES.borderRadiusCircle,
  },
  myPetIndicatorSquare: {
    position: 'absolute',
    top: SIZES.spacingSmall,
    left: SIZES.spacingSmall,
    backgroundColor: `${COLORS.primary}cc`, // Primário com transparência
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
    bottom: SIZES.spacingSmall, // No canto inferior esquerdo, oposto ao nome
    right: SIZES.spacingSmall, // Ajustado para canto inferior direito (ou esquerdo se preferir)
    // Se for no inferior esquerdo, e infoBoxSquare estiver bottom/left, precisa ajustar.
    // Vamos colocar no inferior direito, perto do nome/idade mas separado.
    // Ou no topo, como no card de lista. Para consistência, vamos tentar no topo esquerdo.
    // Ajuste: Colocando abaixo do myPetIndicatorSquare se este existir, ou no topo esquerdo.
    // Para simplificar, vamos colocar no canto superior direito, abaixo do favIcon.
    // Não, melhor no canto inferior, oposto ao nome/idade.
    // Ficaria melhor como um badge pequeno no canto superior da imagem.
    // Reconsiderando: manter similar ao FavoritosScreen, mas adaptado.
    // Score Badge no canto superior esquerdo, e MyPet no superior direito.
    // Se MyPet está left, então Score pode ser right.
    // **Posicionamento dos Ícones no Card Quadrado:**
    // - myPetIndicatorSquare (home): Top-left.
    // - favIconSquare (coração): Top-right.
    // - scoreBadgeSquare (match %): Bottom-left.
    bottom: SIZES.spacingSmall, // Posiciona no canto inferior
    left: SIZES.spacingSmall,   // Posiciona no canto esquerdo
    // backgroundColor e padding já foram ajustados na tentativa anterior e estavam corretos.
    // Apenas garantindo que top e right não estão mais aqui para este elemento.
    backgroundColor: `${COLORS.black}59`,
    paddingHorizontal: SIZES.spacingSmall,
    paddingVertical: SIZES.spacingTiny,
    borderRadius: SIZES.borderRadiusSmall, // Mantido
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
  // FIM dos estilos de card quadrado

  // Estilos antigos do card de lista (serão removidos ou não usados)
  // card: { ... }
  // myPetCardOutline: { ... }
  // ... e outros estilos de .card, .petImage, .infoBox etc. que eram da lista vertical

  emptyState: {
    flex: 1, // Para ocupar espaço e permitir centralização
    alignItems: 'center',
    justifyContent: 'center', // Adicionado para centralizar verticalmente
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
    backgroundColor: 'rgba(0,0,0,0.6)', // Overlay um pouco mais escuro
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingLarge,
    width: SIZES.wp(80), // 80% da largura da tela
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
  // Estilo para o FAB (Floating Action Button)
  fabStyle: {
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(10), // Ajustar para ficar acima do Footer
    backgroundColor: COLORS.primary, // Cor primária para o FAB ativo
    width: SIZES.hp(7.5), // Tamanho do FAB
    height: SIZES.hp(7.5),
    borderRadius: SIZES.hp(3.75), // Metade da largura/altura para ser circular
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.strong, // Sombra mais forte para destacar
    zIndex: 10, // Para garantir que fique sobre outros elementos
  },
  fabDisabled: {
    backgroundColor: COLORS.buttonDisabledBackground, // Cor quando desabilitado
    ...SHADOWS.light, // Sombra mais leve quando desabilitado
  }
});

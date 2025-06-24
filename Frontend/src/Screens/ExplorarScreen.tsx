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
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme'; // Importar o tema

const { width, height } = Dimensions.get('window'); // Manter por enquanto
const SEX_FILTERS = ['todos', 'M', 'F'];
const cardSpacing = width * 0.02;
const cardWidth = (width - cardSpacing * 3) / 2;
const cardHeight = height * 0.28;

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

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const idStr = await AsyncStorage.getItem('userId');
      const userIdFromStorage = idStr ? parseInt(idStr, 10) : null;

      if (!userIdFromStorage) {
        Alert.alert("Usuário não autenticado.");
        setLoading(false);
        // Idealmente, redirecionar para Login: navigation.replace('Login');
        return;
      }
      setCurrentUserId(userIdFromStorage); // Armazena o userId no estado

      let perfilOk = false;
      try {
        const perfil = await buscarPerfilMatch(userIdFromStorage);
        perfilOk = !!perfil;
      } catch {
        perfilOk = false;
      }
      setCanMatch(perfilOk);
      if (!perfilOk) {
        Alert.alert(
          'Criar perfil de compatibilidade?',
          'Você ainda não possui um perfil. Deseja criar agora?',
          [
            { text: 'Sim', onPress: () => navigation.navigate('PerfilMatch') },
            { text: 'Agora não', style: 'cancel' },
          ]
        );
      }

      const [favAPI, allPets] = await Promise.all([
        listarFavoritosDoUsuario(userIdFromStorage),
        listarPets()
      ]);
      const favMap: any = {};
      favAPI.forEach(f => favMap[f.idPet] = true);
      setFavoritos(favMap);

      // Não filtrar os pets do próprio usuário aqui, eles serão sinalizados no card
      setListaOriginal(allPets);

      if (perfilOk) {
        // Aplicar score de match a todos os pets, incluindo os do usuário se fizer sentido,
        // ou ajustar buscarPontuacaoMatch para lidar com isso ou filtrar aqui.
        // Por ora, vamos passar todos os pets para buscarPontuacaoMatch.
        const scores = await buscarPontuacaoMatch(allPets);
        const enriched = allPets.map(p => { // Usar allPets
          const found = scores.find((s: any) => s.id === p.id);
          // Pets do próprio usuário podem não ter score ou ter um score padrão (ex: 0 ou não mostrar)
          // Se p.idUsuario === currentUserId, talvez o score não seja relevante da mesma forma.
          // Vamos manter o score se existir, ou 0.
          return { ...p, score: p.idUsuario === currentUserId ? undefined : (found?.score ?? 0) };
        }).sort((a, b) => {
            // Colocar pets do usuário no topo ou manter a ordenação por score?
            // Por enquanto, apenas ordena por score, pets do usuário sem score irão para o final se score for undefined.
            // Ou podemos dar prioridade se quisermos.
            // Ajuste: pets do usuário sem score (undefined) devem ir para o final se ordenando por score.
             if (a.score === undefined && b.score !== undefined) return 1; // a depois de b
             if (a.score !== undefined && b.score === undefined) return -1; // a antes de b
             if (a.score === undefined && b.score === undefined) return 0; // manter ordem original entre eles
            return (b.score ?? 0) - (a.score ?? 0);
        });
        setData(enriched);
        setMatchActive(true);
      } else {
        setData(allPets); // Usar allPets
      }

      setLoading(false);
    };

    const unsub = navigation.addListener('focus', carregar);
    return unsub;
  }, [navigation]);

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

  const PetCard = ({ item }: any) => {
    const imgSrc = item.especie?.toLowerCase().includes('cachorro')
      ? require('../../assets/dog.jpg')
      : require('../../assets/cat.jpg');
    const isMyPet = item.idUsuario === currentUserId;

    return (
      <TouchableOpacity
        style={[styles.card, isMyPet && styles.myPetCardOutline]}
        onPress={() => navigation.navigate('PerfilPet', { id: item.id })}
      >
        <Image source={imgSrc} style={styles.petImage} />

        {isMyPet && (
          <View style={styles.myPetIndicator}>
            <Ionicons name="home" size={14} color="#fff" />
            <Text style={styles.myPetIndicatorText}>Seu Pet</Text>
          </View>
        )}

        {item.score !== undefined && !isMyPet && ( // Não mostrar score para o próprio pet
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{item.score.toFixed(0)}%</Text>
          </View>
        )}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.25)']} style={styles.shadow} />
        <View style={styles.infoBox}>
          <View style={styles.nameRow}>
            <Text style={styles.petName}>{item.nome}</Text>
            <FontAwesome name={item.sexo==='M'?'mars':'venus'} size={18} color="#888" style={styles.nameIcon}/>
          </View>
          <Text style={styles.petSub}>{`${item.idadeAno}a ${item.idadeMes}m • ${item.raca}`}</Text>
        </View>
        <TouchableOpacity style={styles.favIcon} onPress={() => toggleFav(item.id)}>
          <FontAwesome
            name={favoritos[item.id] ? 'heart' : 'heart-o'}
            size={20}
            color={favoritos[item.id] ? '#E57373' : '#aaa'}
          />
        </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <TouchableOpacity style={styles.addButton} onPress={ordenarMatch}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={!canMatch ? '#ccc' : matchActive ? '#2AA5FF' : '#555'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={24} color="#888" />
        <TextInput
          placeholder="Busca por nome, raça ou idade"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
          <Ionicons name="filter" size={24} color="#555" />
        </TouchableOpacity>
      </View>
      <FilterModal />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2AA5FF" />
      ) : filtered.length > 0 ? (
        <FlatList
          data={filtered}
          numColumns={1}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => <PetCard item={item} />}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    height: SIZES.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacingRegular,
    backgroundColor: COLORS.cardBackground,
    ...SHADOWS.light,
  },
  title: {
    fontSize: FONTS.sizeXLarge, // Mantido XLarge para o título principal da tela
    fontFamily: FONTS.familyBold,
    color: COLORS.text
  },
  addButton: { // Botão de Match/Perfil
    position: 'absolute',
    right: SIZES.spacingRegular,
    // backgroundColor: COLORS.primary, // Cor será dinâmica
    width: SIZES.hp(5.5), // ~44px
    height: SIZES.hp(5.5),
    borderRadius: SIZES.hp(2.75),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.regular,
    borderWidth: 1, // Adicionando uma borda para quando não está ativo
    borderColor: COLORS.borderColor,
  },
  searchBox: {
    backgroundColor: COLORS.cardBackground,
    margin: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingMedium,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadiusCircle, // Bem arredondado
    ...SHADOWS.light,
    height: SIZES.inputHeight,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizeRegular,
    marginLeft: SIZES.spacingSmall,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text,
  },
  filterBtn: {
    padding: SIZES.spacingSmall
  },
  listContainer: {
    paddingHorizontal: SIZES.spacingRegular,
    paddingBottom: SIZES.spacingLarge
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingRegular, // Aumentado um pouco
    ...SHADOWS.regular,
    position: 'relative', // Para o myPetIndicator
  },
  myPetCardOutline: {
    borderColor: COLORS.primary, // Usando a cor primária do tema
    borderWidth: 2,
  },
  petImage: {
    width: SIZES.wp(18),
    height: SIZES.wp(18),
    borderRadius: SIZES.wp(9),
    marginRight: SIZES.spacingMedium,
    backgroundColor: COLORS.borderColorLight,
  },
  infoBox: {
    flex: 1,
    justifyContent: 'center'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  petName: {
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
    color: COLORS.text
  },
  nameIcon: {
    marginLeft: SIZES.spacingSmall,
    color: COLORS.textSecondary, // Cor mais sutil para o ícone de sexo
  },
  petSub: {
    fontSize: FONTS.sizeSmall,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacingTiny
  },
  favIcon: {
    marginLeft: SIZES.spacingRegular, // Aumentado o espaçamento
    padding: SIZES.spacingTiny, // Área de toque
  },
  scoreBadge: {
    position: 'absolute',
    top: SIZES.spacingSmall,
    left: SIZES.spacingSmall,
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.spacingTiny / 2,
    paddingHorizontal: SIZES.spacingSmall,
    borderRadius: SIZES.borderRadiusRegular,
    ...SHADOWS.light,
  },
  scoreText: {
    fontSize: FONTS.sizeXSmall,
    fontFamily: FONTS.familyBold,
    color: COLORS.primary
  },
  shadow: { // Gradiente na imagem, se mantido, verificar se cardHeight ainda é usado
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: cardHeight * 0.25, // cardHeight precisa ser definido ou recalculado com SIZES
    borderBottomLeftRadius: SIZES.borderRadiusMedium, // Para acompanhar o card
    borderBottomRightRadius: SIZES.borderRadiusMedium,
  },
  myPetIndicator: {
    position: 'absolute',
    top: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacingSmall,
    paddingVertical: SIZES.spacingTiny / 2,
    borderRadius: SIZES.borderRadiusLarge, // Mais arredondado
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    ...SHADOWS.light,
  },
  myPetIndicatorText: {
    color: COLORS.white,
    fontSize: FONTS.sizeXXSmall, // Menor para o badge
    fontFamily: FONTS.familyBold,
    marginLeft: SIZES.spacingTiny,
  },
  emptyState: {
    alignItems: 'center',
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
});

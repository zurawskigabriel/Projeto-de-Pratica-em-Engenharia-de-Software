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

const { width, height } = Dimensions.get('window');
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

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const idStr = await AsyncStorage.getItem('userId');
      const userId = parseInt(idStr || '', 10);
      if (!userId) return setLoading(false);

      let perfilOk = false;
      try {
        const perfil = await buscarPerfilMatch(userId);
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
        listarFavoritosDoUsuario(userId),
        listarPets()
      ]);
      const favMap: any = {};
      favAPI.forEach(f => favMap[f.idPet] = true);
      setFavoritos(favMap);

      const otherPets = allPets.filter((p: any) => p.idUsuario !== userId);
      setListaOriginal(otherPets);

      if (perfilOk) {
        const scores = await buscarPontuacaoMatch(otherPets);
        const enriched = otherPets.map(p => {
          const found = scores.find((s: any) => s.id === p.id);
          return { ...p, score: found?.score ?? 0 };
        }).sort((a, b) => b.score - a.score);
        setData(enriched);
        setMatchActive(true);
      } else {
        setData(otherPets);
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
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PerfilPet', { id: item.id })}>
        <Image source={imgSrc} style={styles.petImage} />
        {item.score !== undefined && (
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
  screen: { flex: 1, backgroundColor: '#F2F6F9' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: {
    position: 'absolute', right: 16,
    backgroundColor: '#2AA5FF', width: 44, height: 44,
    borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2AA5FF', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },

  searchBox: {
    backgroundColor: '#FFF',
    margin: 16, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  input: { flex: 1, height: 40, fontSize: 16, marginLeft: 8 },
  filterBtn: { padding: 8 },

  listContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 12,
    padding: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  petImage: {
    width: 68, height: 68, borderRadius: 34,
    marginRight: 12, backgroundColor: '#DDD',
  },
  infoBox: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  petName: { fontSize: 18, fontWeight: '600', color: '#222' },
  nameIcon: { marginLeft: 6 },
  petSub: { fontSize: 14, color: '#666', marginTop: 2 },

  favIcon: { marginLeft: 12 },

  scoreBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#FFF', padding: 4, borderRadius: 8,
  },
  scoreText: { fontSize: 12, fontWeight: '600', color: '#333' },
  shadow: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: cardHeight * 0.25,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: height * 0.2,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: width * 0.06,
    fontWeight: '600',
    marginTop: 20,
    color: '#333',
  },
  emptyBtn: {
    marginTop: 24, backgroundColor: '#2AA5FF',
    paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: '#2AA5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  emptyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 10,
    padding: 20, width: 250,
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 10,
  },
  filterOption: { paddingVertical: 10 },
  filterOptionText: { fontSize: 16 },
});

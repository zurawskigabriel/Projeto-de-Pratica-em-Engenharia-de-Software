import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Dimensions,
  Modal, Pressable, StyleSheet, Alert
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { desfavoritarPet, listarFavoritosDoUsuario } from '../api/api';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const SEX_FILTERS = ['todos', 'M', 'F'];
const cardSpacing = width * 0.02;
const cardWidth = (width - cardSpacing * 3) / 2;
const cardHeight = height * 0.28;

export default function FavoritoScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;
      const favs = await listarFavoritosDoUsuario(Number(uid));
      const pets = favs.map(f => f.pet);
      setData(pets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = (idPet: number) => {
    Alert.alert(
      'Remover dos favoritos?',
      '',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim', style: 'destructive', onPress: async () => {
            const uid = await AsyncStorage.getItem('userId');
            if (!uid) return;
            await desfavoritarPet(Number(uid), idPet);
            setData(prev => prev.filter(p => p.id !== idPet));
          }
        }
      ]
    );
  };

  const filtered = data.filter(p => {
    const termo = searchTerm.toLowerCase();
    const ageStr = `${p.idadeAno}a ${p.idadeMes}m`;
    if (
      !p.nome.toLowerCase().includes(termo) &&
      !p.raca.toLowerCase().includes(termo) &&
      !ageStr.includes(termo)
    ) return false;
    if (selectedFilter !== 'todos' && p.sexo !== selectedFilter) return false;
    return true;
  });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
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

      <Modal visible={showFilter} transparent animationType="fade" onRequestClose={() => setShowFilter(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar por sexo</Text>
            {SEX_FILTERS.map(opt => (
              <Pressable key={opt} style={styles.filterOption} onPress={() => { setSelectedFilter(opt); setShowFilter(false); }}>
                <Text style={styles.filterOptionText}>
                  {opt === 'todos' ? 'Todos' : opt === 'M' ? 'Machos' : 'Fêmeas'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#2AA5FF" style={{ marginTop: 20 }} />
      ) : filtered.length > 0 ? (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: height * 0.085 }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: cardSpacing }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PerfilPet', { id: item.id })}>
              <Image
                source={ item.especie.toLowerCase().includes('cachorro') ? require('../../assets/dog.jpg') : require('../../assets/cat.jpg') }
                style={styles.image}
              />
              <LinearGradient colors={['transparent','rgba(0,0,0,0.9)']} style={styles.shadow} />
              <View style={styles.petDescription}>
                <View style={{ flexDirection:'row', alignItems:'center' }}>
                  <Text style={styles.name}>{item.nome}</Text>
                  <FontAwesome
                    name={item.sexo === 'M' ? 'mars' : 'venus'}
                    size={24} color="white" style={{ marginLeft: 8 }}
                  />
                </View>
                <Text style={styles.info}>
                  {`${item.idadeAno}a ${item.idadeMes}m`},{' '}
                  {item.raca.charAt(0).toUpperCase() + item.raca.slice(1).toLowerCase()}
                </Text>
              </View>
              <TouchableOpacity style={styles.favIcon} onPress={() => toggleFavorito(item.id)}>
                <FontAwesome name="heart" size={height * 0.02} color="red" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="paw" size={64} color="#B6E1FA" />
          <Text style={styles.emptyTitle}>Nenhum favorito ainda.</Text>
          <Text style={styles.emptySubtitle}>Adicione um pet aos seus favoritos.</Text>
        </View>
      )}

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F6F9' },
  header: {
    height: 60, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },

  searchBox: {
    backgroundColor: '#FFF',
    margin: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  input: { flex: 1, height: 40, fontSize: 16 },
  filterBtn: { padding: 8 },

  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: height * 0.02,
    overflow: 'hidden',
    backgroundColor: '#DDD',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },
  image: { width: '100%', height: '100%' },
  shadow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: cardHeight * 0.5 },
  petDescription: { position: 'absolute', bottom: cardHeight * 0.05, left: cardWidth * 0.05 },
  name: { color: 'white', fontSize: height * 0.03, fontWeight: 'bold' },
  info: { color: 'white', fontSize: height * 0.02 },
  favIcon: {
    position: 'absolute',
    top: cardHeight * 0.04,
    right: cardWidth * 0.05,
    backgroundColor: 'white',
    padding: cardHeight * 0.03,
    borderRadius: 999,
  },

  emptyState: { alignItems: 'center', marginTop: height * 0.2, paddingHorizontal: 40 },
  emptyTitle: { fontSize: width * 0.06, fontWeight: '600', marginTop: 20, color: '#333' },
  emptySubtitle: { fontSize: width * 0.04, color: '#666', textAlign: 'center', marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, width: 250 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  filterOption: { paddingVertical: 10 },
  filterOptionText: { fontSize: 16 },
});

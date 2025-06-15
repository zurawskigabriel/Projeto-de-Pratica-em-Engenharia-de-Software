import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Dimensions, Modal, Pressable, StyleSheet
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { listarPets, listarFavoritosDoUsuario, favoritarPet, desfavoritarPet } from '../api/api';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const SEX_FILTERS = ['todos', 'M', 'F'];
const cardSpacing = width * 0.02;
const cardWidth = (width - cardSpacing * 3) / 2;
const cardHeight = height * 0.28;

const PetCard = ({ id, nome, sexo, especie, idade, raca, onPressFavorito, favorito, onPress }) => {
  const imageSource = especie?.toLowerCase().includes('cachorro')
    ? require('../../assets/dog.jpg') : require('../../assets/cat.jpg');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={imageSource} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.shadow}
      />
      <View style={styles.petDescription}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.name}>{nome}</Text>
          <FontAwesome name={sexo === 'M' ? 'mars' : 'venus'} size={height * 0.03} color="white" style={{ marginLeft: width * 0.01 }} />
        </View>
        <Text style={styles.info}>{idade} anos, {raca[0].toUpperCase() + raca.slice(1).toLowerCase()}</Text>
      </View>
      <TouchableOpacity style={styles.favIcon} onPress={onPressFavorito}>
        <FontAwesome name={favorito ? 'heart' : 'heart-o'} size={height * 0.02} color={favorito ? 'red' : 'black'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const FilterModal = ({ visible, onClose, onSelect }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Filtrar por sexo</Text>
        {SEX_FILTERS.map(opt => (
          <Pressable key={opt} style={styles.filterOption} onPress={() => { onSelect(opt); onClose(); }}>
            <Text style={styles.filterOptionText}>{opt === 'todos' ? 'Todos' : opt === 'M' ? 'Machos' : 'Fêmeas'}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  </Modal>
);

export default function FavoritoScreen() {
  const [data, setData] = useState([]);
  const [favoritos, setFavoritos] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [ordenadoPorIdade, setOrdenadoPorIdade] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const carregarFavoritos = async () => {
      const idSalvo = await AsyncStorage.getItem('userId');
      const idUsuario = idSalvo ? parseInt(idSalvo, 10) : null;
      if (!idUsuario) return;

      try {
        const favoritosAPI = await listarFavoritosDoUsuario(idUsuario);
        const favMap = {};
        favoritosAPI.forEach(f => { favMap[f.idPet] = true; });
        setFavoritos(favMap);
      } catch (e) {
        console.error('Erro ao carregar favoritos:', e);
      }
    };

    fetchPets();
    carregarFavoritos();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await listarPets();
      setData(res);
    } catch (e) {
      console.error('Erro ao buscar pets:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (id) => {
    const idSalvo = await AsyncStorage.getItem('userId');
    const idUsuario = idSalvo ? parseInt(idSalvo, 10) : null;
    if (!idUsuario) return;

    const isFavorito = favoritos[id];

    Alert.alert(
      isFavorito ? 'Remover dos favoritos?' : 'Adicionar aos favoritos?',
      isFavorito
        ? 'Tem certeza que deseja remover este pet dos favoritos?'
        : 'Deseja adicionar este pet aos seus favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isFavorito ? 'Remover' : 'Adicionar',
          onPress: async () => {
            try {
              if (isFavorito) {
                await desfavoritarPet(idUsuario, id);
                setFavoritos(prev => ({ ...prev, [id]: false }));
              } else {
                await favoritarPet(idUsuario, id);
                setFavoritos(prev => ({ ...prev, [id]: true }));
              }
            } catch (e) {
              console.error('Erro ao alternar favorito:', e);
              Alert.alert('Erro', 'Não foi possível atualizar os favoritos.');
            }
          },
        },
      ]
    );
  };

  const filtered = data
    .filter(p => {
      const termo = searchTerm.toLowerCase();
      return (
        (p.nome.toLowerCase().includes(termo) ||
          p.raca.toLowerCase().includes(termo) ||
          p.idade.toString().includes(termo)) &&
        (selectedFilter === 'todos' || p.sexo === selectedFilter)
      );
    });

  if (ordenadoPorIdade) {
    filtered.sort((a, b) => a.idade - b.idade);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <TouchableOpacity
          style={styles.formIcon}
          onPress={() => setOrdenadoPorIdade(prev => !prev)}
        >
          <Ionicons
            name="document-text-outline"
            size={height * 0.04}
            color={ordenadoPorIdade ? 'black' : 'gray'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="Procurar por nome, raça ou idade"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)}>
          <Ionicons name="filter" size={height * 0.03} color="black" />
        </TouchableOpacity>
      </View>

      <FilterModal visible={showFilter} onClose={() => setShowFilter(false)} onSelect={setSelectedFilter} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#999" />
      ) : filtered.length > 0 ? (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{
            paddingBottom: height * 0.085,
          }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <PetCard
              {...item}
              favorito={!!favoritos[item.id]}
              onPressFavorito={() => toggleFavorito(item.id)}
              onPress={() => navigation.navigate('PerfilPet', { id: item.id })}
            />
          )}
        />
      ) : (
        <Text style={styles.noResults}>Nenhum pet encontrado.</Text>
      )}

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: height * 0.03,
    paddingHorizontal: width * 0.02,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: height * 0.01,
    height: height * 0.05,
  },
  title: {
    fontSize: height * 0.035,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formIcon: {
    position: 'absolute',
    right: width * 0.02,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  searchBox: {
    backgroundColor: '#eee',
    borderRadius: 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  input: {
    height: height * 0.05,
    flex: 1,
  },
  filterButton: {},
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    marginBottom: cardSpacing,
    borderRadius: height * 0.02,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: cardHeight * 0.5,
  },
  petDescription: {
    position: 'absolute',
    bottom: cardHeight * 0.05,
    left: cardWidth * 0.05,
  },
  name: {
    color: 'white',
    fontSize: height * 0.03,
    fontWeight: 'bold',
  },
  info: {
    color: 'white',
    fontSize: height * 0.02,
  },
  favIcon: {
    position: 'absolute',
    top: cardHeight * 0.04,
    right: cardWidth * 0.05,
    backgroundColor: 'white',
    padding: cardHeight * 0.03,
    borderRadius: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: 250,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterOption: {
    paddingVertical: 10,
  },
  filterOptionText: {
    fontSize: 16,
  },
});

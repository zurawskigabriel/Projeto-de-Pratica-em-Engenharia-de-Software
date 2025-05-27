import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { listarPets } from '../api/api';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';

const PetCard = ({ id, nome, sexo, especie, idade, raca, onPressFavorito, favorito, onPress }) => {
  const imageSource = especie?.toLowerCase().includes('cachorro')
    ? require('../../assets/dog.jpg')
    : require('../../assets/cat.jpg');

  return (
    <TouchableOpacity style={styles.petCardContainer} onPress={onPress}>
      <Image source={imageSource} style={styles.petImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.6)']}
        style={styles.petImageShadow}
      />
      <View style={styles.petImageFooter}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.petCardName}>{nome}</Text>
            <FontAwesome
              name={sexo === 'M' ? 'mars' : 'venus'}
              size={24}
              color="white"
              style={{ marginLeft: 8, marginTop: 4 }}
            />
          </View>
          <Text style={styles.petInfoText}>{idade} anos, {raca}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.petFavIcon}
        onPress={onPressFavorito}
      >
        <FontAwesome name='heart-o' size={24} color='black' />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function FavoritoScreen() {
  const navigation = useNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [favoritos, setFavoritos] = useState({});

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setIsFetching(true);
    try {
      const pets = await listarPets();
      setData(pets);
    } catch (err) {
      console.error('Erro ao buscar pets:', err);
    }
    setIsFetching(false);
  };

  const toggleFavorito = (id) => {
    setFavoritos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredData = data.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 0 }}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Explorar</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Procurar"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {isFetching ? (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#999" />
        </View>
      ) : filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <PetCard
              id={item.id}
              nome={item.nome}
              sexo={item.sexo}
              especie={item.especie}
              idade={item.idade}
              raca={item.raca}
              favorito={!!favoritos[item.id]}
              onPressFavorito={() => toggleFavorito(item.id)}
              onPress={() => navigation.navigate('PerfilPet', { id: item.id })}
            />
          )}
          contentContainerStyle={{ ...styles.list, paddingBottom: 100 }}
        />
      ) : (
        <Text style={styles.noResults}>Nenhum pet encontrado.</Text>
      )}

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  petInfoText: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
  },
  list: {
    paddingBottom: 80,
  },
  spinnerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  petCardContainer: {
    width: 350,
    height: 400,
    margin: 6,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ddd',
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  petImageShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    borderRadius: 20,
  },
  petImageFooter: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  petCardName: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  petFavIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
});

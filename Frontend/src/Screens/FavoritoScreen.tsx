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
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PetCard = ({ name, gender }: { name: string; gender: 'male' | 'female' }) => (
  <View style={styles.card}>
    <Image
      source={require('../../assets/logo.png')} // Imagem temporária
      style={styles.image}
    />
    <View style={styles.overlay}>
      <Text style={styles.name}>{name}</Text>
      <FontAwesome5
        name={gender === 'male' ? 'mars' : 'venus'}
        size={16}
        color="white"
      />
    </View>
  </View>
);

export default function FavoritoScreen() {
  const navigation = useNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMoreData();
  }, []);

  const fetchMoreData = async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);

    // ✅ Substitua aqui com sua chamada real ao backend:
    // const response = await fetch(`https://sua-api.com/pets?page=${page}`);
    // const newItems = await response.json();

    // Simulação local de dados
    setTimeout(() => {
      const newItems = Array.from({ length: 6 }, (_, i) => ({
        id: `${(page - 1) * 6 + i + 1}`,
        name: i % 2 === 0 ? 'Bidu' : 'Ariana',
        gender: i % 2 === 0 ? 'male' : 'female',
      }));

      setData(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      if (page >= 5) setHasMore(false);
      setIsFetching(false);
    }, 1000);
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="black" style={{ marginBottom: 8 }} />
      </TouchableOpacity>

      <Text style={styles.title}>Favoritos</Text>

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

      {filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          numColumns={2}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PetCard name={item.name} gender={item.gender as 'male' | 'female'} />
          )}
          onEndReached={fetchMoreData}
          onEndReachedThreshold={0.2}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            isFetching ? (
              <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color="#999" />
              </View>
            ) : null
          }
        />
      ) : (
        <Text style={styles.noResults}>Nenhum pet encontrado.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 12,
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
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ccc',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

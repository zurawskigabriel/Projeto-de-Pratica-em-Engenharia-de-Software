import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import { listarPets, deletarPet } from '../api/api';

export default function MeusPetsScreen() {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPets = async () => {
      try {
        const userIdStr = await AsyncStorage.getItem('userId');
        const userId = userIdStr ? parseInt(userIdStr, 10) : null;

        if (!userId) {
          console.warn('Usuário não identificado.');
          return;
        }

        const resposta = await listarPets();
        const meusPets = resposta.filter((pet) => pet.idUsuario === userId);
        setPets(meusPets);
      } catch (error) {
        console.error('Erro ao carregar pets:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarPets();
  }, []);

  const getPetImage = (especie) => {
    if (especie.toLowerCase() === 'gato') {
      return require('../../assets/cat.jpg');
    } else if (especie.toLowerCase() === 'cachorro') {
      return require('../../assets/dog.jpg');
    } else {
      return require('../../assets/cat.jpg'); // fallback
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Meus Pets</Text>

        {carregando ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        ) : pets.length === 0 ? (
          <Text style={styles.subtitulo}>Você ainda não cadastrou nenhum pet.</Text>
        ) : (
          pets.map((pet) => (
            <View key={pet.id} style={styles.card}>
              <TouchableOpacity
                style={{ flexDirection: 'row', flex: 1 }}
                onPress={() => navigation.navigate('PerfilPet', { id: pet.id })}

              >
                <Image source={getPetImage(pet.especie)} style={styles.imagem} />
                <View style={styles.info}>
                  <Text style={styles.nome}>{pet.nome}</Text>
                  <Text style={styles.descricao}>{pet.raca}, {pet.idade} anos</Text>
                  <Text style={styles.evento}>Último evento ocorrido</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoExcluir}
                onPress={async () => {
                  try {
                    await deletarPet(pet.id);
                    setPets(pets.filter((p) => p.id !== pet.id));
                  } catch (error) {
                    console.error('Erro ao excluir pet:', error);
                  }
                }}
              >
                <Text style={styles.textoExcluir}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.botaoCadastrar} onPress={() => navigation.navigate('CadastrarPet')}>
          <Text style={styles.botaoTexto}>+ Novo Pet</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 140,
    backgroundColor: '#fff',
  },
  botaoCadastrar: {
    backgroundColor: '#7FCAD2',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoTexto: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  subtitulo: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
  },
  imagem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 20,
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  descricao: {
    fontSize: 18,
    color: '#333',
  },
  evento: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  botaoExcluir: {
    backgroundColor: '#ff5c5c',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 10,
    alignSelf: 'center',
  },
  textoExcluir: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

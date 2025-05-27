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
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer'; // ajuste o caminho se necessário
import { listarPets, deletarPet } from '../api/api'; // função deletarPet adicionada

export default function MeusPetsScreen() {
  const navigation = useNavigation();
  const catImage = require('../../assets/cat.jpg');
  const [pets, setPets] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPets = async () => {
      try {
        const resposta = await listarPets();
        setPets(resposta);
      } catch (error) {
        console.error('Erro ao carregar pets:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarPets();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Meus Pets</Text>

        {carregando ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        ) : (
          pets.map((pet) => (
            <View key={pet.id} style={styles.card}>
              <TouchableOpacity
                style={{ flexDirection: 'row', flex: 1 }}
                onPress={() => navigation.navigate('PerfilPet', { pet })}
              >
                <Image source={catImage} style={styles.imagem} />
                <View style={styles.info}>
                  <Text style={styles.nome}>{pet.nome}</Text>
                  <Text style={styles.descricao}>{pet.raca}, {pet.idade} anos</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoExcluir}
                onPress={async () => {
                  try {
                    await deletarPet(pet.id);
                    setPets(pets.filter((p) => p.id !== pet.id)); // remove o pet da lista
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
    width: '100%',
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  imagem: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descricao: {
    fontSize: 14,
    color: '#333',
  },
  botaoExcluir: {
    backgroundColor: '#ff5c5c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    alignSelf: 'center',
  },
  textoExcluir: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

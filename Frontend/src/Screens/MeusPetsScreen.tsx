import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import { listarPets, buscarStatusPet, buscarSolicitacoesUsuario } from '../api/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function MeusPetsScreen() {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [adotandoPets, setAdotandoPets] = useState([]);

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

        const petsComStatus = await Promise.all(
          meusPets.map(async (pet) => {
            try {
              const situacao = await buscarStatusPet(pet.id);
              return { ...pet, situacao };
            } catch (e) {
              return { ...pet, situacao: undefined };
            }
          })
        );

        setPets(petsComStatus);
        console.log('Pets com status:', petsComStatus);

        const solicitacoes = await buscarSolicitacoesUsuario(userId);
        const adotando = solicitacoes.map((s) => ({
          ...s.pet,
          situacao: s.situacao,
        }));

        setAdotandoPets(adotando);
        console.log('Pets sendo adotados:', adotando);

      } catch (error) {
        //console.error('Erro ao carregar pets ou adoções:', error);
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
      return require('../../assets/cat.jpg');
    }
  };

  const formatarIdade = (anos = 0, meses = 0) => {
    if (anos > 1 && meses === 0) return `${anos} anos`;
    if (anos === 1 && meses === 0) return `1 ano`;
    if (anos > 0 && meses > 0) {
      const anoTexto = `${anos} ano${anos > 1 ? 's' : ''}`;
      const mesTexto = `${meses} mês${meses > 1 ? 'es' : ''}`;
      return `${anoTexto} e ${mesTexto}`;
    }
    if (anos === 0 && meses > 0) return `${meses} mês${meses > 1 ? 'es' : ''}`;
    return `${anos} anos ${meses} meses`;
  };

  const formatarRaca = (raca = '') => {
    if (!raca) return '';
    const racaTrim = raca.trim();
    if (racaTrim.toUpperCase() === 'SRD') return 'SRD';
    return racaTrim
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  };

  const exibirSituacao = (situacao) => {
    if (!situacao || String(situacao).trim() === '') {
      return 'Disponível';
    }
    return situacao;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pets</Text>
        <TouchableOpacity
          style={styles.iconeAdicionar}
          onPress={() =>
            Alert.alert(
              'Adicionar Pet',
              'Deseja adicionar um novo pet?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sim',
                  onPress: () => navigation.navigate('CadastrarPet'),
                },
              ]
            )
          }
        >
          <Icon name="add" size={width * 0.07} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.containerScroll}>
        {carregando ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        ) : (
          <>
            {adotandoPets.length > 0 && (
              <>
                <Text style={styles.subtitulo}>Adotando:</Text>
                {adotandoPets.map((pet) => (
                  <View key={`adotando-${pet.id}`} style={[styles.card, { backgroundColor: '#E0F7FA' }]}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', flex: 1 }}
                      onPress={() => navigation.navigate('PerfilPet', { id: pet.id })}
                    >
                      <Image source={getPetImage(pet.especie)} style={styles.imagem} />
                      <View style={styles.info}>
                        <View style={styles.nomeContainer}>
                          <Text style={styles.nome}>{pet.nome}</Text>
                          {pet.sexo?.toLowerCase() === 'm' && (
                            <FontAwesome name="mars" size={width * 0.06} style={styles.iconeSexo} />
                          )}
                          {pet.sexo?.toLowerCase() === 'f' && (
                            <FontAwesome name="venus" size={width * 0.06} style={styles.iconeSexo} />
                          )}
                        </View>
                        <Text style={styles.descricao}>
                          {formatarRaca(pet.raca)}, {formatarIdade(pet.idadeAno ?? 0, pet.idadeMes ?? 0)}
                        </Text>
                        <Text style={styles.evento}>Situação: {exibirSituacao(pet.situacao)}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.subtitulo}>Seus Pets:</Text>

            {pets.length === 0 ? (
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
                      <View style={styles.nomeContainer}>
                        <Text style={styles.nome}>{pet.nome}</Text>
                        {pet.sexo?.toLowerCase() === 'm' && (
                          <FontAwesome name="mars" size={width * 0.06} style={styles.iconeSexo} />
                        )}
                        {pet.sexo?.toLowerCase() === 'f' && (
                          <FontAwesome name="venus" size={width * 0.06} style={styles.iconeSexo} />
                        )}
                      </View>
                      <Text style={styles.descricao}>
                        {formatarRaca(pet.raca)}, {formatarIdade(pet.idadeAno ?? 0, pet.idadeMes ?? 0)}
                      </Text>
                      <Text style={styles.evento}>Situação: {exibirSituacao(pet.situacao)}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  containerScroll: {
    backgroundColor: '#fff',
    paddingTop: height * 0.01,
    paddingHorizontal: width * 0.02,
    paddingBottom: height * 0.1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.02,
    marginBottom: height * 0.005,
  },
  title: {
    fontSize: height * 0.035,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconeAdicionar: {
    position: 'absolute',
    right: width * 0.05,
    borderRadius: width * 0.08,
    width: width * 0.1,
    height: width * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  subtitulo: {
    fontSize: width * 0.06,
    color: '#000',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.015,
    borderRadius: height * 0.02,
    backgroundColor: '#f2f2f2',
  },
  imagem: {
    width: width * 0.20,
    height: width * 0.20,
    borderRadius: height * 0.01,
    marginRight: width * 0.02,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nome: {
    fontSize: width * 0.058,
    fontWeight: 'bold',
  },
  iconeSexo: {
    marginLeft: width * 0.01,
  },
  descricao: {
    fontSize: width * 0.04,
    color: '#333',
  },
  evento: {
    fontSize: width * 0.04,
    color: '#666',
  },
});

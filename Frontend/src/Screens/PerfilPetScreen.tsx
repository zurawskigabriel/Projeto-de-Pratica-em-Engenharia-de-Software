import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FontAwesome,
  Entypo,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { buscarPet, buscarUsuarioPorId, deletarPet } from '../api/api';

export default function PerfilPet() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState(null);
  const [nomeProtetor, setNomeProtetor] = useState('');
  const [favorito, setFavorito] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('Resumo');
  const [adotando, setAdotando] = useState(false);
  const [meuUsuarioId, setMeuUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    const carregarPet = async () => {
      try {
        const idSalvo = await AsyncStorage.getItem('userId');
        setMeuUsuarioId(idSalvo ? parseInt(idSalvo, 10) : null);

        if (!id) return;
        const dados = await buscarPet(parseInt(id));
        setPet(dados);

        if (dados.idUsuario) {
          const dono = await buscarUsuarioPorId(dados.idUsuario);
          setNomeProtetor(dono.nome);
        }
      } catch (erro) {
        console.error('Erro ao buscar pet ou protetor:', erro);
      }
    };

    carregarPet();
  }, [id]);

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Carregando pet...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={
            pet.especie?.toLowerCase().includes('cachorro')
              ? require('../../assets/dog.jpg')
              : require('../../assets/cat.jpg')
          }
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.6)']}
          style={styles.imageShadow}
        />
        <TouchableOpacity
          style={styles.topLeftIcon}
          onPress={() => router.back()}
        >
          <Entypo name="chevron-left" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topRightIcon}
          onPress={async () => {
            try {
              await Share.share({
                message: `Adote o ${pet.nome}! Veja mais detalhes no nosso app.`,
              });
            } catch (error) {
              console.error('Erro ao compartilhar:', error);
            }
          }}
        >
          <Entypo name="share" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topRightIcon, { right: 80 }]}
          onPress={() => setFavorito(!favorito)}
        >
          <FontAwesome
            name={favorito ? 'heart' : 'heart-o'}
            size={20}
            color={favorito ? 'red' : 'black'}
          />
        </TouchableOpacity>
        <View style={styles.imageFooter}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.petName}>{pet.nome}</Text>
              <FontAwesome
                name={pet.sexo === 'M' ? 'mars' : 'venus'}
                size={50}
                color="white"
                style={{ marginLeft: 8 }}
              />
            </View>
            <Text style={styles.petDesc}>
              {pet.idade} anos, {pet.raca.charAt(0).toUpperCase() + pet.raca.slice(1).toLowerCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {['Resumo', 'Sobre Mim', 'Saúde', 'Histórico'].map((aba) => (
          <TouchableOpacity key={aba} onPress={() => setAbaAtiva(aba)}>
            <Text style={[styles.tab, abaAtiva === aba && styles.activeTab]}>
              {aba}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contentContainer}>
        {abaAtiva === 'Resumo' && (
          <View style={styles.infoCard}>
            <InfoItem icon="calendar" text={`${pet.idade} meses/anos`} />
            <InfoItem icon="dna" text={pet.raca} lib="MaterialCommunityIcons" />
            <InfoItem icon="ruler" text={pet.porte} lib="Entypo" />
            <InfoItem icon="mars" text={pet.sexo === 'M' ? 'Macho' : 'Fêmea'} />
            {nomeProtetor && (
              <InfoItem icon="user" text={`Protetor: ${nomeProtetor}`} />
            )}
          </View>
        )}
        {abaAtiva === 'Sobre Mim' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{pet.bio}</Text>
          </View>
        )}
        {abaAtiva === 'Saúde' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Estou com a vacinação em dia, vermifugado e saudável.
            </Text>
          </View>
        )}
        {abaAtiva === 'Histórico' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Fui resgatado em março de 2024. Desde então, estou sendo bem cuidado.
            </Text>
          </View>
        )}
      </View>

      {meuUsuarioId !== pet.idUsuario && (
        <>
          {adotando && (
            <TouchableOpacity
              style={styles.adotarBtn}
              onPress={() => alert('Abrir acompanhamento')}
            >
              <Text style={styles.adotarTxt}>Acompanhar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.adotarBtn, adotando && styles.adotarBtnAtivo]}
            onPress={() => {
              Alert.alert(
                adotando ? 'Adoção cancelada! 😔' : 'Adoção iniciada! 😁',
                adotando
                  ? `Você saiu do processo de adoção de ${pet.nome}.`
                  : `${pet.nome} vai ficar muito feliz com isso!`
              );
              setAdotando(!adotando);
            }}
          >
            <Text style={styles.adotarTxt}>
              {adotando ? 'Cancelar Adoção' : 'Adotar'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {meuUsuarioId === pet.idUsuario ? (
        <>
          <TouchableOpacity
            style={[styles.contatarBtn, { backgroundColor: '#9A9A9A' }]}
            onPress={() => router.push({ pathname: 'EditarPet', params: { id: pet.id } })}
          >
            <Text style={[styles.contatarTxt, { color: 'white' }]}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.excluirBtn}
            onPress={() => {
              Alert.alert(
                'Excluir Pet',
                `Tem certeza que deseja excluir ${pet.nome}?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Sim, excluir',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await deletarPet(pet.id);
                        Alert.alert('Pet excluído com sucesso!');
                        router.replace('/MeusPets');
                      } catch (err) {
                        Alert.alert('Erro', 'Não foi possível excluir o pet.');
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.botaoTexto}>Excluir Pet</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.contatarBtn}
          onPress={() => {
            const numeroWhatsApp = '5555996168060';
            const mensagem = 'Olá! Tenho interesse no pet para adoção.';
            const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            Linking.openURL(url);
          }}
        >
          <Text style={styles.contatarTxt}>Contatar Protetor</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function InfoItem({ icon, text, lib = 'FontAwesome' }) {
  const IconComponent =
    lib === 'FontAwesome'
      ? FontAwesome
      : lib === 'Feather'
        ? Feather
        : lib === 'Entypo'
          ? Entypo
          : lib === 'MaterialCommunityIcons'
            ? MaterialCommunityIcons
            : FontAwesome;

  return (
    <View style={styles.infoItem}>
      <IconComponent name={icon} size={16} color="#000" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 700,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  imageShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topLeftIcon: {
    position: 'absolute',
    top: 40,
    left: 30,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 999,
    elevation: 5,
  },
  topRightIcon: {
    position: 'absolute',
    top: 40,
    right: 30,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 999,
    elevation: 5,
  },
  imageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  petName: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
  },
  petDesc: {
    fontSize: 35,
    color: 'white',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  tab: {
    fontSize: 25,
    color: '#888',
    paddingBottom: 0,
  },
  activeTab: {
    color: '#000',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  infoCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
  },
  adotarBtn: {
    backgroundColor: '#7FCAD2',
    marginHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  adotarBtnAtivo: {
    backgroundColor: '#FF6B6B',
  },
  adotarTxt: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
  },
  contatarBtn: {
    backgroundColor: '#9A9A9A',
    marginHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  contatarTxt: {
    fontSize: 25,
    color: '#000',
    fontWeight: 'bold',
  },
  excluirBtn: {
    backgroundColor: '#FF5C5C',
    marginHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    marginTop: 0,
    paddingHorizontal: 0,
    borderRadius: 12,
    justifyContent: 'center',
  },
});

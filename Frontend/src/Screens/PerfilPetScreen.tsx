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
  Dimensions,
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
import { buscarPet, buscarUsuarioPorId, deletarPet, favoritarPet, listarFavoritosDoUsuario, desfavoritarPet } from '../api/api';

const { width, height } = Dimensions.get('window');

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
        const idUsuarioAtual = idSalvo ? parseInt(idSalvo, 10) : null;
        setMeuUsuarioId(idUsuarioAtual);

        if (!id) return;
        const dados = await buscarPet(parseInt(id));
        console.log('🐾 Dados do pet carregado:', dados);
        setPet(dados);

        if (dados.idUsuario) {
          const dono = await buscarUsuarioPorId(dados.idUsuario);
          setNomeProtetor(dono.nome);
        }

        if (idUsuarioAtual && dados?.id) {
          const favoritos = await listarFavoritosDoUsuario(idUsuarioAtual);
          const idsFavoritados = favoritos.map(f => f.idPet);
          console.log('ID Usuario: ', idUsuarioAtual);
          console.log('ID Pet: ', dados.id);
          console.log('⭐ IDs favoritos:', idsFavoritados);

          if (idsFavoritados.includes(dados.id)) {
            setFavorito(true);
          }
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
          <Entypo name="chevron-left" size={height * 0.03} color="black" />
        </TouchableOpacity>
        <View style={styles.topRightIconsContainer}>
          <TouchableOpacity
            onPress={async () => {
              if (!meuUsuarioId || !pet?.id) return;

              try {
                if (favorito) {
                  await desfavoritarPet(meuUsuarioId, pet.id);
                  setFavorito(false);
                  Alert.alert('💔 Pet removido dos favritos!');
                } else {
                  console.log('❤️ Enviando favoritos: ', { idUsuario: meuUsuarioId, idPet: pet.id });
                  await favoritarPet(meuUsuarioId, pet.id);
                  setFavorito(true);
                  Alert.alert('❤️ Pet adicionado aos favoritos!');
                }
              } catch (error) {
                console.error('Erro ao (des)favoritar:', error);
                Alert.alert('Erro', 'Não foi possível atualizar os favoritos.');
              }
            }}

            style={styles.iconButton}
          >
            <FontAwesome
              name={favorito === true ? 'heart' : 'heart-o'}
              size={height * 0.03}
              color={favorito === true ? 'red' : 'black'}
            />

          </TouchableOpacity>


          <TouchableOpacity
            onPress={async () => {
              try {
                await Share.share({
                  message: `Adote o ${pet.nome}! Veja mais detalhes no nosso app.`,
                });
              } catch (error) {
                console.error('Erro ao compartilhar:', error);
              }
            }}
            style={styles.iconButton}
          >
            <Entypo name="share" size={height * 0.03} color="black" />
          </TouchableOpacity>


        </View>

        <View style={styles.imageFooter}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.petName}>{pet.nome}</Text>
              <FontAwesome
                name={pet.sexo === 'M' ? 'mars' : 'venus'}
                size={height * 0.06}
                color="white"
                style={{ marginLeft: width * 0.02 }}
              />
            </View>
            <Text style={styles.petDesc}>
              {pet.idade} anos, {pet.raca ? pet.raca.charAt(0).toUpperCase() + pet.raca.slice(1).toLowerCase() : ''}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {['Resumo', 'Sobre Mim', 'Saúde', 'Histórico'].map((aba) => {
          const isAtiva = abaAtiva === aba;
          return (
            <TouchableOpacity
              key={aba}
              onPress={() => setAbaAtiva(aba)}
              style={[
                styles.tabContainer,
                isAtiva && styles.activeTab,
              ]}
            >
              <Text style={[styles.tab, isAtiva && { color: '#000' }]}>
                {aba}
              </Text>
            </TouchableOpacity>

          );
        })}
      </View>


      <View style={styles.contentContainer}>
        {abaAtiva === 'Resumo' && (
          <View style={styles.infoCard}>
            <InfoItem icon="calendar" text={`${pet.idade} meses/anos`} />
            <View style={styles.linhaCaderno} />

            <InfoItem icon="dna" text={pet.raca} lib="MaterialCommunityIcons" />
            <View style={styles.linhaCaderno} />

            <InfoItem icon="ruler" text={pet.porte} lib="Entypo" />
            <View style={styles.linhaCaderno} />

            <InfoItem icon="mars" text={pet.sexo === 'M' ? 'Macho' : 'Fêmea'} />
            <View style={styles.linhaCaderno} />

            {nomeProtetor && (
              <>
                <InfoItem icon="user" text={`Protetor: ${nomeProtetor}`} />
                <View style={styles.linhaCaderno} />
              </>
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
            {pet.historicoMedico
              ?.filter(item =>
                ['ALIMENTACAO', 'TRATAMENTO', 'VACINA'].includes(item.tipo) && item.descricao
              )
              .map((item, index) => (
                <Text key={index} style={styles.infoText}>
                  • {item.descricao}
                </Text>
              ))}

          </View>
        )}


        {abaAtiva === 'Histórico' && (
          <View style={styles.infoCard}>
            {pet.historicoMedico
              ?.filter(item =>
                ['COMPORTAMENTO', 'RESTRICAO_MOBILIDADE'].includes(item.tipo) && item.descricao
              )
              .map((item, index) => (
                <Text key={index} style={styles.infoText}>
                  • {item.descricao}
                </Text>
              ))}

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
              <Text style={styles.buttonTxt}>Acompanhar</Text>
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
            <Text style={styles.buttonTxt}>
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
            <Text style={[styles.buttonTxt, { color: 'white' }]}>Editar</Text>
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
            <Text style={styles.buttonTxt}>Excluir Pet</Text>
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
          <Text style={styles.buttonTxt}>Contatar Protetor</Text>
        </TouchableOpacity>
      )}
      <View style={{ height: height * 0.03 }} />  {/* espaço final */}
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
      <Text style={styles.infoText}>{String(text ?? '')}</Text>
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
    height: height * 0.6,
    borderBottomLeftRadius: height / 70,
    borderBottomRightRadius: height / 70,
  },
  imageShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    borderBottomLeftRadius: height / 70,
    borderBottomRightRadius: height / 70,
  },
  topLeftIcon: {
    position: 'absolute',
    top: height * 0.04,
    left: width * 0.04,
    padding: width * 0.02,
    borderRadius: 999,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
  },
  topRightIconsContainer: {
    position: 'absolute',
    top: height * 0.04,
    right: width * 0.04,
    flexDirection: 'row',
    gap: width * 0.03, // espaçamento entre os ícones
  },
  iconButton: {
    padding: width * 0.02,
    borderRadius: 999,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)' // branco com 30% de opacidade
  },
  topRightIcon: {
    position: 'absolute',
    top: height * 0.04,
    right: width * 0.04,
    padding: width * 0.02,
    borderRadius: 999,
    elevation: 5,
  },
  imageFooter: {
    position: 'absolute',
    bottom: height * 0.02,
    left: width * 0.04,
    right: width * 0.04,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  petName: {
    fontSize: width * 0.1,
    color: 'white',
    fontWeight: 'bold',
  },
  petDesc: {
    fontSize: width * 0.05,
    color: 'white',
  },
  tabs: {
    marginTop: height * 0.01, // ⬅️ ESTE VALOR CONTROLA A DISTÂNCIA\
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: width * 0.9, // ou 0.85 se quiser ainda mais estreito
  },
  tabContainer: {
    minWidth: width * 0.19,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.009,
    paddingHorizontal: width * 0.04,
    borderTopLeftRadius: height * 0.015,
    borderTopRightRadius: height * 0.015,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFF',
    maxHeight: height * 0.04, // ⬅️ Limite máximo de altura
  },

  activeTab: {
    backgroundColor: '#F8F8F8',
    borderColor: '#DEDEDE',
    borderBottomWidth: 0,
    fontWeight: '500',
  },
  infoCard: {
    marginHorizontal: width * 0.02, // <-- USE ESTE
    marginTop: 0, // <-- AJUSTE
    padding: width * 0.02,
    borderWidth: 1,
    borderRadius: height * 0.015,
    backgroundColor: '#F8F8F8',
    elevation: 2,
    marginBottom: height * 0.02,
    borderColor: '#DEDEDE',
  },
  tab: {
    fontSize: width * 0.04,
    color: '#888',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0,
  },
  infoText: {
    marginLeft: width * 0.025,
    fontSize: width * 0.045,
  },
  linhaCaderno: {
    height: height * 0.0015,
    backgroundColor: '#D0D0D0',
    marginTop: height * 0.008,
    marginBottom: height * 0.01,
    marginHorizontal: 0,
    opacity: 0.6,
  },
  adotarBtn: {
    backgroundColor: '#7FCAD2',
    marginHorizontal: width * 0.02,
    borderRadius: height * 0.02,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,

    // Sombras
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  adotarBtnAtivo: {
    backgroundColor: '#FF6B6B',
  },
  buttonTxt: {
    fontSize: width * 0.05,
    color: 'white',
    fontWeight: 'bold',
  },
  contatarBtn: {
    backgroundColor: '#9A9A9A',
    marginHorizontal: width * 0.02,
    borderRadius: height * 0.02,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,

    // Sombras
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  excluirBtn: {
    backgroundColor: '#FF5C5C',
    marginHorizontal: width * 0.02,
    borderRadius: height * 0.02,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,

    // Sombras
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  contentContainer: {
    marginTop: 0,
    paddingHorizontal: 0,
    borderRadius: 12,
    justifyContent: 'center',
  },


});

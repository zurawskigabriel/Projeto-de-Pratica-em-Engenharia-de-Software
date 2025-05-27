import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome, Entypo, Feather, MaterialCommunityIcons, } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Linking } from 'react-native';
import { Share } from 'react-native';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { buscarPet } from '../api/api';

export default function PerfilPet() {
    const router = useRouter();

    //Buscar info do pet
    const [pet, setPet] = useState(null);
    useEffect(() => {
        const carregarPet = async () => {
          try {
            const dados = await buscarPet(1); // não precisa mais passar o token
            setPet(dados);
          } catch (erro) {
            console.error('Erro ao buscar pet:', erro);
          }
        };
      
        carregarPet();
      }, []);
    //Printa se carregou correto no console
    useEffect(() => {
        if (pet) {
            console.log('Dados do pet carregados:', pet);
        }
    }, [pet]);


    //botao favorito
    const [favorito, setFavorito] = useState(false);
    //aba Resumo/Sobre/Saude/Historico
    const [abaAtiva, setAbaAtiva] = useState('Resumo');
    //botao de adotar/cancelaradocao
    const [adotando, setAdotando] = useState(false);

    //testa se carregou o pet
    if (!pet) {
        return (
            <View style={styles.container}>
                <Text>Carregando...</Text>
            </View>
        );
    }


    return (

        <ScrollView style={styles.container}>
            {/* Imagem e botões superiores */}
            <View style={styles.imageContainer}>
                <Image source={require('../../assets/dog.jpg')} style={styles.image} resizeMode="cover" />
                {/* Sombra na base da imagem */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.6)']}
                    style={styles.imageShadow}
                />
                <TouchableOpacity style={styles.topLeftIcon} onPress={() => router.back()}>
                    <Entypo name="chevron-left" size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.topRightIcon}
                    onPress={async () => {
                        try {
                            await Share.share({
                                message: 'Adote o ' + pet.nome + '! Veja mais detalhes no nosso app ou acesse: https://example.com/pet/' + pet.nome,
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
                            <FontAwesome name={pet.sexo === 'M' ? 'mars' : 'venus'} size={50} color="white" style={{ marginLeft: 8 }} />
                        </View>
                        <Text style={styles.petDesc}>Filhote, SRD</Text>
                    </View>
                </View>
            </View>

            {/* Aba de navegação */}
            <View style={styles.tabs}>
                {['Resumo', 'Sobre Mim', 'Saúde', 'Histórico'].map((aba) => (
                    <TouchableOpacity key={aba} onPress={() => setAbaAtiva(aba)}>
                        <Text style={[styles.tab, abaAtiva === aba && styles.activeTab]}>
                            {aba}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Cartão com informações */}
            <View style={styles.contentContainer}>
                {abaAtiva === 'Resumo' && (
                    <View style={styles.infoCard}>
                        <InfoItem icon="calendar" text={pet.idade + ' meses/anos'} />
                        <InfoItem icon="dna" text={pet.raca} lib="MaterialCommunityIcons" />
                        <InfoItem icon="ruler" text={pet.porte} lib="Entypo" />
                        <InfoItem icon="mars" text={pet.sexo === 'M' ? 'Macho' : 'Fêmea'} />
                    </View>
                )}

                {abaAtiva === 'Sobre Mim' && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            {pet.bio}
                        </Text>
                    </View>
                )}

                {abaAtiva === 'Saúde' && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            Estou com a vacinação em dia, vermifugado e saudável. Prontinho para adoção!
                        </Text>
                    </View>
                )}

                {abaAtiva === 'Histórico' && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            Fui resgatado em março de 2024, depois de ser encontrado sozinho na rua. Desde então, estou sendo bem cuidado.
                        </Text>
                    </View>
                )}
            </View>


            {/* Botões */}

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
                    if (adotando) {

                        Alert.alert('Adoção cancelada! 😔', 'Você saiu do processo de adoção de ' + pet.nome + ', que pena...', [
                            { text: 'OK', onPress: () => console.log('Confirmado') }
                        ]);


                    }
                    else {
                        Alert.alert('Adoção iniciada! 😁', pet.nome + ' vai ficar muito feliz em saber disso!', [
                            { text: 'OK', onPress: () => console.log('Confirmado') }
                        ]);
                    }
                    setAdotando(!adotando)
                }}
            >
                <Text style={[styles.adotarTxt]}>
                    {adotando ? 'Cancelar Adoção' : 'Adotar'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.contatarBtn}
                onPress={() => {
                    const numeroWhatsApp = '5555996168060'; // coloque aqui o número com DDI e DDD, só números
                    const mensagem = 'Olá! Tenho interesse no pet para adoção.';
                    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
                    Linking.openURL(url);
                }}
            >
                <Text style={styles.contatarTxt}>Contatar Protetor</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

function InfoItem({ icon, text, lib = 'FontAwesome' }: InfoItemProps) {
    const IconComponent =
        lib === 'FontAwesome' ? FontAwesome :
            lib === 'Feather' ? Feather :
                lib === 'Entypo' ? Entypo :
                    lib === 'MaterialCommunityIcons' ? MaterialCommunityIcons :

                        FontAwesome; // fallback

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
        height: 250, // altura da sombra
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
        height: 150, // ← altura fixa

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
        backgroundColor: '#FF6B6B', // vermelho claro
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
        marginBottom: 30,
    },
    contatarTxt: {
        fontSize: 25,
        color: '#000',
        fontWeight: 'bold',
    },
    contentContainer: {
        marginTop: 0,
        paddingHorizontal: 0,
        borderRadius: 12,
        justifyContent: 'center',
    },
});

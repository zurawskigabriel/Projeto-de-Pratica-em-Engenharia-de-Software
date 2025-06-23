import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Entypo } from '@expo/vector-icons';
import FooterNav from '../components/Footer';
import perfilImage from '../../assets/perfil.jpg';
import { buscarUsuarioPorId, excluirUsuario, atualizarUsuario } from '../api/api';

const { width, height } = Dimensions.get('window');

export default function UsuarioScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [menuVisivel, setMenuVisivel] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const idSalvo = await AsyncStorage.getItem('userId');
        if (!idSalvo) {
          Alert.alert('Erro', 'Usuário não autenticado.');
          router.replace('/Login');
          return;
        }

        const id = parseInt(idSalvo, 10);
        setUserId(id);

        const dados = await buscarUsuarioPorId(id);
        setUsuario(dados);
        setForm({
          nome: dados.nome,
          email: dados.email,
          telefone: dados.telefone,
          senha: '',
          confirmarSenha: '',
        });
      } catch (error) {
        Alert.alert('Erro ao carregar usuário', error.message);
      } finally {
        setCarregando(false);
      }
    };

    carregarUsuario();
  }, []);

  const handleLogoff = async () => {
    Alert.alert(
      'Confirmar saída',
      'Você está prestes a sair da sua conta. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, sair',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/Login');
          },
        },
      ]
    );
  };
  

  const handleExcluirConta = () => {
    Alert.alert(
      'Excluir conta',
      'Tem certeza que deseja excluir sua conta? Essa ação é permanente e todos os seus dados serão removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!userId || isNaN(userId)) {
                Alert.alert('Erro', 'ID do usuário inválido.');
                return;
              }
  
              await excluirUsuario(userId);
              await AsyncStorage.clear();
              Alert.alert('Conta excluída com sucesso.');
              router.replace('/Login');
            } catch (error) {
              Alert.alert('Erro', error.message || 'Erro ao excluir a conta.');
            }
          },
        },
      ]
    );
  };
  

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Usuário não encontrado.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{editando ? 'Editando Perfil' : 'Perfil'}</Text>
              <TouchableOpacity style={styles.menuIcon} onPress={() => setMenuVisivel(true)}>
                <Entypo name="dots-three-horizontal" size={width * 0.08} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            visible={menuVisivel}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisivel(false)}
          >
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisivel(false)}>
              <View style={styles.menuOptionsRight}>
                <TouchableOpacity onPress={() => { setMenuVisivel(false); setEditando(true); }}>
                  <Text style={styles.menuText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setMenuVisivel(false); handleExcluirConta(); }}>
                  <Text style={styles.menuText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          <View style={styles.userInfoContainer}>
            <Image source={perfilImage} style={styles.profileImage} />

            {editando ? (
              <>
                <Text style={styles.userDetail}>Nome:</Text>
                <TextInput style={styles.input} value={form.nome} onChangeText={(text) => setForm({ ...form, nome: text })} />
                <Text style={styles.userDetail}>Email:</Text>
                <TextInput style={styles.input} value={form.email} onChangeText={(text) => setForm({ ...form, email: text })} />
                <Text style={styles.userDetail}>Telefone:</Text>
                <TextInput style={styles.input} value={form.telefone} onChangeText={(text) => setForm({ ...form, telefone: text })} />
                <Text style={styles.userDetail}>Nova Senha:</Text>
                <TextInput style={styles.input} secureTextEntry value={form.senha} onChangeText={(text) => setForm({ ...form, senha: text })} />
                <Text style={styles.userDetail}>Confirmar Senha:</Text>
                <TextInput style={styles.input} secureTextEntry value={form.confirmarSenha} onChangeText={(text) => setForm({ ...form, confirmarSenha: text })} />

                <View style={styles.botoesLinha}>
  <TouchableOpacity
    style={styles.botaoCancelar}
    onPress={() => {
      Alert.alert(
        'Descartar alterações',
        'Tem certeza que deseja descartar as alterações?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, descartar',
            style: 'destructive',
            onPress: () => {
              setForm({
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                senha: '',
                confirmarSenha: '',
              });
              setEditando(false);
            },
          },
        ]
      );
    }}
  >
    <Text style={styles.botaoTexto}>Descartar</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.botaoVerde}
    onPress={() => {
      if (form.senha && form.senha !== form.confirmarSenha) {
        Alert.alert('Erro', 'As senhas não coincidem.');
        return;
      }

      Alert.alert(
        'Salvar alterações',
        'Tem certeza que deseja salvar as alterações?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, salvar',
            onPress: async () => {
              try {
                await atualizarUsuario(userId, {
                  nome: form.nome,
                  email: form.email,
                  telefone: form.telefone,
                  senha: form.senha,
                  tipo: 'PESSOA',
                  perfilUsuario: 'AMBOS',
                });

                Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
                setEditando(false);
              } catch (error) {
                Alert.alert('Erro', error.message || 'Erro ao atualizar dados.');
              }
            },
          },
        ]
      );
    }}
  >
    <Text style={styles.botaoTexto}>Salvar</Text>
  </TouchableOpacity>
</View>

              </>
            ) : (
              <>
                <Text style={styles.userName}>{usuario.nome}</Text>
                <Text style={styles.userEmail}>{usuario.email}</Text>
                <Text style={styles.userDetail}>Telefone: {usuario.telefone}</Text>
                <Text style={styles.userDetail}>Tipo de conta: {usuario.perfilUsuario}</Text>
                <Text style={styles.userDetail}>Desde: {new Date(usuario.dataCadastro).toLocaleDateString()}</Text>

                {/* Botão para Solicitações de Adoção (Apenas para Protetores) */}
                {(usuario.perfilUsuario === 'PROTETOR' || usuario.perfilUsuario === 'AMBOS') && (
                  <TouchableOpacity
                    style={[styles.botaoAcaoespecial, { marginTop: height * 0.02 }]}
                    onPress={() => router.push('/SolicitacoesProtetor')}
                  >
                    <Text style={styles.botaoTexto}>Ver Solicitações de Adoção</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.botaoCinza, { marginTop: height * 0.025 }]} onPress={handleLogoff}>
                  <Text style={styles.botaoTexto}>Sair</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botaoExcluir} onPress={handleExcluirConta}>
                  <Text style={styles.botaoTexto}>Excluir conta</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        <FooterNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: Platform.OS === 'android' ? height * 0.02 : height * 0.05,
    paddingBottom: height * 0.02,
  },
  header: {
    marginBottom: height * 0.03,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#000',
  },
  menuIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: width * 0.02,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: height * 0.06,
    paddingRight: width * 0.05,
  },
  menuOptionsRight: {
    backgroundColor: 'white',
    padding: width * 0.03,
    borderRadius: width * 0.02,
    elevation: 5,
  },
  menuText: {
    fontSize: width * 0.04,
    paddingVertical: height * 0.01,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  profileImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.6) / 2,
    marginBottom: height * 0.02,
  },
  userName: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: height * 0.01,
  },
  userEmail: {
    fontSize: width * 0.05,
    color: '#333',
    marginBottom: height * 0.015,
  },
  userDetail: {
    fontSize: width * 0.05,
    color: '#333',
    marginBottom: height * 0.005,
  },
  input: {
    width: '100%',
    marginHorizontal: width * 0.02,
    borderRadius: height * 0.02,
    paddingVertical: height * 0.015,
    marginBottom: height * 0.015,
    borderWidth: height * 0.001,
    paddingLeft: height * 0.02,
    borderColor: '#ccc',
    fontSize: width * 0.045,
    color: '#000',
  },
  botaoAcaoespecial: { // Novo estilo para o botão de solicitações
    backgroundColor: '#007bff', // Azul como exemplo
    width: '100%',
    marginHorizontal: width * 0.02,
    borderRadius: height * 0.02,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  botaoCinza: {
    backgroundColor: '#B0B0B0',
    width: '100%',
    marginHorizontal: width * 0.02,
    borderRadius: height * 0.02,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  botaoExcluir: {
    backgroundColor: '#FF6B6B',
    width: '100%',
    marginHorizontal: width * 0.02,
    borderRadius: height * 0.02,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  botaoCancelar: {
    backgroundColor: '#FF6B6B',
    paddingVertical: height * 0.015,
    borderRadius: width * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  botaoVerde: {
    backgroundColor: '#7FCAD2',
    paddingVertical: height * 0.015,
    borderRadius: width * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  botoesLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: width * 0.025,
    marginBottom: height * 0.015,
  },
  botaoTexto: {
    color: '#FFF',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

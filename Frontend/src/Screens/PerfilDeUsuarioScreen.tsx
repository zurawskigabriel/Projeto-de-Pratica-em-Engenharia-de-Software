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
} from 'react-native';
import { useRouter } from 'expo-router';
import FooterNav from '../components/Footer';
import perfilImage from '../../assets/perfil.jpg';
import { buscarUsuarioPorId, excluirUsuario, atualizarUsuario } from '../api/api';

export default function UsuarioScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '' });

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
        setForm({ nome: dados.nome, email: dados.email, telefone: dados.telefone, senha: '' });
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
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, sair",
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
      "Confirmar exclusão",
      "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const idSalvo = await AsyncStorage.getItem('userId');
              const id = idSalvo ? parseInt(idSalvo, 10) : null;

              if (!id || isNaN(id)) {
                Alert.alert("Erro", "ID do usuário inválido.");
                return;
              }

              await excluirUsuario(id);
              await AsyncStorage.clear();
              Alert.alert("Conta excluída com sucesso.");
              router.replace('/Login');

            } catch (error) {
              Alert.alert("Erro", error.message || "Erro ao excluir a conta.");
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
      <View style={styles.contentArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

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

              <View style={styles.botoesLinha}>


                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => {
                    setForm({ nome: usuario.nome, email: usuario.email, telefone: usuario.telefone, senha: '' });
                    setEditando(false);
                  }}
                >
                  <Text style={styles.botaoTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoVerde} onPress={async () => {
                  try {
                    await atualizarUsuario(userId, {
                      nome: form.nome,
                      email: form.email,
                      telefone: form.telefone,
                      senha: form.senha,
                      tipo: 'PESSOA',
                      perfilUsuario: 'AMBOS'
                    });

                    Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
                    setEditando(false);

                  } catch (error) {
                    Alert.alert('Erro', error.message || 'Erro ao atualizar dados.');
                  }
                }}>
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
              <TouchableOpacity style={[styles.botaoCinza, { marginTop: 12 }]} onPress={() => setEditando(true)}>
                <Text style={styles.botaoTexto}>Editar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.botaoCinza} onPress={handleLogoff}>
          <Text style={styles.botaoTexto}>Sair</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoExcluir} onPress={handleExcluirConta}>
          <Text style={styles.botaoTexto}>Excluir conta</Text>
        </TouchableOpacity>
      </View>

      <FooterNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 240,
    height: 240,
    borderRadius: 999,
    marginBottom: 16,
  },
  userName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 20,
    color: '#333',
    marginBottom: 12,
  },
  userDetail: {
    fontSize: 20,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  botaoCinza: {
    backgroundColor: '#B0B0B0',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  botaoExcluir: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  botaoCancelar: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  botaoVerde: {
    backgroundColor: '#7FCAD2',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  botoesLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginBottom: 10,
  },
  botaoTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

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
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

const { width, height } = Dimensions.get('window'); // Manter por enquanto, SIZES.wp/hp podem substituir

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

                <View style={styles.editActionsContainer}>
  <TouchableOpacity
    style={[styles.editButton, styles.cancelButton]}
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
    <Text style={styles.buttonText}>Descartar</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.editButton, styles.saveButton]}
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
    <Text style={styles.buttonText}>Salvar</Text>
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
                    style={[styles.actionButton, styles.solicitacoesProtetorButton, { marginTop: SIZES.hp(2) }]}
                    onPress={() => router.push('/SolicitacoesProtetor')}
                  >
                    <Text style={styles.buttonText}>Gerenciar Solicitações Recebidas</Text>
                  </TouchableOpacity>
                )}

                {(usuario.perfilUsuario === 'ADOTANTE' || usuario.perfilUsuario === 'AMBOS') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.solicitacoesAdotanteButton, { marginTop: SIZES.hp(2) }]}
                    onPress={() => router.push('/DetalhesSolicitacaoAdotante')}
                  >
                    <Text style={styles.buttonText}>Minhas Solicitações Enviadas</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.logoffButton, { marginTop: SIZES.hp(2.5) }]}
                  onPress={handleLogoff}
                >
                  <Text style={styles.buttonText}>Sair</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleExcluirConta}
                >
                  <Text style={styles.buttonText}>Excluir conta</Text>
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
    backgroundColor: COLORS.background, // Fundo da safe area
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.wp(5), // Usando wp para padding horizontal
    paddingTop: Platform.OS === 'android' ? SIZES.hp(2) : SIZES.hp(5),
    paddingBottom: SIZES.hp(2),
  },
  header: {
    marginBottom: SIZES.hp(3),
    height: SIZES.headerHeight, // Altura do header
    justifyContent: 'center', // Centraliza o headerContent verticalmente
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Para posicionar o menuIcon absoluto a ele
  },
  headerTitle: {
    fontSize: FONTS.sizeXXLarge, // Título bem grande
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  menuIcon: {
    position: 'absolute',
    right: 0,
    top: 0, // Ajustar se necessário para alinhar verticalmente com o título
    padding: SIZES.spacingSmall,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Overlay um pouco mais escuro
    justifyContent: 'flex-start', // Alinha o menu no topo
    alignItems: 'flex-end',    // Alinha o menu à direita
    paddingTop: SIZES.hp(8),      // Distância do topo da tela
    paddingRight: SIZES.wp(5),    // Distância da direita da tela
  },
  menuOptionsRight: {
    backgroundColor: COLORS.cardBackground,
    padding: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusRegular,
    ...SHADOWS.strong, // Sombra forte para o menu flutuante
  },
  menuText: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text,
    paddingVertical: SIZES.spacingSmall,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.hp(4),
  },
  profileImage: {
    width: SIZES.wp(40), // Imagem de perfil responsiva
    height: SIZES.wp(40),
    borderRadius: SIZES.wp(20), // Circular
    marginBottom: SIZES.hp(2),
    borderWidth: 3, // Adiciona uma borda à imagem de perfil
    borderColor: COLORS.primary,
  },
  userName: {
    fontSize: FONTS.sizeXXLarge, // Nome do usuário destacado
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginBottom: SIZES.hp(1),
    textAlign: 'center',
  },
  userEmail: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.hp(1.5),
    textAlign: 'center',
  },
  userDetail: { // Para "Telefone:", "Tipo de conta:", "Desde:"
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textLight,
    marginBottom: SIZES.hp(0.5),
    alignSelf: 'flex-start', // Alinha os detalhes à esquerda do container
    width: '100%', // Para garantir que o alinhamento à esquerda funcione bem
    paddingLeft: SIZES.wp(2), // Pequeno padding para não colar
  },
  input: { // Estilo unificado para TextInput
    width: '100%',
    backgroundColor: COLORS.light,
    fontFamily: FONTS.familyRegular,
    fontSize: FONTS.sizeRegular,
    color: COLORS.text,
    borderRadius: SIZES.borderRadiusRegular,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingRegular,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    height: SIZES.inputHeight,
  },
  // Botões de Ação (Sair, Excluir, Solicitações)
  actionButton: { // Estilo base para os botões principais
    width: '95%', // Um pouco menor que 100% para não colar nas bordas do card/tela
    alignSelf: 'center', // Centraliza o botão
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingRegular,
    height: SIZES.buttonHeight,
    ...SHADOWS.regular,
  },
  buttonText: { // Texto para todos os botões de ação
    color: COLORS.white,
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
  },
  // Especialização para cada botão (cores)
  solicitacoesProtetorButton: {
    backgroundColor: COLORS.info, // Azul info para protetor
  },
  solicitacoesAdotanteButton: {
    backgroundColor: COLORS.success, // Verde para adotante
  },
  logoffButton: {
    backgroundColor: COLORS.secondary, // Cinza para logoff
  },
  deleteButton: {
    backgroundColor: COLORS.danger, // Vermelho para excluir
  },
  // Botões no modo de edição (Salvar, Descartar)
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    alignSelf: 'center',
    marginTop: SIZES.spacingRegular,
  },
  editButton: { // Estilo base para botões de edição
    flex: 1, // Para ocupar espaço igualitário
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusCircle,
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.buttonHeight,
    ...SHADOWS.regular,
  },
  saveButton: {
    backgroundColor: COLORS.primary, // Azul primário para salvar
    marginRight: SIZES.spacingSmall, // Espaço entre botões Salvar e Descartar
  },
  cancelButton: {
    backgroundColor: COLORS.danger, // Vermelho para descartar
    marginLeft: SIZES.spacingSmall,
  },
  loadingContainer: { // Para ActivityIndicator
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  // Removidos estilos antigos de botões (botaoAcaoespecial, botaoCinza, etc.)
  // Eles foram substituídos por actionButton e especializações.
});

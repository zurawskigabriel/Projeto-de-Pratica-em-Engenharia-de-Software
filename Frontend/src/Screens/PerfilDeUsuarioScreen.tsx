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
import { Entypo, Ionicons } from '@expo/vector-icons';
import FooterNav from '../components/Footer';
import perfilImage from '../../assets/perfil.jpg';
import { buscarUsuarioPorId, excluirUsuario, atualizarUsuario } from '../api/api';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';

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
              {/* O ícone de engrenagem só aparece se 'editando' for falso */}
              {!editando && (
                <TouchableOpacity style={styles.menuIcon} onPress={() => setMenuVisivel(true)}>
                  <Ionicons name="settings-outline" size={SIZES.iconMedium} color={COLORS.text} />
                </TouchableOpacity>
              )}
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
            <View style={styles.profileImageContainer}>
              <Image source={perfilImage} style={styles.profileImage} />
              <TouchableOpacity
                style={styles.editPhotoButton}
                onPress={() => Alert.alert("Editar Foto", "Funcionalidade de editar foto a ser implementada.")}
              >
                <Ionicons name="camera-reverse-outline" size={SIZES.iconMedium} color={COLORS.white} />
              </TouchableOpacity>
            </View>

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
                  ><Text style={styles.buttonText}>Descartar</Text></TouchableOpacity>
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
                  ><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity>
                </View>

              </>
            ) : (
              <>
                <Text style={styles.userName}>{usuario.nome}</Text>
                <Text style={styles.userEmail}>{usuario.email}</Text>

                <View style={styles.infoCard}>
                  <View style={styles.infoCardRow}>
                    <Ionicons name="call-outline" size={FONTS.sizeRegular} color={COLORS.textSecondary} style={styles.infoCardIcon} />
                    <Text style={styles.infoCardLabel}>Telefone:</Text>
                    <Text style={styles.infoCardValue}>{usuario.telefone || 'Não informado'}</Text>
                  </View>
                  <View style={styles.infoCardRow}>
                    <Ionicons name="person-outline" size={FONTS.sizeRegular} color={COLORS.textSecondary} style={styles.infoCardIcon} />
                    <Text style={styles.infoCardLabel}>Tipo de conta:</Text>
                    <Text style={styles.infoCardValue}>{usuario.perfilUsuario}</Text>
                  </View>
                  <View style={[styles.infoCardRow, styles.infoCardRowLast]}>
                    <Ionicons name="calendar-outline" size={FONTS.sizeRegular} color={COLORS.textSecondary} style={styles.infoCardIcon} />
                    <Text style={styles.infoCardLabel}>Membro desde:</Text>
                    <Text style={styles.infoCardValue}>{new Date(usuario.dataCadastro).toLocaleDateString()}</Text>
                  </View>
                </View>

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
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.wp(5),
    paddingTop: Platform.OS === 'android' ? SIZES.hp(2) : SIZES.hp(5),
    paddingBottom: SIZES.hp(12),
  },
  header: {
    marginBottom: SIZES.hp(3),
    height: SIZES.headerHeight,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingRegular,
  },
  menuIcon: {
    padding: SIZES.spacingSmall,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: SIZES.hp(8),
    paddingRight: SIZES.wp(5),
  },
  menuOptionsRight: {
    backgroundColor: COLORS.cardBackground,
    padding: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusRegular,
    ...SHADOWS.strong,
    minWidth: SIZES.wp(40),
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
  profileImageContainer: {
    position: 'relative',
    marginBottom: SIZES.hp(2),
    alignItems: 'center',
  },
  profileImage: {
    width: SIZES.wp(40),
    height: SIZES.wp(40),
    borderRadius: SIZES.wp(20),
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
    backgroundColor: `${COLORS.primary}cc`,
    padding: SIZES.spacingSmall,
    borderRadius: SIZES.borderRadiusCircle,
    ...SHADOWS.regular,
  },
  userName: {
    fontSize: FONTS.sizeXXLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginBottom: SIZES.hp(1),
    textAlign: 'center',
  },
  userEmail: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.hp(2.5),
    textAlign: 'center',
  },
  userDetail: {
    alignSelf: 'flex-start',
    color: COLORS.textSecondary,
    fontFamily: FONTS.familyRegular,
    marginBottom: SIZES.spacingTiny,
    marginLeft: SIZES.spacingTiny,
  },
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingMedium,
    width: '100%',
    marginBottom: SIZES.hp(3),
    ...SHADOWS.light,
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacingSmall,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColorLight,
  },
  infoCardRowLast: {
    borderBottomWidth: 0,
  },
  infoCardIcon: {
    marginRight: SIZES.spacingMedium,
  },
  infoCardLabel: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoCardValue: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    textAlign: 'right',
  },
  input: {
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
  actionButton: {
    width: '95%',
    alignSelf: 'center',
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingRegular,
    height: SIZES.buttonHeight,
    ...SHADOWS.regular,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
  },
  solicitacoesProtetorButton: {
    backgroundColor: COLORS.info,
  },
  solicitacoesAdotanteButton: {
    backgroundColor: COLORS.success,
  },
  logoffButton: {
    backgroundColor: COLORS.secondary,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '95%',
    alignSelf: 'center',
    marginTop: SIZES.spacingRegular,
    gap: SIZES.spacingMedium
  },
  editButton: {
    flex: 1,
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusCircle,
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.buttonHeight,
    ...SHADOWS.regular,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginRight: SIZES.spacingSmall,
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
    marginLeft: SIZES.spacingSmall,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
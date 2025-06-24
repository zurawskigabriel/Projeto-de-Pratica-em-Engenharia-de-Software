import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { criarUsuario, fazerLogin } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme'; // Importar o tema

function analisarSenha(senha: string) {
  const regras = [
    { test: (s: string) => s.length >= 12, label: 'mínimo 12 caracteres' },
    { regex: /[A-Z]/, label: 'letra maiúscula' },
    { regex: /[a-z]/, label: 'letra minúscula' },
    { regex: /[0-9]/, label: 'número' },
    { regex: /[@#$%^&*!.,]/, label: 'caractere especial' }
  ];
  const status = regras.map(r => ({
    label: r.label,
    ok: r.regex ? r.regex.test(senha) : r.test(senha)
  }));
  const score = status.filter(s => s.ok).length;
  const força = score <= 2 ? 'Fraca' : score === 3 ? 'Média' : score === 4 ? 'Boa' : 'Forte';
  return { score, força, status };
}

export default function CadastrarScreen() {
  const [tipoPessoa, setTipoPessoa] = useState<'queroAdotar' | 'queroDoar' | null>(null);
  const [inputs, setInputs] = useState({ nome: '', cpf: '', email: '', telefone: '', senha: '', senhaRep: '' });
  const [visibilidades, setVisibilidades] = useState({ senha: false, senhaRep: false });
  const [indicador, setIndicador] = useState({ score: 0, força: '', status: [] as { label: string; ok: boolean }[] });
  const [showCrit, setShowCrit] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [promocoes, setPromocoes] = useState(false);
  const router = useRouter();

  const handleChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
    if (key === 'senha') {
      const inv = analisarSenha(value);
      setIndicador(inv);
      if (!showCrit) setShowCrit(true);
    }
  };

  const emailValido = (em: string) => /\S+@\S+\.\S+/.test(em);

  const handleCadastro = async () => {
    const { nome, cpf, email, telefone, senha, senhaRep } = inputs;
    if (senha !== senhaRep) return alert('Senhas não coincidem.');
    if (!emailValido(email)) return alert('E‑mail inválido.');
    if (indicador.score < 4) return alert('Senha precisa ser forte.');

    const dto = {
      nome, cpf, email, telefone, senha,
      tipo: tipoPessoa === 'queroAdotar' ? 'PESSOA' : 'ONG',
      perfilUsuario: 'ADOTANTE', promocoes
    };
    try {
      await criarUsuario(dto);
      const resp = await fazerLogin(email, senha);
      const payload = JSON.parse(atob(resp.token.split('.')[1]));
      await AsyncStorage.multiSet([
        ['token', resp.token],
        ['userId', payload.userId.toString()]
      ]);
      alert('Cadastro bem‑sucedido!');
      router.replace('/Explorar');
    } catch (e: any) {
      alert(e.message || 'Erro ao cadastrar.');
    }
  };

  const Formulario = () => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setTipoPessoa(null)} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>Cadastrar Conta</Text>

      {['nome','CPF','email','telefone'].map((ck, i) => (
        <TextInput
          key={ck}
          style={styles.input}
          placeholder={ck === 'email' ? 'E‑mail' : ck.charAt(0).toUpperCase() + ck.slice(1)}
          placeholderTextColor="#aaa"
          keyboardType={
            ck === 'email' ? 'email-address' :
            ck === 'telefone' ? 'phone-pad' :
            'default'
          }
          value={(inputs as any)[ck]}
          onChangeText={t => handleChange(ck, t)}
        />
      ))}

      <View style={styles.inputIcon}>
        <TextInput
          style={styles.passInput}
          placeholder="Senha"
          placeholderTextColor="#aaa"
          secureTextEntry={!visibilidades.senha}
          value={inputs.senha}
          onChangeText={t => handleChange('senha', t)}
        />
        <TouchableOpacity onPress={() => setVisibilidades(prev => ({ ...prev, senha: !prev.senha }))}>
          <Ionicons name={visibilidades.senha ? 'eye-off' : 'eye'} size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {showCrit && inputs.senha.length > 0 && (
        <View style={styles.critList}>
          {indicador.status.map(s => (
            <Text key={s.label} style={{ color: s.ok ? '#2AA5FF' : '#F25F5C', marginBottom: 4 }}>
              {s.ok ? '✓' : '✗'} {s.label}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.inputIcon}>
        <TextInput
          style={styles.passInput}
          placeholder="Repita a senha"
          placeholderTextColor="#aaa"
          secureTextEntry={!visibilidades.senhaRep}
          value={inputs.senhaRep}
          onFocus={() => !showMatch && setShowMatch(true)}
          onChangeText={t => handleChange('senhaRep', t)}
        />
        <TouchableOpacity onPress={() => setVisibilidades(prev => ({ ...prev, senhaRep: !prev.senhaRep }))}>
          <Ionicons name={visibilidades.senhaRep ? 'eye-off' : 'eye'} size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {showMatch && inputs.senhaRep.length > 0 && (
        <Text style={[
          styles.matchText,
          { color: inputs.senhaRep === inputs.senha ? '#2AA5FF' : '#F25F5C' }
        ]}>
          {inputs.senhaRep === inputs.senha ? '✓ Senhas iguais' : '✗ Senhas diferentes'}
        </Text>
      )}

      <View style={styles.checkboxRow}>
        <Switch
          value={promocoes}
          onValueChange={setPromocoes}
          trackColor={{ false: '#ccc', true: '#2AA5FF' }}
          thumbColor="#fff"
        />
        <Text style={styles.checkboxLabel}>Receber promoções e novidades</Text>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleCadastro} activeOpacity={0.8}>
        <Text style={styles.submitText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );

if (!tipoPessoa) {
  return (
    <View style={styles.selectorContainer}>
      <View style={styles.selectorCard}>
        <Text style={styles.selectorTitle}>Quem você é?</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.selectorBtn, styles.adotanteBtn]}
            onPress={() => setTipoPessoa('queroAdotar')}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={24} color="#FFF" style={styles.btnIcon} />
            <Text style={styles.selectorText}>Adotante</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectorBtn, styles.doadorBtn]}
            onPress={() => setTipoPessoa('queroDoar')}
            activeOpacity={0.8}
          >
            <Ionicons name="paw" size={24} color="#FFF" style={styles.btnIcon} />
            <Text style={styles.selectorText}>Protetor</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {Formulario()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Tela principal
  screen: {
    flex: 1,
    backgroundColor: COLORS.background, // Cor de fundo do tema
  },
  scroll: {
    flexGrow: 1, // Para garantir que o ScrollView ocupe espaço mesmo com pouco conteúdo
    padding: SIZES.spacingRegular,
    paddingTop: SIZES.spacingXLarge, // Mais espaço no topo
  },

  // Seletor inicial com relevo/card
  selectorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacingLarge,
    backgroundColor: COLORS.background, // Para cobrir a tela inteira
  },
  selectorCard: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusLarge,
    padding: SIZES.spacingXLarge,
    ...SHADOWS.strong, // Sombra mais pronunciada para o card de seleção
  },
  selectorTitle: {
    fontSize: FONTS.sizeXLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginBottom: SIZES.spacingXLarge,
    textAlign: 'center',
  },
  optionsContainer: {
    // flexDirection: 'column', // Padrão para View
    // justifyContent: 'space-around', // Não necessário com marginBottom nos botões
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center', // Alinha ícone e texto verticalmente
    justifyContent: 'center', // Centraliza conteúdo do botão
    paddingVertical: SIZES.spacingMedium,
    // paddingHorizontal: SIZES.wp(10), // Ajustado para ser mais flexível com o texto
    borderRadius: SIZES.borderRadiusCircle, // Botões bem arredondados
    ...SHADOWS.regular,
    height: SIZES.hp(8), // Altura responsiva
  },
  adotanteBtn: {
    backgroundColor: COLORS.primary, // Cor primária para Adotante
    marginBottom: SIZES.spacingRegular,
  },
  doadorBtn: {
    backgroundColor: COLORS.success, // Cor de sucesso (verde) para Protetor
  },
  btnIcon: {
    marginRight: SIZES.spacingSmall,
  },
  selectorText: {
    fontSize: FONTS.sizeLarge, // Tamanho de fonte maior para os botões de seleção
    fontFamily: FONTS.familyBold,
    color: COLORS.white,
  },

  // Card de formulário
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusLarge,
    padding: SIZES.spacingLarge,
    ...SHADOWS.regular,
  },
  backBtn: {
    position: 'absolute',
    top: SIZES.spacingMedium, // Ajustado para melhor posicionamento
    left: SIZES.spacingMedium,
    padding: SIZES.spacingTiny, // Área de toque
    zIndex: 1, // Para garantir que fique sobre outros elementos se necessário
  },
  title: {
    fontSize: FONTS.sizeXXLarge, // Título grande para o formulário
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacingXLarge,
  },

  // Inputs e senhas
  input: {
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
  inputIconContainer: { // Renomeado de inputIcon para maior clareza
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: SIZES.borderRadiusRegular,
    borderColor: COLORS.borderColor,
    borderWidth: SIZES.borderWidth,
    paddingHorizontal: SIZES.spacingMedium,
    marginBottom: SIZES.spacingRegular,
    height: SIZES.inputHeight,
  },
  passInput: {
    flex: 1,
    fontFamily: FONTS.familyRegular,
    fontSize: FONTS.sizeRegular,
    color: COLORS.text,
  },
  eyeIcon: { // Estilo para o ícone do olho
    padding: SIZES.spacingSmall,
  },

  // Listas de validação
  critList: {
    marginBottom: SIZES.spacingRegular,
    paddingLeft: SIZES.spacingSmall, // Pequeno recuo para a lista
  },
  critText: { // Estilo base para texto de critério
    fontFamily: FONTS.familyRegular,
    fontSize: FONTS.sizeSmall,
    marginBottom: SIZES.spacingTiny,
  },
  matchText: {
    fontSize: FONTS.sizeSmall,
    fontFamily: FONTS.familyBold, // Bold para destacar
    marginBottom: SIZES.spacingRegular,
  },

  // Checkbox promocional
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingLarge, // Mais espaço antes do botão de submit
  },
  checkboxLabel: {
    marginLeft: SIZES.spacingSmall,
    fontSize: FONTS.sizeSmall, // Um pouco menor para o label do checkbox
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    flex: 1, // Para o texto quebrar a linha se necessário
  },

  // Botão de envio
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusCircle,
    alignItems: 'center',
    ...SHADOWS.regular,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
  },
  submitText: {
    color: COLORS.white,
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
  },
});

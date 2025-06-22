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
    backgroundColor: '#F1F9FA',
  },
  scroll: {
    padding: 16,
    paddingTop: 48,
  },

  // Seletor inicial com relevo/card
  selectorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  selectorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    // Sombra cross‑platform (iOS e Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  }, // segue boas práticas de sombras em React Native :contentReference[oaicite:1]{index=1}
  selectorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 25,
    paddingHorizontal: 80,
    borderRadius: 25,
  },
  adotanteBtn: {
    backgroundColor: '#219CD9',
    marginBottom: 16
  },
  doadorBtn: {
    backgroundColor: '#86B9D1',
  },
  btnIcon: {
    marginRight: 8,
  },
  selectorText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFF',
  },

  // Card de formulário
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Inputs e senhas
  input: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderColor: '#DDD',
    borderWidth: 1,
    fontSize: 16,
  },
  inputIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    borderColor: '#DDD',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 52,
  },
  passInput: {
    flex: 1,
    fontSize: 16,
  },

  // Listas de validação
  critList: {
    marginBottom: 16,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },

  // Checkbox promocional
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },

  // Botão de envio
  submitBtn: {
    backgroundColor: '#219CD9',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#219CD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

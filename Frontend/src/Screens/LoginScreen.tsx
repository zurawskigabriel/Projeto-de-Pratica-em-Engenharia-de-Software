import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fazerLogin } from '../api/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const dados = await fazerLogin(email, senha);
      const payload = JSON.parse(atob(dados.token.split('.')[1]));
      const userId = payload.userId;
      if (!userId) throw new Error('ID de usuário não encontrado');
      await AsyncStorage.multiSet([
        ['token', dados.token],
        ['userId', userId.toString()]
      ]);
      Alert.alert('Sucesso', 'Bem-vindo de volta!');
      router.replace('/Explorar');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro', e.message || 'Falha no login');
    }
  };

  const handleVisitante = async () => {
    try {
      const dados = await fazerLogin('visitante@visitante', 'visitante');
      const payload = JSON.parse(atob(dados.token.split('.')[1]));
      const userId = payload.userId;
      if (!userId) throw new Error('ID de usuário não encontrado');
      await AsyncStorage.multiSet([
        ['token', dados.token],
        ['userId', userId.toString()]
      ]);
      router.replace('/Explorar');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro', e.message || 'Falha ao entrar como visitante');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email/CPF/CNPJ"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#aaa"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleVisitante}>
            <Text style={styles.guestLink}>Entrar como visitante</Text>
          </TouchableOpacity>

          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => {/* reset password flow */}}>
              <Text style={styles.link}>Esqueceu a senha?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Cadastrar')}>
              <Text style={styles.link}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9F9F9' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
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
  logoWrapper: {
    alignSelf: 'center',
    borderRadius: 30,
    backgroundColor: 'transparent',  // Envoltório transparente
    shadowColor: '#000',              // iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,                     // Android
    marginBottom: 16,
  },
  logo: {
    width: 126,
    height: 126,
    borderRadius: 30,                 // Imagem circular
  },
  title: {
    fontSize: 24, fontWeight: '700',
    color: '#333', textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  loginBtn: {
    backgroundColor: '#2AA5FF',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2AA5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  loginText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  guestLink: {
    textAlign: 'center',
    color: '#2AA5FF',
    fontSize: 16,
    marginBottom: 16,
  },
  orText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 8,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  link: {
    color: '#2AA5FF',
    fontSize: 16,
  },
});

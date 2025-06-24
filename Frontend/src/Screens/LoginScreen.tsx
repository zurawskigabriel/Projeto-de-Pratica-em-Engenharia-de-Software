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
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

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
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.spacingLarge
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusLarge, // Bordas mais arredondadas
    padding: SIZES.spacingXLarge, // Mais padding interno
    ...SHADOWS.regular, // Sombra padronizada
  },
  logoWrapper: {
    alignSelf: 'center',
    borderRadius: SIZES.wp(8), // ~30px, mas responsivo
    backgroundColor: 'transparent',
    ...SHADOWS.strong, // Sombra mais forte para o logo
    marginBottom: SIZES.spacingLarge,
  },
  logo: {
    width: SIZES.wp(33), // ~126px
    height: SIZES.wp(33),
    borderRadius: SIZES.wp(8),
  },
  title: { // Se houver um título principal na tela (não tem atualmente, mas como referência)
    fontSize: FONTS.sizeXXLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacingXLarge,
  },
  input: {
    backgroundColor: COLORS.light, // Fundo do input mais claro
    fontFamily: FONTS.familyRegular,
    fontSize: FONTS.sizeRegular,
    color: COLORS.text,
    borderRadius: SIZES.borderRadiusRegular,
    padding: SIZES.spacingMedium, // Padding interno do input
    marginBottom: SIZES.spacingRegular,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    height: SIZES.inputHeight, // Altura padronizada
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusCircle, // Botão bem arredondado
    paddingVertical: SIZES.spacingMedium,
    alignItems: 'center',
    marginBottom: SIZES.spacingRegular,
    ...SHADOWS.regular,
    height: SIZES.buttonHeight, // Altura padronizada
    justifyContent: 'center',
  },
  loginText: {
    color: COLORS.white,
    fontSize: FONTS.sizeMedium, // Ajustado
    fontFamily: FONTS.familyBold,
  },
  guestLink: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: FONTS.sizeRegular, // Ajustado
    fontFamily: FONTS.familyRegular,
    marginBottom: SIZES.spacingLarge, // Mais espaço abaixo
    padding: SIZES.spacingSmall, // Área de toque
  },
  // orText e socialRow/socialBtn não estão sendo usados no JSX atual, mas podem ser estilizados se voltarem
  // orText: {
  //   textAlign: 'center',
  //   color: COLORS.textSecondary,
  //   fontFamily: FONTS.familyRegular,
  //   marginVertical: SIZES.spacingSmall,
  // },
  // socialRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   marginBottom: SIZES.spacingRegular,
  // },
  // socialBtn: {
  //   width: SIZES.hp(5.5),
  //   height: SIZES.hp(5.5),
  //   borderRadius: SIZES.hp(2.75),
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   marginHorizontal: SIZES.spacingSmall,
  //   backgroundColor: COLORS.light, // Exemplo
  //   ...SHADOWS.light,
  // },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacingSmall, // Pequeno padding para não colar nas bordas do card
    marginTop: SIZES.spacingRegular, // Espaço acima dos links
  },
  link: {
    color: COLORS.primary,
    fontSize: FONTS.sizeRegular, // Ajustado
    fontFamily: FONTS.familyRegular,
    padding: SIZES.spacingSmall, // Área de toque
  },
});

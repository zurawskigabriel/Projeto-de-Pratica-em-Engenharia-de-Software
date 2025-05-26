import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router'; // useRouter ainda pode ser necessário para outras lógicas da tela
import { Ionicons } from '@expo/vector-icons';

import FooterNav from './Components/FooterNav';

export default function UsuarioScreen() {
  const router = useRouter(); // Se ainda for usar para outras navegações na tela

  const usuario = {
    nome: "João Silva",
    email: "joao.silva@example.com",
    fotoUrl: "https://via.placeholder.com/100",
  };

  const handleLogoff = () => {
    console.log("Usuário fez logoff");
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
        </View>

        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: usuario.fotoUrl }}
            style={styles.profileImage}
            onError={(e) => console.log("Erro ao carregar imagem:", e.nativeEvent.error)}
          />
          <Text style={styles.userName}>{usuario.nome}</Text>
          <Text style={styles.userEmail}>{usuario.email}</Text>
        </View>

        <TouchableOpacity style={[styles.logoffButtonMain, styles.button]} onPress={handleLogoff}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Sair (Logoff)</Text>
        </TouchableOpacity>
      </View>

      <FooterNav />

    </SafeAreaView>
  );
}

// Os estilos do rodapé foram removidos daqui e movidos para FooterNav.tsx
// Mantenha os estilos que são específicos da UsuarioScreen
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#F6F6F6',
    borderRadius: 15,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#A2DADC',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#777777',
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoffButtonMain: {
    backgroundColor: '#FF6B6B',
    alignSelf: 'center',
    width: '80%',
    maxWidth: 300,
  },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();

  const currentRoute = route.name;
  const [email, setEmail] = React.useState('');
  const [userType, setUserType] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      const storedUserType = await AsyncStorage.getItem('userType');
      setUserType(storedUserType);

      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setEmail(payload.sub);
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
      }
    };
    fetchData();
  }, []);

  const isVisitante = email === 'visitante@visitante';

  const handlePress = (screenName) => {
    if (isVisitante && (screenName === 'MeusPets' || screenName === 'Favoritos' || screenName === 'SolicitacoesProtetor' || screenName === 'DetalhesSolicitacaoAdotante')) {
      Alert.alert(
        'Acesso restrito',
        'Para acessar essa funcionalidade, você precisa criar uma conta. Deseja se cadastrar agora?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cadastrar', onPress: () => navigation.navigate('Cadastrar') }
        ]
      );
    } else if (userType === 'ADOTANTE' && screenName === 'MeusPets') {
      Alert.alert(
        'Funcionalidade restrita',
        'Para cadastrar pets e gerenciar seus pets, você precisa criar uma conta como protetor.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Explorar') }
        ]
      );
    }
     else {
      navigation.navigate(screenName);
    }
  };

  return (
    <View style={styles.footer}>
      {/* Botão Meus Pets - Apenas para Protetor */}
      {userType === 'PROTETOR' && (
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => handlePress('MeusPets')}
        >
          <FontAwesome5
            name="paw"
            size={24}
            solid={currentRoute === 'MeusPets'}
            color={currentRoute === 'MeusPets' ? 'black' : 'gray'}
          />
          <Text style={[styles.footerText, currentRoute === 'MeusPets' && styles.activeText]}>Meus Pets</Text>
        </TouchableOpacity>
      )}

      {/* Botão Explorar */}
      <TouchableOpacity style={styles.footerItem} onPress={() => handlePress('Explorar')}>
        <Ionicons
          name="search"
          size={24}
          color={currentRoute === 'Explorar' ? 'black' : 'gray'}
        />
        <Text style={[styles.footerText, currentRoute === 'Explorar' && styles.activeText]}>Explorar</Text>
      </TouchableOpacity>

      {/* Botão Solicitações - Apenas para Protetor */}
      {userType === 'PROTETOR' && (
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => handlePress('SolicitacoesProtetor')}
        >
          <Ionicons
            name={currentRoute === 'SolicitacoesProtetor' ? 'file-tray-full' : 'file-tray-full-outline'}
            size={24}
            color={currentRoute === 'SolicitacoesProtetor' ? 'black' : 'gray'}
          />
          <Text style={[styles.footerText, currentRoute === 'SolicitacoesProtetor' && styles.activeText]}>Solicitações</Text>
        </TouchableOpacity>
      )}

      {/* Botão Minhas Adoções - Apenas para Adotante */}
      {userType === 'ADOTANTE' && (
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => handlePress('DetalhesSolicitacaoAdotante')}
        >
          <Ionicons
            name={currentRoute === 'DetalhesSolicitacaoAdotante' ? 'document-text' : 'document-text-outline'}
            size={24}
            color={currentRoute === 'DetalhesSolicitacaoAdotante' ? 'black' : 'gray'}
          />
          <Text style={[styles.footerText, currentRoute === 'DetalhesSolicitacaoAdotante' && styles.activeText]}>Minhas Adoções</Text>
        </TouchableOpacity>
      )}

      {/* Botão Favoritos - Para Adotante e Protetor (não visitante) */}
      {!isVisitante && (
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => handlePress('Favoritos')}
          >
            <Ionicons
              name={currentRoute === 'Favoritos' ? 'heart' : 'heart-outline'}
              size={24}
              color={currentRoute === 'Favoritos' ? 'black' : 'gray'}
            />
            <Text style={[styles.footerText, currentRoute === 'Favoritos' && styles.activeText]}>Favoritos</Text>
          </TouchableOpacity>
      )}


      {/* Botão Perfil */}
      <TouchableOpacity style={styles.footerItem} onPress={() => handlePress('PerfilDeUsuario')}>
        <Ionicons
          name={currentRoute === 'PerfilDeUsuario' ? 'person' : 'person-outline'}
          size={24}
          color={currentRoute === 'PerfilDeUsuario' ? 'black' : 'gray'}
        />
        <Text style={[styles.footerText, currentRoute === 'PerfilDeUsuario' && styles.activeText]}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'gray',
  },
  activeText: {
    fontWeight: 'bold',
    color: 'black',
  },
});
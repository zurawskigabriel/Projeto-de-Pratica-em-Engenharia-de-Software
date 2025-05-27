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

  React.useEffect(() => {
    const fetchEmail = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.sub);
    };
    fetchEmail();
  }, []);

  const isVisitante = email === 'visitante@visitante';

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          if (!isVisitante) {
            navigation.navigate('MeusPets');
          } else {
            Alert.alert(
              'Acesso restrito',
              'Para acessar essa funcionalidade, você precisa criar uma conta. Deseja se cadastrar agora?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cadastrar', onPress: () => navigation.navigate('Cadastrar') }
              ]
            );
          }
        }}
        >  
        <FontAwesome5
          name="paw"
          size={24}
          solid={currentRoute === 'MeusPets'}
          color={currentRoute === 'MeusPets' ? 'black' : 'gray'}
        />
        <Text style={[styles.footerText, currentRoute === 'MeusPets' && styles.activeText]}>Meus Pets</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Explorar')}>  
        <Ionicons
          name="search"
          size={24}
          color={currentRoute === 'Explorar' ? 'black' : 'gray'}
        />
        <Text style={[styles.footerText, currentRoute === 'Explorar' && styles.activeText]}>Explorar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          if (!isVisitante) {
            navigation.navigate('Favoritos');
          } else {
            Alert.alert(
              'Acesso restrito',
              'Para acessar essa funcionalidade, você precisa criar uma conta. Deseja se cadastrar agora?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cadastrar', onPress: () => navigation.navigate('Cadastrar') }
              ]
            );
          }
        }}
        >  
        <Ionicons
          name={currentRoute === 'Favoritos' ? 'heart' : 'heart-outline'}
          size={24}
          color={currentRoute === 'Favoritos' ? 'black' : 'gray'}
        />
        <Text style={[styles.footerText, currentRoute === 'Favoritos' && styles.activeText]}>Favoritos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('PerfilDeUsuario')}>  
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

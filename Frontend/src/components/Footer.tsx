import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();

  const currentRoute = route.name;

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('MeusPets')}>  
        <FontAwesome5
          name="paw"
          size={24}
          solid={currentRoute === 'MeusPets'}
          color={currentRoute === 'MeusPets' ? 'black' : 'gray'}
        />
        <Text style={[styles.footerText, currentRoute === 'MeusPets' && styles.activeText]}>Pets</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Explorar')}>  
        <Ionicons
          name="search"
          size={24}
          color={currentRoute === 'Explorar' ? 'black' : 'gray'}
        />
        <Text style={[styles.footerText, currentRoute === 'Explorar' && styles.activeText]}>Explorar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Favoritos')}>  
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

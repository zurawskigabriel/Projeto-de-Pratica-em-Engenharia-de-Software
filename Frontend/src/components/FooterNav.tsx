// app/components/FooterNav.tsx (ou app/FooterNav.tsx)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router'; // Importe usePathname
import { Ionicons } from '@expo/vector-icons';

// Defina as rotas aqui para facilitar a manutenção
const ROUTES = {
  ADD: '/CadastrarPet',
  FAVORITES: '/PetsFavoritos',
  SEARCH: '/PesquisarPets',
  PROFILE: '/PerfilDeUsuario',
};

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname(); // Hook para obter a rota atual

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const isRouteActive = (route: string) => {
    return pathname === route;
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigateTo(ROUTES.ADD)}
      >
        <Ionicons
          name={isRouteActive(ROUTES.ADD) ? "add-circle" : "add-circle-outline"}
          size={28}
          color={isRouteActive(ROUTES.ADD) ? styles.activeIcon.color : styles.inactiveIcon.color}
        />
        <Text style={[styles.footerButtonText, isRouteActive(ROUTES.ADD) && styles.activeFooterText]}>
          Adicionar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigateTo(ROUTES.FAVORITES)}
      >
        <Ionicons
          name={isRouteActive(ROUTES.FAVORITES) ? "heart" : "heart-outline"}
          size={28}
          color={isRouteActive(ROUTES.FAVORITES) ? styles.activeIcon.color : styles.inactiveIcon.color}
        />
        <Text style={[styles.footerButtonText, isRouteActive(ROUTES.FAVORITES) && styles.activeFooterText]}>
          Favoritos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigateTo(ROUTES.SEARCH)}
      >
        <Ionicons
          name={isRouteActive(ROUTES.SEARCH) ? "search" : "search-outline"}
          size={28}
          color={isRouteActive(ROUTES.SEARCH) ? styles.activeIcon.color : styles.inactiveIcon.color}
        />
        <Text style={[styles.footerButtonText, isRouteActive(ROUTES.SEARCH) && styles.activeFooterText]}>
          Buscar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigateTo(ROUTES.PROFILE)}
      >
        <Ionicons
          name={isRouteActive(ROUTES.PROFILE) ? "person-circle" : "person-circle-outline"} // Alterado para person-circle quando ativo
          size={28}
          color={isRouteActive(ROUTES.PROFILE) ? styles.activeIcon.color : styles.inactiveIcon.color}
        />
        <Text style={[styles.footerButtonText, isRouteActive(ROUTES.PROFILE) && styles.activeFooterText]}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Ajustado
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  footerButtonText: {
    fontSize: 10,
    color: '#555555', // Cor para texto inativo
    marginTop: 2,
  },
  activeIcon: { // Cor para ícone ativo
    color: '#A2DADC',
  },
  inactiveIcon: { // Cor para ícone inativo
    color: '#555555',
  },
  activeFooterText: { // Estilo para texto ativo
    color: '#A2DADC',
    fontWeight: 'bold',
  },
});
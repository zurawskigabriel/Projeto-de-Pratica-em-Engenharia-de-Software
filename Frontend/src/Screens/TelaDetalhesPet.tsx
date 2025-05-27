// TelaDetalhesPet.tsx (Versão de Teste Extremamente Simplificada)
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native'; // Mantenha para pegar o petId

export default function TelaDetalhesPet() {
  // Log imediato ao renderizar o corpo da função do componente
  console.log('[TelaDetalhesPet] RENDERIZANDO O COMPONENTE (SIMPLIFICADO)');

  const route = useRoute();
  const petId = route.params ? (route.params as { petId?: number }).petId : undefined;
  console.log('[TelaDetalhesPet] route.params (SIMPLIFICADO):', route.params);
  console.log('[TelaDetalhesPet] petId recebido (SIMPLIFICADO):', petId);


  useEffect(() => {
    // Log dentro do useEffect
    console.log('[TelaDetalhesPet] useEffect EXECUTADO (SIMPLIFICADO) com petId:', petId);
  }, [petId]); // Dependência mantida

  return (
    <View style={styles.centered}>
      <Text style={styles.text}>Tela Detalhes Pet (Teste)</Text>
      <Text style={styles.text}>Pet ID: {petId !== undefined ? petId : 'Nenhum ID'}</Text>
      <Text style={styles.text}>Verifique o console do Metro para logs.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Cor de fundo diferente para fácil identificação
  },
  text: {
    fontSize: 16,
    margin: 5,
    color: '#333',
  }
});
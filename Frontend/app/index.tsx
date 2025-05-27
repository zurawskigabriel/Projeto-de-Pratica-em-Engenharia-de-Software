import { useRouter, useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Aguarda um pequeno tempo para garantir que o roteador está montado
    const timeout = setTimeout(() => {
      router.replace('/PerfilDeUsuario');
    }, 0); // ou até 100ms, se necessário

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/Map');
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20, fontFamily: 'Afacad_400Regular', fontSize: 16 }}>
        Carregando...
      </Text>
    </View>
  );
}

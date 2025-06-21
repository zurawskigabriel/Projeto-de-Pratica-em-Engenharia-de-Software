import { Slot } from 'expo-router';
import {
  useFonts,
  Afacad_400Regular,
  Afacad_700Bold,
} from '@expo-google-fonts/afacad';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { overrideTextFont } from '../utils/applyGlobalFont';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Afacad_400Regular,
    Afacad_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      overrideTextFont('Afacad_400Regular');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Slot />;
}

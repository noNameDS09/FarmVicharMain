import { useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from './useColorScheme';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<'dark' | 'light' | undefined>(undefined);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setColorSchemeState(savedTheme as 'dark' | 'light');
        Appearance.setColorScheme(savedTheme as 'dark' | 'light');
      } else {
        const defaultScheme = systemColorScheme || 'light';
        setColorSchemeState(defaultScheme);
        Appearance.setColorScheme(defaultScheme);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const saveTheme = async (theme: 'dark' | 'light') => {
    await AsyncStorage.setItem('theme', theme);
  };

  const toggleTheme = () => {
    const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
    Appearance.setColorScheme(newScheme);
    setColorSchemeState(newScheme);
    saveTheme(newScheme);
  };

  return {
    colorScheme,
    toggleTheme,
  };
}

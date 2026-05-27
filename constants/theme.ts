import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const colorTokens = {
  light: {
    primary: '#5B56D6',
    secondary: '#00B4D8',
    background: '#F9F8FF',
    surface: '#FFFFFF',
    error: '#D64545',
    text: '#1F1B33',
    disabled: '#9E9CBE',
    placeholder: '#7A78A4',
    border: '#E9E8F5',
    notification: '#F08A5D',
  },
  dark: {
    primary: '#9A8CFC',
    secondary: '#73D2DE',
    background: '#121026',
    surface: '#1E1A38',
    error: '#F28B82',
    text: '#F8F8FF',
    disabled: '#5D5B80',
    placeholder: '#A39FE7',
    border: '#353043',
    notification: '#F4A261',
  },
};

export const typography = {
  display: 36,
  heading1: 28,
  heading2: 24,
  heading3: 20,
  bodyLarge: 18,
  bodyMedium: 16,
  bodySmall: 14,
  caption: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const baseFonts = {
  bodyLarge: {
    ...MD3LightTheme.fonts.bodyLarge,
    fontSize: typography.bodyLarge,
  },
  bodyMedium: {
    ...MD3LightTheme.fonts.bodyMedium,
    fontSize: typography.bodyMedium,
  },
  bodySmall: {
    ...MD3LightTheme.fonts.bodySmall,
    fontSize: typography.bodySmall,
  },
  labelLarge: {
    ...MD3LightTheme.fonts.labelLarge,
    fontSize: typography.caption,
  },
};

const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colorTokens.light,
    surfaceVariant: '#EDECF8',
    outline: '#B9B7D2',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    ...baseFonts,
  },
  roundness: 10,
};

const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...colorTokens.dark,
    surfaceVariant: '#2C2946',
    outline: '#6E6A9D',
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    ...baseFonts,
  },
  roundness: 10,
};

export function useNoteFlowTheme(): MD3Theme {
  const scheme = useColorScheme();

  return useMemo(() => {
    return scheme === 'dark' ? darkTheme : lightTheme;
  }, [scheme]);
}

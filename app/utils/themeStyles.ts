import { StyleSheet } from 'react-native';

export const lightTheme = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#3b82f6',
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  shadow: '#000000',
};

export const darkTheme = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  primary: '#60a5fa',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  border: '#404040',
  shadow: '#000000',
};

export const getThemeStyles = (theme: 'light' | 'dark') => {
  const colors = theme === 'light' ? lightTheme : darkTheme;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    surface: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    primary: {
      color: colors.primary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 12,
    },
    buttonText: {
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: '600',
    },
  });
};

export const useThemeStyles = (theme: 'light' | 'dark') => {
  return getThemeStyles(theme);
};
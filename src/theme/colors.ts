export type ThemeType = 'dark' | 'light';

export interface ThemePalette {
  backgroundGradient: [string, string, ...string[]];
  cardBackground: string;
  cardBorder: string;
  cardGlow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  accentCyan: string;
  accentSuccess: string;
  accentWarning: string;
  accentDanger: string;
  inputBackground: string;
  inputBorder: string;
  modalOverlay: string;
  tabBarBackground: string;
}

export const Colors: Record<ThemeType, ThemePalette> = {
  dark: {
    backgroundGradient: ['#0F172A', '#1E1B4B', '#311042'],
    cardBackground: 'rgba(30, 41, 59, 0.70)',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    cardGlow: 'rgba(99, 102, 241, 0.15)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accentPrimary: '#6366F1', // Indigo
    accentSecondary: '#3B82F6', // Blue
    accentCyan: '#06B6D4',
    accentSuccess: '#10B981',
    accentWarning: '#F59E0B',
    accentDanger: '#EF4444',
    inputBackground: 'rgba(15, 23, 42, 0.6)',
    inputBorder: 'rgba(255, 255, 255, 0.15)',
    modalOverlay: 'rgba(0, 0, 0, 0.75)',
    tabBarBackground: 'rgba(15, 23, 42, 0.85)',
  },
  light: {
    backgroundGradient: ['#EEF2FF', '#E0E7FF', '#F3E8FF'],
    cardBackground: 'rgba(255, 255, 255, 0.75)',
    cardBorder: 'rgba(255, 255, 255, 0.6)',
    cardGlow: 'rgba(79, 70, 229, 0.08)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    accentPrimary: '#4F46E5',
    accentSecondary: '#2563EB',
    accentCyan: '#0891B2',
    accentSuccess: '#059669',
    accentWarning: '#D97706',
    accentDanger: '#DC2626',
    inputBackground: 'rgba(241, 245, 249, 0.9)',
    inputBorder: 'rgba(203, 213, 225, 0.8)',
    modalOverlay: 'rgba(15, 23, 42, 0.5)',
    tabBarBackground: 'rgba(255, 255, 255, 0.9)',
  },
};


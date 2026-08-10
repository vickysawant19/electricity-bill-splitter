import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, borderColor }) => {
  const { themeMode } = useDbContext();
  const themeColors = Colors[themeMode];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.cardBackground,
          borderColor: borderColor || themeColors.cardBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});

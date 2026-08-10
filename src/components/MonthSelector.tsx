import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';
import {
  getPreviousMonthStr,
  getNextMonthStr,
  formatMonthLabel,
} from '../utils/calculations';
import { MonthPickerModal } from './MonthPickerModal';

export const MonthSelector: React.FC = () => {
  const { selectedMonth, setSelectedMonth, themeMode } = useDbContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const themeColors = Colors[themeMode];

  const handlePrevMonth = () => {
    setSelectedMonth(getPreviousMonthStr(selectedMonth));
  };

  const handleNextMonth = () => {
    setSelectedMonth(getNextMonthStr(selectedMonth));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.arrowButton,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
          },
        ]}
        onPress={handlePrevMonth}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={20} color={themeColors.textPrimary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.monthPill,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
          },
        ]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={16} color={themeColors.accentPrimary} />
        <Text style={[styles.monthText, { color: themeColors.textPrimary }]}>
          {formatMonthLabel(selectedMonth)}
        </Text>
        <Ionicons name="caret-down-sharp" size={12} color={themeColors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.arrowButton,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
          },
        ]}
        onPress={handleNextMonth}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-forward" size={20} color={themeColors.textPrimary} />
      </TouchableOpacity>

      <MonthPickerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 8,
  },
});

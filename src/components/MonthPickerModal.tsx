import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';

interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedMonth: string; // Format "YYYY-MM"
  onSelectMonth: (month: string) => void;
}

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  onClose,
  selectedMonth,
  onSelectMonth,
}) => {
  const { themeMode } = useDbContext();
  const themeColors = Colors[themeMode];

  // Extract initial year & month from selectedMonth prop
  const initialYear = parseInt(selectedMonth.split('-')[0], 10) || new Date().getFullYear();
  const [activeYear, setActiveYear] = useState<number>(initialYear);

  useEffect(() => {
    const yr = parseInt(selectedMonth.split('-')[0], 10) || new Date().getFullYear();
    setActiveYear(yr);
  }, [selectedMonth, visible]);

  const monthNames = [
    { label: 'Jan', value: '01' },
    { label: 'Feb', value: '02' },
    { label: 'Mar', value: '03' },
    { label: 'Apr', value: '04' },
    { label: 'May', value: '05' },
    { label: 'Jun', value: '06' },
    { label: 'Jul', value: '07' },
    { label: 'Aug', value: '08' },
    { label: 'Sep', value: '09' },
    { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dec', value: '12' },
  ];

  const handlePrevYear = () => setActiveYear((prev) => prev - 1);
  const handleNextYear = () => setActiveYear((prev) => prev + 1);

  const handleSelectCurrentMonth = () => {
    const now = new Date();
    const curYr = now.getFullYear();
    const curMo = (now.getMonth() + 1).toString().padStart(2, '0');
    onSelectMonth(`${curYr}-${curMo}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: themeColors.modalOverlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: themeColors.cardBackground,
                  borderColor: themeColors.cardBorder,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                  Select Billing Month
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle" size={24} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Dynamic Year Stepper Header */}
              <View
                style={[
                  styles.yearStepperRow,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.inputBorder,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.yearArrowBtn}
                  onPress={handlePrevYear}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={20} color={themeColors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.yearTitleWrapper}>
                  <Ionicons name="calendar" size={16} color={themeColors.accentPrimary} />
                  <Text style={[styles.yearTitleText, { color: themeColors.textPrimary }]}>
                    {activeYear}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.yearArrowBtn}
                  onPress={handleNextYear}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={20} color={themeColors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* 12 Months Grid */}
              <View style={styles.monthsGrid}>
                {monthNames.map((m) => {
                  const mKey = `${activeYear}-${m.value}`;
                  const isSelected = mKey === selectedMonth;

                  return (
                    <TouchableOpacity
                      key={m.value}
                      style={[
                        styles.monthCell,
                        {
                          backgroundColor: isSelected
                            ? themeColors.accentPrimary
                            : themeColors.inputBackground,
                          borderColor: isSelected
                            ? themeColors.accentPrimary
                            : themeColors.inputBorder,
                        },
                      ]}
                      onPress={() => {
                        onSelectMonth(mKey);
                        onClose();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.monthText,
                          { color: isSelected ? '#FFFFFF' : themeColors.textPrimary },
                        ]}
                      >
                        {m.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Current Month Shortcut Button */}
              <TouchableOpacity
                style={[styles.todayBtn, { backgroundColor: themeColors.accentPrimary + '20' }]}
                onPress={handleSelectCurrentMonth}
                activeOpacity={0.8}
              >
                <Ionicons name="today-outline" size={16} color={themeColors.accentPrimary} />
                <Text style={[styles.todayBtnText, { color: themeColors.accentPrimary }]}>
                  Jump to Current Month
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  yearStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  yearArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearTitleText: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  monthCell: {
    width: '31%',
    margin: '1%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 15,
    fontWeight: '700',
  },
  checkIcon: {
    marginTop: 2,
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 14,
    marginTop: 16,
  },
  todayBtnText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
});

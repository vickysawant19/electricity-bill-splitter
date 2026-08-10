import React from 'react';
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
import { formatMonthLabel } from '../utils/calculations';

interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedMonth: string;
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

  // Generate past 12 months up to current + next month
  const generateMonths = (): string[] => {
    const list: string[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth(); // 0-based

    // Add previous 12 months and current year months
    for (let y = currentYear - 1; y <= currentYear + 1; y++) {
      for (let m = 1; m <= 12; m++) {
        const mStr = `${y}-${m.toString().padStart(2, '0')}`;
        list.push(mStr);
      }
    }
    return list.reverse(); // Newest first
  };

  const months = generateMonths();

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
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                  Select Billing Cycle
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle" size={24} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={months}
                keyExtractor={(item) => item}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => {
                  const isSelected = item === selectedMonth;
                  return (
                    <TouchableOpacity
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
                        onSelectMonth(item);
                        onClose();
                      }}
                    >
                      <Text
                        style={[
                          styles.monthText,
                          { color: isSelected ? '#FFFFFF' : themeColors.textPrimary },
                        ]}
                      >
                        {formatMonthLabel(item)}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
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
    maxHeight: '60%',
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
  listContainer: {
    paddingBottom: 20,
  },
  monthCell: {
    flex: 1,
    margin: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

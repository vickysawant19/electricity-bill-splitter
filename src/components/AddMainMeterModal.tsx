import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';
import { MainMeterAccount } from '../types';

interface AddMainMeterModalProps {
  visible: boolean;
  onClose: () => void;
  initialMeter?: MainMeterAccount | null;
}

export const AddMainMeterModal: React.FC<AddMainMeterModalProps> = ({
  visible,
  onClose,
  initialMeter,
}) => {
  const { addMainMeter, updateMainMeter, themeMode } = useDbContext();
  const [name, setName] = useState('');
  const themeColors = Colors[themeMode];

  useEffect(() => {
    if (initialMeter) {
      setName(initialMeter.name);
    } else {
      setName('');
    }
  }, [initialMeter, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter account name.');
      return;
    }

    if (initialMeter) {
      await updateMainMeter(initialMeter.id, name);
    } else {
      await addMainMeter(name);
    }
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
              <View style={styles.modalHeader}>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                  {initialMeter ? 'Edit Main Meter Account' : 'Add Main Meter Account'}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle" size={24} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                  Account Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      borderColor: themeColors.inputBorder,
                      color: themeColors.textPrimary,
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Annex Complex or Main House"
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: themeColors.accentPrimary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {initialMeter ? 'Update Account' : 'Create Account'}
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
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

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
import { User } from '../types';

interface AddTenantModalProps {
  visible: boolean;
  onClose: () => void;
  initialTenant?: User | null;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({
  visible,
  onClose,
  initialTenant,
}) => {
  const { addTenant, updateTenant, themeMode } = useDbContext();
  const [name, setName] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const themeColors = Colors[themeMode];

  useEffect(() => {
    if (initialTenant) {
      setName(initialTenant.name);
      setMeterNumber(initialTenant.meterNumber);
    } else {
      setName('');
      setMeterNumber('');
    }
  }, [initialTenant, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter tenant name.');
      return;
    }
    if (!meterNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter sub-meter number.');
      return;
    }

    if (initialTenant) {
      await updateTenant(initialTenant.id, name, meterNumber);
    } else {
      await addTenant(name, meterNumber);
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
                  {initialTenant ? 'Edit Sub-Meter Tenant' : 'Add New Sub-Meter Tenant'}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle" size={24} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                  Tenant Name
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
                  placeholder="e.g. Kedar"
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                  Sub-Meter Number
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
                  value={meterNumber}
                  onChangeText={setMeterNumber}
                  placeholder="e.g. M-101"
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: themeColors.accentPrimary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {initialTenant ? 'Update Sub-Meter' : 'Create Sub-Meter'}
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
    marginBottom: 16,
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

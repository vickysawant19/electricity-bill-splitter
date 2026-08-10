import React, { useState } from 'react';
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

export const GlobalHeader: React.FC = () => {
  const {
    mainMeters,
    selectedMainMeterId,
    setSelectedMainMeterId,
    themeMode,
    toggleTheme,
  } = useDbContext();

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const themeColors = Colors[themeMode];

  const activeMeter = mainMeters.find((m) => m.id === selectedMainMeterId);
  const activeMeterName = activeMeter ? activeMeter.name : 'Select Account';

  return (
    <View style={[styles.headerContainer, { borderBottomColor: themeColors.cardBorder }]}>
      {/* Account Selector Dropdown Button */}
      <TouchableOpacity
        style={[
          styles.accountSelectorButton,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
          },
        ]}
        onPress={() => setIsDropdownVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.selectorLeft}>
          <Ionicons name="flash-sharp" size={18} color={themeColors.accentPrimary} />
          <Text style={[styles.accountNameText, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {activeMeterName}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={themeColors.textSecondary} />
      </TouchableOpacity>

      {/* Theme Toggle Button */}
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
          },
        ]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Ionicons
          name={themeMode === 'dark' ? 'sunny' : 'moon'}
          size={18}
          color={themeMode === 'dark' ? '#F59E0B' : themeColors.accentPrimary}
        />
      </TouchableOpacity>

      {/* Main Meter Account Selection Modal Dropdown */}
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDropdownVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: themeColors.modalOverlay }]}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownCard,
                  {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.dropdownTitle, { color: themeColors.textSecondary }]}>
                  Select Main Meter Account
                </Text>

                <FlatList
                  data={mainMeters}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = item.id === selectedMainMeterId;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          isSelected && {
                            backgroundColor: themeColors.accentPrimary + '20',
                            borderColor: themeColors.accentPrimary,
                          },
                        ]}
                        onPress={() => {
                          setSelectedMainMeterId(item.id);
                          setIsDropdownVisible(false);
                        }}
                      >
                        <Ionicons
                          name="business"
                          size={18}
                          color={isSelected ? themeColors.accentPrimary : themeColors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.dropdownItemText,
                            {
                              color: isSelected ? themeColors.accentPrimary : themeColors.textPrimary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={18} color={themeColors.accentPrimary} />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  accountSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: '80%',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  accountNameText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  dropdownCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  dropdownItemText: {
    fontSize: 15,
    flex: 1,
    marginLeft: 10,
  },
});

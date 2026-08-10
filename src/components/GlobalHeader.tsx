import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';

export const GlobalHeader: React.FC = () => {
  const insets = useSafeAreaInsets();
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

  // Animation for selector scale pulse on selection
  const buttonScale = useSharedValue(1);

  const triggerSelectAnimation = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Top padding calculated to clear status bar/notch on Android and iOS
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 16
  ) + 6;

  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: topPadding,
          borderBottomColor: themeColors.cardBorder,
          backgroundColor: themeColors.cardBackground,
        },
      ]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
      />

      {/* Account Selector Dropdown Button */}
      <Animated.View style={buttonAnimatedStyle}>
        <TouchableOpacity
          style={[
            styles.accountSelectorButton,
            {
              backgroundColor: themeColors.inputBackground,
              borderColor: themeColors.cardBorder,
            },
          ]}
          onPress={() => {
            triggerSelectAnimation();
            setIsDropdownVisible(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.selectorLeft}>
            <View style={[styles.boltBadge, { backgroundColor: themeColors.accentPrimary + '25' }]}>
              <Ionicons name="flash-sharp" size={15} color={themeColors.accentPrimary} />
            </View>
            <Text style={[styles.accountNameText, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {activeMeterName}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Theme Toggle Button */}
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            backgroundColor: themeColors.inputBackground,
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
          <View style={[styles.modalOverlay, { backgroundColor: themeColors.modalOverlay, paddingTop: topPadding + 50 }]}>
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
                <View style={styles.dropdownHeaderRow}>
                  <Ionicons name="business-outline" size={18} color={themeColors.accentPrimary} />
                  <Text style={[styles.dropdownTitle, { color: themeColors.textSecondary }]}>
                    Select Main Meter Account
                  </Text>
                </View>

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
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() => {
                          setSelectedMainMeterId(item.id);
                          triggerSelectAnimation();
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
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  accountSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    maxWidth: '82%',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  boltBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 20,
  },
  dropdownCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    maxHeight: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  dropdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 6,
  },
  dropdownItemText: {
    fontSize: 15,
    flex: 1,
    marginLeft: 10,
  },
});

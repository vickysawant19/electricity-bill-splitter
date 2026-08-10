import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';
import { GlobalHeader } from '../components/GlobalHeader';
import { GlassCard } from '../components/GlassCard';
import { AddMainMeterModal } from '../components/AddMainMeterModal';
import { MainMeterAccount } from '../types';

export const MainMetersScreen: React.FC = () => {
  const {
    mainMeters,
    users,
    selectedMainMeterId,
    setSelectedMainMeterId,
    deleteMainMeter,
    themeMode,
  } = useDbContext();

  const themeColors = Colors[themeMode];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<MainMeterAccount | null>(null);

  const handleDelete = (meter: MainMeterAccount) => {
    if (mainMeters.length <= 1) {
      Alert.alert('Cannot Delete', 'You must have at least one active Main Meter Account.');
      return;
    }

    Alert.alert(
      'Delete Main Meter Account',
      `Are you sure you want to delete "${meter.name}"? This action will permanently cascade and delete all associated sub-meters, readings, and billing records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => deleteMainMeter(meter.id),
        },
      ]
    );
  };

  const handleEdit = (meter: MainMeterAccount) => {
    setEditingMeter(meter);
    setIsAddModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingMeter(null);
    setIsAddModalOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={themeColors.backgroundGradient} style={styles.gradientContainer}>
        {/* Global Header */}
        <GlobalHeader />

        <View style={styles.headerTitleRow}>
          <View>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Main Meter Accounts
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Manage buildings, complex accounts, and properties
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.headerAddBtn, { backgroundColor: themeColors.accentPrimary }]}
            onPress={handleOpenNewModal}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.headerAddBtnText}>Add Account</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={mainMeters}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedMainMeterId;
            const tenantCount = users.filter((u) => u.mainMeterId === item.id).length;

            return (
              <GlassCard
                style={[
                  styles.meterCard,
                  isSelected && { borderColor: themeColors.accentPrimary, borderWidth: 2 },
                ]}
              >
                <TouchableOpacity
                  style={styles.meterCardMain}
                  onPress={() => setSelectedMainMeterId(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: themeColors.accentPrimary + '20' }]}>
                    <Ionicons name="business" size={22} color={themeColors.accentPrimary} />
                  </View>

                  <View style={styles.meterInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.meterNameText, { color: themeColors.textPrimary }]}>
                        {item.name}
                      </Text>
                      {isSelected && (
                        <View style={[styles.activeTag, { backgroundColor: themeColors.accentPrimary }]}>
                          <Text style={styles.activeTagText}>ACTIVE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.tenantCountText, { color: themeColors.textSecondary }]}>
                      {`${tenantCount} Sub-Meter Tenants`}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: themeColors.inputBackground }]}
                    onPress={() => handleEdit(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={16} color={themeColors.accentPrimary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: themeColors.accentDanger + '15' }]}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={themeColors.accentDanger} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          }}
        />

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: themeColors.accentPrimary }]}
          onPress={handleOpenNewModal}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Add/Edit Main Meter Modal */}
        <AddMainMeterModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          initialMeter={editingMeter}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  meterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  meterCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meterNameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  activeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  tenantCountText: {
    fontSize: 13,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

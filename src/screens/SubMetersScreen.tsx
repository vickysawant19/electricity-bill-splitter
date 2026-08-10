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
import { AddTenantModal } from '../components/AddTenantModal';
import { User } from '../types';

export const SubMetersScreen: React.FC = () => {
  const {
    selectedMainMeterId,
    users,
    deleteTenant,
    themeMode,
  } = useDbContext();

  const themeColors = Colors[themeMode];
  const activeTenants = users.filter((u) => u.mainMeterId === selectedMainMeterId);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<User | null>(null);

  const handleDelete = (tenant: User) => {
    Alert.alert(
      'Delete Sub-Meter',
      `Are you sure you want to delete ${tenant.name} (${tenant.meterNumber})? All associated reading history will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTenant(tenant.id),
        },
      ]
    );
  };

  const handleEdit = (tenant: User) => {
    setEditingTenant(tenant);
    setIsAddModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingTenant(null);
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
              Sub-Meters (Tenants)
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {`${activeTenants.length} Tenants registered under active account`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.headerAddBtn, { backgroundColor: themeColors.accentPrimary }]}
            onPress={handleOpenNewModal}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.headerAddBtnText}>Add Tenant</Text>
          </TouchableOpacity>
        </View>

        {activeTenants.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="speedometer-outline" size={48} color={themeColors.textMuted} />
            <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
              No Sub-Meters Registered
            </Text>
            <Text style={[styles.emptyDesc, { color: themeColors.textSecondary }]}>
              Tap the "+ Add Tenant" button above to add sub-meter accounts for your tenants.
            </Text>
          </GlassCard>
        ) : (
          <FlatList
            data={activeTenants}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <GlassCard style={styles.tenantCard}>
                <View style={styles.cardLeft}>
                  <View style={[styles.avatar, { backgroundColor: themeColors.accentPrimary }]}>
                    <Text style={styles.avatarText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.tenantInfo}>
                    <Text style={[styles.nameText, { color: themeColors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <View style={styles.meterRow}>
                      <Ionicons name="speedometer-outline" size={13} color={themeColors.textSecondary} />
                      <Text style={[styles.meterText, { color: themeColors.textSecondary }]}>
                        {`Meter: ${item.meterNumber}`}
                      </Text>
                    </View>
                  </View>
                </View>

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
            )}
          />
        )}

        {/* Floating Action Button (FAB) */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: themeColors.accentPrimary }]}
          onPress={handleOpenNewModal}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Add/Edit Sub-Meter Modal */}
        <AddTenantModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          initialTenant={editingTenant}
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
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  tenantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  meterText: {
    fontSize: 13,
    marginLeft: 4,
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
  emptyCard: {
    marginHorizontal: 20,
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
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

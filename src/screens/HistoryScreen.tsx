import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';
import { GlobalHeader } from '../components/GlobalHeader';
import { GlassCard } from '../components/GlassCard';
import {
  getPastNMonths,
  formatMonthLabel,
  calculateMonthSummary,
  formatCurrency,
  formatUnits,
} from '../utils/calculations';
import {
  generateCombinedReportText,
  shareTextReport,
  generateAndShareCombinedPDF,
} from '../utils/reportGenerator';

export const HistoryScreen: React.FC = () => {
  const {
    mainMeters,
    selectedMainMeterId,
    selectedMonth,
    users,
    mainBills,
    readings,
    themeMode,
  } = useDbContext();

  const themeColors = Colors[themeMode];
  const activeMainMeter = mainMeters.find((m) => m.id === selectedMainMeterId);
  const activeTenants = users.filter((u) => u.mainMeterId === selectedMainMeterId);

  const [selectedTenantId, setSelectedTenantId] = useState<string>('ALL');
  const [historyRange, setHistoryRange] = useState<number>(6); // 6 or 12 months

  const pastMonths = getPastNMonths(selectedMonth, historyRange);

  // Compute month summaries for past months
  const historySummaries = pastMonths.map((m) =>
    calculateMonthSummary(selectedMainMeterId, m, users, mainBills, readings)
  );

  // Compute overall cumulative stats
  let totalUnits = 0;
  let totalBilled = 0;
  let rateSum = 0;
  let validRateCount = 0;

  historySummaries.forEach((s) => {
    if (selectedTenantId === 'ALL') {
      totalUnits += s.totalSubMeterUnits;
      totalBilled += s.totalMainBillAmount;
    } else {
      const tb = s.tenantBills.find((t) => t.tenant.id === selectedTenantId);
      if (tb) {
        totalUnits += tb.unitsConsumed;
        totalBilled += tb.calculatedBillAmount;
      }
    }

    if (s.costPerUnit > 0) {
      rateSum += s.costPerUnit;
      validRateCount += 1;
    }
  });

  const avgRate = validRateCount > 0 ? rateSum / validRateCount : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={themeColors.backgroundGradient} style={styles.gradientContainer}>
        {/* Global Header */}
        <GlobalHeader />

        <View style={styles.headerTitleRow}>
          <View>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Consumption History
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {`Past ${historyRange} Months Aggregate Analysis`}
            </Text>
          </View>

          {/* 6M / 12M Range Selector */}
          <View style={[styles.rangeToggle, { backgroundColor: themeColors.inputBackground }]}>
            <TouchableOpacity
              style={[
                styles.rangeBtn,
                historyRange === 6 && { backgroundColor: themeColors.accentPrimary },
              ]}
              onPress={() => setHistoryRange(6)}
            >
              <Text
                style={[
                  styles.rangeBtnText,
                  { color: historyRange === 6 ? '#FFFFFF' : themeColors.textSecondary },
                ]}
              >
                6M
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.rangeBtn,
                historyRange === 12 && { backgroundColor: themeColors.accentPrimary },
              ]}
              onPress={() => setHistoryRange(12)}
            >
              <Text
                style={[
                  styles.rangeBtnText,
                  { color: historyRange === 12 ? '#FFFFFF' : themeColors.textSecondary },
                ]}
              >
                12M
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tenant Filter Chips */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedTenantId === 'ALL'
                  ? { backgroundColor: themeColors.accentPrimary }
                  : { backgroundColor: themeColors.inputBackground, borderColor: themeColors.inputBorder, borderWidth: 1 },
              ]}
              onPress={() => setSelectedTenantId('ALL')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedTenantId === 'ALL' ? '#FFFFFF' : themeColors.textPrimary },
                ]}
              >
                All Tenants
              </Text>
            </TouchableOpacity>

            {activeTenants.map((t) => {
              const isSel = selectedTenantId === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.filterChip,
                    isSel
                      ? { backgroundColor: themeColors.accentPrimary }
                      : { backgroundColor: themeColors.inputBackground, borderColor: themeColors.inputBorder, borderWidth: 1 },
                  ]}
                  onPress={() => setSelectedTenantId(t.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isSel ? '#FFFFFF' : themeColors.textPrimary },
                    ]}
                  >
                    {t.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Aggregate Overview Metrics Cards */}
        <View style={styles.metricsContainer}>
          <GlassCard style={styles.metricCard}>
            <Ionicons name="flash-outline" size={20} color={themeColors.accentPrimary} />
            <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>
              Total Units
            </Text>
            <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>
              {formatUnits(totalUnits)}
            </Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <Ionicons name="wallet-outline" size={20} color={themeColors.accentSuccess} />
            <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>
              Total Billed
            </Text>
            <Text style={[styles.metricValue, { color: themeColors.accentSuccess }]}>
              {formatCurrency(totalBilled)}
            </Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <Ionicons name="trending-up-outline" size={20} color={themeColors.accentCyan} />
            <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>
              Avg Rate
            </Text>
            <Text style={[styles.metricValue, { color: themeColors.accentCyan }]}>
              {`${formatCurrency(avgRate)}/U`}
            </Text>
          </GlassCard>
        </View>

        {/* History Month Logs */}
        <FlatList
          data={historySummaries}
          keyExtractor={(item) => item.month}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const monthText = formatMonthLabel(item.month);
            const filteredTenantBills =
              selectedTenantId === 'ALL'
                ? item.tenantBills
                : item.tenantBills.filter((tb) => tb.tenant.id === selectedTenantId);

            return (
              <Animated.View
                entering={FadeInDown.delay(index * 60).duration(300)}
                layout={Layout.springify()}
              >
                <GlassCard style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.monthTagWrapper}>
                      <Ionicons name="calendar-sharp" size={16} color={themeColors.accentPrimary} />
                      <Text style={[styles.historyMonthText, { color: themeColors.textPrimary }]}>
                        {monthText}
                      </Text>
                    </View>

                    <View style={styles.historyHeaderRight}>
                      <Text style={[styles.historyMainBill, { color: themeColors.accentPrimary }]}>
                        {formatCurrency(item.totalMainBillAmount)}
                      </Text>
                      <TouchableOpacity
                        style={[styles.miniShareBtn, { backgroundColor: themeColors.inputBackground }]}
                        onPress={() => {
                          const text = generateCombinedReportText(activeMainMeter, item);
                          shareTextReport(`${activeMainMeter?.name} (${monthText})`, text);
                        }}
                      >
                        <Ionicons name="share-social" size={14} color={themeColors.accentPrimary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.miniPdfBtn, { backgroundColor: themeColors.accentPrimary + '20' }]}
                        onPress={() => generateAndShareCombinedPDF(activeMainMeter, item)}
                      >
                        <Ionicons name="document-text" size={14} color={themeColors.accentPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: themeColors.cardBorder }]} />

                  {/* Tenant Breakdown Table */}
                  {filteredTenantBills.length === 0 ? (
                    <Text style={[styles.noDataText, { color: themeColors.textMuted }]}>
                      No reading entry for this month.
                    </Text>
                  ) : (
                    filteredTenantBills.map((tb) => (
                      <View key={tb.tenant.id} style={styles.tenantRow}>
                        <View style={styles.tenantRowLeft}>
                          <Text style={[styles.tenantRowName, { color: themeColors.textPrimary }]}>
                            {tb.tenant.name}
                          </Text>
                          <Text style={[styles.tenantRowSub, { color: themeColors.textSecondary }]}>
                            {`${tb.previousReadingUsed} → ${tb.currentReadingUsed} (${tb.unitsConsumed} Units)`}
                          </Text>
                        </View>

                        <Text style={[styles.tenantRowBill, { color: themeColors.accentSuccess }]}>
                          {formatCurrency(tb.calculatedBillAmount)}
                        </Text>
                      </View>
                    ))
                  )}
                </GlassCard>
              </Animated.View>
            );
          }}
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
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rangeToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  rangeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 11,
  },
  rangeBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  filterRow: {
    marginVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 6,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    marginVertical: 0,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  historyCard: {
    marginVertical: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyMonthText: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 6,
  },
  historyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyMainBill: {
    fontSize: 16,
    fontWeight: '800',
  },
  miniShareBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPdfBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  tenantRowLeft: {
    flex: 1,
  },
  tenantRowName: {
    fontSize: 14,
    fontWeight: '700',
  },
  tenantRowSub: {
    fontSize: 12,
    marginTop: 1,
  },
  tenantRowBill: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  noDataText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 6,
  },
});

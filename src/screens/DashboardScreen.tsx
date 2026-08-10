import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';
import { GlobalHeader } from '../components/GlobalHeader';
import { MonthSelector } from '../components/MonthSelector';
import { GlassCard } from '../components/GlassCard';
import { TenantAccordionCard } from '../components/TenantAccordionCard';
import { GrowthChart } from '../components/GrowthChart';
import {
  calculateMonthSummary,
  resolveEffectiveMainMeterBill,
  parseNumericInput,
  formatCurrency,
} from '../utils/calculations';
import {
  generateCombinedReportText,
  shareTextReport,
  generateAndShareCombinedPDF,
} from '../utils/reportGenerator';

export const DashboardScreen: React.FC = () => {
  const {
    mainMeters,
    selectedMainMeterId,
    selectedMonth,
    users,
    mainBills,
    readings,
    saveMainBillField,
    themeMode,
  } = useDbContext();

  const themeColors = Colors[themeMode];
  const activeMainMeter = mainMeters.find((m) => m.id === selectedMainMeterId);

  // Resolve Main Meter Bill & auto carry-forward reading for current month
  const effectiveMainBill = resolveEffectiveMainMeterBill(
    selectedMainMeterId,
    selectedMonth,
    mainBills
  );

  const [billText, setBillText] = useState(
    effectiveMainBill.totalBillAmount ? effectiveMainBill.totalBillAmount.toString() : ''
  );
  const [prevReadingText, setPrevReadingText] = useState(
    effectiveMainBill.previousReading ? effectiveMainBill.previousReading.toString() : ''
  );
  const [currReadingText, setCurrReadingText] = useState(
    effectiveMainBill.currentReading ? effectiveMainBill.currentReading.toString() : ''
  );

  useEffect(() => {
    setBillText(effectiveMainBill.totalBillAmount ? effectiveMainBill.totalBillAmount.toString() : '');
    setPrevReadingText(effectiveMainBill.previousReading ? effectiveMainBill.previousReading.toString() : '');
    setCurrReadingText(effectiveMainBill.currentReading ? effectiveMainBill.currentReading.toString() : '');
  }, [selectedMainMeterId, selectedMonth, effectiveMainBill.totalBillAmount, effectiveMainBill.previousReading, effectiveMainBill.currentReading]);

  // Compute overall summary & tenant bill split
  const summary = calculateMonthSummary(
    selectedMainMeterId,
    selectedMonth,
    users,
    mainBills,
    readings
  );

  const handleBillChange = (val: string) => {
    setBillText(val);
    const num = parseNumericInput(val);
    saveMainBillField(selectedMainMeterId, selectedMonth, 'totalBillAmount', num);
  };

  const handlePrevReadingChange = (val: string) => {
    setPrevReadingText(val);
    const num = parseNumericInput(val);
    saveMainBillField(selectedMainMeterId, selectedMonth, 'mainMeterPreviousReading', num);
  };

  const handleCurrReadingChange = (val: string) => {
    setCurrReadingText(val);
    const num = parseNumericInput(val);
    saveMainBillField(selectedMainMeterId, selectedMonth, 'mainMeterCurrentReading', num);
  };

  const handleShareTextReport = () => {
    const text = generateCombinedReportText(activeMainMeter, summary);
    shareTextReport(`${activeMainMeter?.name || 'Bill'} Split Report`, text);
  };

  const handleExportPDF = () => {
    generateAndShareCombinedPDF(activeMainMeter, summary);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={themeColors.backgroundGradient} style={styles.gradientContainer}>
        {/* Global Header with Main Meter Switcher */}
        <GlobalHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Billing Cycle Month Navigation */}
          <MonthSelector />

          {/* Animated View Keyed by month + mainMeterId for smooth month/account transition */}
          <Animated.View
            key={`${selectedMainMeterId}_${selectedMonth}`}
            entering={FadeInRight.duration(350)}
            layout={Layout.springify()}
          >
            {/* Main Meter Glassmorphic Card */}
            <GlassCard style={styles.mainMeterCard}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="hardware-chip-outline" size={20} color={themeColors.accentPrimary} />
                <Text style={[styles.mainCardTitle, { color: themeColors.textPrimary }]}>
                  Main Meter Details
                </Text>
              </View>

              {/* Total Bill Input Field */}
              <View style={styles.inputFieldGroup}>
                <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>
                  Total Main Bill Amount (₹)
                </Text>
                <View
                  style={[
                    styles.currencyInputWrapper,
                    {
                      backgroundColor: themeColors.inputBackground,
                      borderColor: themeColors.inputBorder,
                    },
                  ]}
                >
                  <Text style={[styles.currencyPrefix, { color: themeColors.accentPrimary }]}>₹</Text>
                  <TextInput
                    style={[styles.currencyInput, { color: themeColors.textPrimary }]}
                    value={billText}
                    onChangeText={handleBillChange}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={themeColors.textMuted}
                  />
                </View>
              </View>

              {/* Previous & Current Main Meter Reading Inputs */}
              <View style={styles.readingsRow}>
                <View style={styles.readingCol}>
                  <View style={styles.labelWithBadge}>
                    <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>
                      Prev Reading
                    </Text>
                    {effectiveMainBill.isAutoCarriedForwardPrev && (
                      <View style={[styles.miniBadge, { backgroundColor: themeColors.accentCyan + '20' }]}>
                        <Text style={[styles.miniBadgeText, { color: themeColors.accentCyan }]}>
                          Auto
                        </Text>
                      </View>
                    )}
                  </View>
                  <TextInput
                    style={[
                      styles.readingInput,
                      {
                        backgroundColor: themeColors.inputBackground,
                        borderColor: themeColors.inputBorder,
                        color: themeColors.textPrimary,
                      },
                    ]}
                    value={prevReadingText}
                    onChangeText={handlePrevReadingChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={themeColors.textMuted}
                  />
                </View>

                <View style={styles.readingCol}>
                  <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>
                    Current Reading
                  </Text>
                  <TextInput
                    style={[
                      styles.readingInput,
                      {
                        backgroundColor: themeColors.inputBackground,
                        borderColor: themeColors.inputBorder,
                        color: themeColors.textPrimary,
                      },
                    ]}
                    value={currReadingText}
                    onChangeText={handleCurrReadingChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={themeColors.textMuted}
                  />
                </View>
              </View>
            </GlassCard>

            {/* Calculated Rate Indicator Banner Badge */}
            <View style={styles.rateBadgeContainer}>
              <LinearGradient
                colors={[themeColors.accentPrimary, themeColors.accentSecondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rateBadgeGradient}
              >
                <View style={styles.rateBadgeContent}>
                  <Ionicons name="flash" size={20} color="#FFFFFF" />
                  <View style={styles.rateBadgeTextWrapper}>
                    <Text style={styles.rateBadgeLabel}>Calculated Rate</Text>
                    <Text style={styles.rateBadgeValue}>
                      {formatCurrency(summary.costPerUnit)} / Unit
                    </Text>
                  </View>
                </View>
                <View style={styles.rateBadgeSubInfo}>
                  <Text style={styles.rateBadgeSubText}>
                    {`Total Sub Units: ${summary.totalSubMeterUnits.toFixed(1)}`}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Combined Monthly Report Action Buttons */}
            <View style={styles.shareReportRow}>
              <TouchableOpacity
                style={[styles.shareActionBtn, { backgroundColor: themeColors.accentSuccess }]}
                onPress={handleShareTextReport}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                <Text style={styles.shareActionBtnText}>Share Report</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareActionBtn, { backgroundColor: themeColors.accentPrimary }]}
                onPress={handleExportPDF}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
                <Text style={styles.shareActionBtnText}>Export PDF</Text>
              </TouchableOpacity>
            </View>

            {/* Sub-Meter Tenant Cards Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
                Tenant Sub-Meters Breakdown
              </Text>
              <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
                {`${summary.tenantBills.length} Tenants`}
              </Text>
            </View>

            {summary.tenantBills.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="people-outline" size={36} color={themeColors.textMuted} />
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                  No sub-meters added for this account yet.
                </Text>
                <Text style={[styles.emptySubText, { color: themeColors.textMuted }]}>
                  Go to Sub-Meters tab to register tenant meters.
                </Text>
              </GlassCard>
            ) : (
              summary.tenantBills.map((tenantBill) => (
                <TenantAccordionCard
                  key={tenantBill.tenant.id}
                  item={tenantBill}
                  month={selectedMonth}
                  costPerUnit={summary.costPerUnit}
                />
              ))
            )}

            {/* Growth Chart Component (Interactive Analytics) */}
            <GrowthChart />
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 75,
  },
  mainMeterCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  mainCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  inputFieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  currencyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  readingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  readingCol: {
    flex: 1,
  },
  labelWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginBottom: 4,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  readingInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  rateBadgeContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  rateBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rateBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateBadgeTextWrapper: {
    marginLeft: 12,
  },
  rateBadgeLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rateBadgeValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  rateBadgeSubInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rateBadgeSubText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  shareReportRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
    gap: 10,
  },
  shareActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  shareActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    marginHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});

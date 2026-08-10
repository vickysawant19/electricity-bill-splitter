import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';
import { GlassCard } from './GlassCard';
import {
  getPastNMonths,
  formatMonthLabel,
  resolveEffectiveTenantReading,
} from '../utils/calculations';

const PALETTE = ['#6366F1', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];

export const GrowthChart: React.FC = () => {
  const {
    selectedMainMeterId,
    selectedMonth,
    users,
    readings,
    themeMode,
  } = useDbContext();

  const themeColors = Colors[themeMode];
  const activeTenants = users.filter((u) => u.mainMeterId === selectedMainMeterId);

  const past5Months = getPastNMonths(selectedMonth, 5);
  const [selectedMonthCol, setSelectedMonthCol] = useState<string>(selectedMonth);

  // Compute unit consumption matrix for past 5 months x tenants
  const monthData = past5Months.map((m) => {
    let totalUnits = 0;
    const tenantUnits = activeTenants.map((t, idx) => {
      const res = resolveEffectiveTenantReading(t.id, m, readings);
      const units = Math.max(0, res.currentReading - res.previousReading);
      totalUnits += units;
      return {
        tenantId: t.id,
        tenantName: t.name,
        units,
        color: PALETTE[idx % PALETTE.length],
      };
    });

    return {
      month: m,
      monthLabel: formatMonthLabel(m).split(' ')[0], // "Jul"
      totalUnits,
      tenantUnits,
    };
  });

  const maxUnitsAllMonths = Math.max(
    ...monthData.map((d) => d.totalUnits),
    100
  );

  // SVG Chart Layout
  const screenWidth = Dimensions.get('window').width - 64; // Card inner padding
  const chartHeight = 180;
  const paddingBottom = 25;
  const barAreaHeight = chartHeight - paddingBottom;
  const colWidth = screenWidth / past5Months.length;
  const barWidth = Math.min(28, colWidth * 0.45);

  const selectedColData = monthData.find((d) => d.month === selectedMonthCol) || monthData[monthData.length - 1];

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>
            Consumption Trends
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Past 5 months unit comparison
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: themeColors.accentPrimary + '20' }]}>
          <Text style={[styles.badgeText, { color: themeColors.accentPrimary }]}>
            {selectedColData ? `${selectedColData.totalUnits} Units Total` : 'Analytics'}
          </Text>
        </View>
      </View>

      {/* SVG Bar Chart */}
      <View style={styles.chartWrapper}>
        <Svg width={screenWidth} height={chartHeight}>
          {/* Baseline Grid */}
          <Line
            x1={0}
            y1={barAreaHeight}
            x2={screenWidth}
            y2={barAreaHeight}
            stroke={themeColors.cardBorder}
            strokeWidth={1}
          />

          {monthData.map((d, colIdx) => {
            const centerX = colIdx * colWidth + colWidth / 2;
            const barX = centerX - barWidth / 2;

            // Stacked bar calculation
            let currentY = barAreaHeight;

            return (
              <G key={d.month}>
                {/* Clickable Column Touch Zone */}
                <Rect
                  x={colIdx * colWidth}
                  y={0}
                  width={colWidth}
                  height={chartHeight}
                  fill="transparent"
                  onPress={() => setSelectedMonthCol(d.month)}
                />

                {/* Highlight selected column background */}
                {d.month === selectedMonthCol && (
                  <Rect
                    x={colIdx * colWidth + 4}
                    y={4}
                    width={colWidth - 8}
                    height={barAreaHeight}
                    rx={8}
                    fill={themeColors.accentPrimary + '15'}
                  />
                )}

                {/* Stacked Tenant Bars */}
                {d.tenantUnits.map((tUnit) => {
                  const segmentHeight =
                    maxUnitsAllMonths > 0
                      ? (tUnit.units / maxUnitsAllMonths) * barAreaHeight
                      : 0;

                  currentY -= segmentHeight;

                  return (
                    <Rect
                      key={tUnit.tenantId}
                      x={barX}
                      y={currentY}
                      width={barWidth}
                      height={segmentHeight}
                      rx={3}
                      fill={tUnit.color}
                      opacity={d.month === selectedMonthCol ? 1.0 : 0.75}
                    />
                  );
                })}

                {/* Month Label */}
                <SvgText
                  x={centerX}
                  y={chartHeight - 6}
                  fontSize={11}
                  fontWeight={d.month === selectedMonthCol ? '700' : '500'}
                  fill={d.month === selectedMonthCol ? themeColors.accentPrimary : themeColors.textSecondary}
                  textAnchor="middle"
                >
                  {d.monthLabel}
                </SvgText>

                {/* Total Units Label above bar */}
                {d.totalUnits > 0 && (
                  <SvgText
                    x={centerX}
                    y={Math.max(12, currentY - 6)}
                    fontSize={10}
                    fontWeight="600"
                    fill={themeColors.textSecondary}
                    textAnchor="middle"
                  >
                    {d.totalUnits}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Color-Coded Tenant Legends */}
      <View style={styles.legendContainer}>
        {activeTenants.map((tenant, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          const currentTenantStat = selectedColData?.tenantUnits.find(
            (t) => t.tenantId === tenant.id
          );
          const tenantUnits = currentTenantStat ? currentTenantStat.units : 0;

          return (
            <TouchableOpacity
              key={tenant.id}
              style={[styles.legendChip, { backgroundColor: themeColors.inputBackground }]}
              onPress={() => setSelectedMonthCol(selectedMonthCol)}
              activeOpacity={0.8}
            >
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={[styles.legendName, { color: themeColors.textPrimary }]}>
                {tenant.name}
              </Text>
              <Text style={[styles.legendUnits, { color: color }]}>
                {tenantUnits} U
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendName: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  legendUnits: {
    fontSize: 12,
    fontWeight: '700',
  },
});

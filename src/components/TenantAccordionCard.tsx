import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { TenantBillDetails } from '../types';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';
import { GlassCard } from './GlassCard';
import { formatCurrency, formatUnits, parseNumericInput } from '../utils/calculations';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TenantAccordionCardProps {
  item: TenantBillDetails;
  month: string;
}

export const TenantAccordionCard: React.FC<TenantAccordionCardProps> = ({ item, month }) => {
  const { tenant, previousReadingUsed, currentReadingUsed, isAutoCarriedForwardPrev, unitsConsumed, calculatedBillAmount } = item;
  const { saveReadingField, themeMode } = useDbContext();

  const [expanded, setExpanded] = useState(false);
  const [prevText, setPrevText] = useState(previousReadingUsed ? previousReadingUsed.toString() : '');
  const [currText, setCurrText] = useState(currentReadingUsed ? currentReadingUsed.toString() : '');

  // Keep local input state in sync if external data changes (e.g. month change)
  React.useEffect(() => {
    setPrevText(previousReadingUsed ? previousReadingUsed.toString() : '');
    setCurrText(currentReadingUsed ? currentReadingUsed.toString() : '');
  }, [previousReadingUsed, currentReadingUsed, month]);

  const rotation = useSharedValue(0);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    rotation.value = withTiming(expanded ? 0 : 180, { duration: 250 });
  };

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const themeColors = Colors[themeMode];

  const handlePrevChange = (val: string) => {
    setPrevText(val);
    const num = parseNumericInput(val);
    saveReadingField(tenant.id, month, 'previousReading', num);
  };

  const handleCurrChange = (val: string) => {
    setCurrText(val);
    const num = parseNumericInput(val);
    saveReadingField(tenant.id, month, 'currentReading', num);
  };

  // Generate distinct color badge based on tenant initial
  const avatarColors = ['#6366F1', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];
  const avatarColorIndex = (tenant.name.charCodeAt(0) || 0) % avatarColors.length;
  const avatarBg = avatarColors[avatarColorIndex];

  return (
    <GlassCard style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        {/* Avatar Badge */}
        <View style={[styles.avatarBadge, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{tenant.name.charAt(0).toUpperCase()}</Text>
        </View>

        {/* Tenant Details */}
        <View style={styles.tenantInfo}>
          <Text style={[styles.tenantName, { color: themeColors.textPrimary }]}>
            {tenant.name}
          </Text>
          <View style={styles.meterRow}>
            <Ionicons name="speedometer-outline" size={13} color={themeColors.textSecondary} />
            <Text style={[styles.meterNumberText, { color: themeColors.textSecondary }]}>
              {tenant.meterNumber}
            </Text>
          </View>
        </View>

        {/* Calculation Summaries */}
        <View style={styles.summaryRight}>
          <Text style={[styles.billText, { color: themeColors.accentPrimary }]}>
            {formatCurrency(calculatedBillAmount)}
          </Text>
          <Text style={[styles.unitsText, { color: themeColors.textSecondary }]}>
            {formatUnits(unitsConsumed)}
          </Text>
        </View>

        {/* Expand Arrow */}
        <Animated.View style={[styles.arrowContainer, arrowAnimatedStyle]}>
          <Ionicons name="chevron-down" size={18} color={themeColors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>

      {/* Accordion Expanded Body */}
      {expanded && (
        <View style={[styles.expandedBody, { borderTopColor: themeColors.cardBorder }]}>
          {/* Previous Reading Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>
                Previous Reading
              </Text>
              {isAutoCarriedForwardPrev && (
                <View style={[styles.autoBadge, { backgroundColor: themeColors.accentCyan + '20' }]}>
                  <Ionicons name="repeat-sharp" size={11} color={themeColors.accentCyan} />
                  <Text style={[styles.autoBadgeText, { color: themeColors.accentCyan }]}>
                    Auto Carried
                  </Text>
                </View>
              )}
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: themeColors.inputBackground,
                  borderColor: themeColors.inputBorder,
                  color: themeColors.textPrimary,
                },
              ]}
              value={prevText}
              onChangeText={handlePrevChange}
              keyboardType="numeric"
              placeholder="e.g. 1000"
              placeholderTextColor={themeColors.textMuted}
            />
          </View>

          {/* Current Reading Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>
              Current Reading
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: themeColors.inputBackground,
                  borderColor: themeColors.inputBorder,
                  color: themeColors.textPrimary,
                },
              ]}
              value={currText}
              onChangeText={handleCurrChange}
              keyboardType="numeric"
              placeholder="e.g. 1150"
              placeholderTextColor={themeColors.textMuted}
            />
          </View>

          {/* Calculation Formula Banner */}
          <View style={[styles.formulaBanner, { backgroundColor: themeColors.cardBackground }]}>
            <Ionicons name="calculator-outline" size={14} color={themeColors.textSecondary} />
            <Text style={[styles.formulaText, { color: themeColors.textSecondary }]}>
              {`Units: ${currentReadingUsed} - ${previousReadingUsed} = `}
              <Text style={{ fontWeight: '700', color: themeColors.accentPrimary }}>
                {unitsConsumed} Units
              </Text>
            </Text>
          </View>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  tenantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '700',
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  meterNumberText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  summaryRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  billText: {
    fontSize: 16,
    fontWeight: '800',
  },
  unitsText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  arrowContainer: {
    padding: 4,
  },
  expandedBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  autoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  formulaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  formulaText: {
    fontSize: 13,
    marginLeft: 6,
  },
});

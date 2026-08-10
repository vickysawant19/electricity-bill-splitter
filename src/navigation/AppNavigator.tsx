import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDbContext } from '../context/DbContext';
import { Colors } from '../theme/colors';

import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SubMetersScreen } from '../screens/SubMetersScreen';
import { MainMetersScreen } from '../screens/MainMetersScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  const { themeMode } = useDbContext();
  const themeColors = Colors[themeMode];
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 4);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: themeColors.accentPrimary,
          tabBarInactiveTintColor: themeColors.textSecondary,
          tabBarStyle: {
            backgroundColor: themeColors.tabBarBackground,
            borderTopColor: themeColors.cardBorder,
            borderTopWidth: 1,
            height: 62 + bottomInset,
            paddingBottom: bottomInset,
            paddingTop: 6,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            zIndex: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginBottom: 2,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'History') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            } else if (route.name === 'SubMeters') {
              iconName = focused ? 'clipboard' : 'clipboard-outline';
            } else if (route.name === 'MainMeters') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size || 21} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ tabBarLabel: 'Dashboard' }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ tabBarLabel: 'History' }}
        />
        <Tab.Screen
          name="SubMeters"
          component={SubMetersScreen}
          options={{ tabBarLabel: 'Sub-Meters' }}
        />
        <Tab.Screen
          name="MainMeters"
          component={MainMetersScreen}
          options={{ tabBarLabel: 'Main Meters' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

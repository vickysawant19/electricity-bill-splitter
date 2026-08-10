import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DbContextProvider } from './src/context/DbContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AnimatedSplashScreen } from './src/components/AnimatedSplashScreen';

export default function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <DbContextProvider>
          <AppNavigator />
          {!isSplashFinished && (
            <AnimatedSplashScreen onFinish={() => setIsSplashFinished(true)} />
          )}
        </DbContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

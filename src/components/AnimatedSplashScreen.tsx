import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onFinish }) => {
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const progressWidth = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Entrance animation for Logo Badge
    logoScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    // 2. Pulsing Glow Ring Animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 800, easing: Easing.ease }),
        withTiming(1, { duration: 800, easing: Easing.ease })
      ),
      -1,
      true
    );

    // 3. Text entrance animation
    textOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    textTranslateY.value = withSpring(0, { damping: 12 });

    // 4. Progress bar fill animation
    progressWidth.value = withTiming(width * 0.5, { duration: 1800, easing: Easing.inOut(Easing.ease) }, () => {
      // 5. Fade out splash screen when progress completes
      containerOpacity.value = withTiming(0, { duration: 400 }, () => {
        runOnJS(onFinish)();
      });
    });
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.35,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, containerAnimatedStyle]}>
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#311042']}
        style={styles.gradient}
      >
        <View style={styles.centerContainer}>
          {/* Pulsing Backlight Glow */}
          <Animated.View style={[styles.pulseCircle, pulseAnimatedStyle]} />

          {/* Logo Badge Icon */}
          <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
            <LinearGradient
              colors={['#6366F1', '#3B82F6', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="flash-sharp" size={54} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* App Name & Subtitle */}
          <Animated.View style={[styles.textWrapper, textAnimatedStyle]}>
            <Text style={styles.titleText}>WattSplit</Text>
            <Text style={styles.subtitleText}>Smart Sub-Meter Bill Splitter</Text>
          </Animated.View>

          {/* Animated Progress Line */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, progressAnimatedStyle]}>
              <LinearGradient
                colors={['#6366F1', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>

        <Text style={styles.footerText}>⚡ Offline-First Multi-Account Engine</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pulseCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#6366F1',
  },
  logoWrapper: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  textWrapper: {
    alignItems: 'center',
    marginTop: 24,
  },
  titleText: {
    color: '#F8FAFC',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  progressTrack: {
    width: width * 0.5,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 36,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

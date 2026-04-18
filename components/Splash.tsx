// Branded splash screen — mirrors the web splash (orange bg, floating blobs, spring logo).

import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

const ORANGE = '#e8734a';

function useFloat(duration: number, toX: number, toY: number, toRot: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [v, duration]);
  return {
    transform: [
      { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, toX] }) },
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, toY] }) },
      { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${toRot}deg`] }) },
    ],
  };
}

export function Splash() {
  const scale = useRef(new Animated.Value(0.55)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.04,
            duration: 600,
            easing: Easing.bezier(0.34, 1.56, 0.64, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, [scale, opacity]);

  const tr = useFloat(7000, -12, 18, 4);
  const tl = useFloat(8000, 10, 14, -5);
  const bl = useFloat(9000, 14, -12, 3);
  const br = useFloat(6000, -10, -14, -4);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.blob, styles.blobTR, tr]} />
      <Animated.View style={[styles.blob, styles.blobTL, tl]} />
      <Animated.View style={[styles.blob, styles.blobBL, bl]} />
      <Animated.View style={[styles.blob, styles.blobBR, br]} />
      <Animated.View style={{ opacity, transform: [{ scale }], zIndex: 2 }}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  blob: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.13)' },
  blobTR: { width: 340, height: 320, top: -100, right: -80, borderTopLeftRadius: 160, borderTopRightRadius: 200, borderBottomLeftRadius: 180, borderBottomRightRadius: 140 },
  blobTL: { width: 200, height: 180, top: -60, left: -50, borderTopLeftRadius: 120, borderTopRightRadius: 80, borderBottomLeftRadius: 100, borderBottomRightRadius: 100 },
  blobBL: { width: 300, height: 280, bottom: -90, left: -70, borderTopLeftRadius: 165, borderTopRightRadius: 135, borderBottomLeftRadius: 120, borderBottomRightRadius: 180 },
  blobBR: { width: 180, height: 180, bottom: -50, right: -40, borderTopLeftRadius: 81, borderTopRightRadius: 99, borderBottomLeftRadius: 108, borderBottomRightRadius: 72 },
  logo: { width: 280, height: 110 },
});

import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { AppText, Logo } from "@/src/components";
import { darkColors } from "@/src/theme/colors";
import { storage } from "@/src/utils/storage";

const ONBOARDING_KEY = "bbd.onboarding.seen";

export default function Splash() {
  const router = useRouter();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      true,
    );
    const t = setTimeout(async () => {
      const seen = await storage.getItem<boolean>(ONBOARDING_KEY, false);
      router.replace(seen ? "/(tabs)" : "/onboarding");
    }, 1600);
    return () => clearTimeout(t);
  }, []);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.container} testID="splash-screen">
      <Animated.View style={animated} entering={FadeIn.duration(500)}>
        <Logo size={88} radius={22} />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(300).duration(600)}>
        <AppText variant="title" color="#FFFFFF" center style={{ marginTop: 24, letterSpacing: 0.5 }}>
          BBD PROFOLIO
        </AppText>
        <AppText variant="label" center style={{ marginTop: 6, color: darkColors.onSurfaceSecondary }}>
          by BBD Select
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});

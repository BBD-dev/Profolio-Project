import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Button, Logo } from "@/src/components";
import { useTheme } from "@/src/theme/ThemeContext";
import { storage } from "@/src/utils/storage";

const ONBOARDING_KEY = "bbd.onboarding.seen";
const { width } = Dimensions.get("window");

const SLIDES = [
  {
    key: "1",
    image:
      "https://images.pexels.com/photos/35184836/pexels-photo-35184836.jpeg?auto=compress&cs=tinysrgb&w=940",
    title: "Discover Real Projects",
    body: "Explore applications, websites, designs and digital products built by BBD Select students.",
  },
  {
    key: "2",
    image:
      "https://images.pexels.com/photos/7562087/pexels-photo-7562087.jpeg?auto=compress&cs=tinysrgb&w=940",
    title: "Meet Verified Talent",
    body: "Every graduate is verified by BBD Select. Browse portfolios, skills and availability.",
  },
  {
    key: "3",
    image:
      "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=940",
    title: "Built for the Real World",
    body: "A premium showcase of production-grade work — not a social feed, just proven craft.",
  },
];

export default function Onboarding() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await storage.setItem(ONBOARDING_KEY, true);
    router.replace("/(tabs)");
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="onboarding-screen">
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.key}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <LinearGradient
                colors={["rgba(5,9,20,0.1)", "rgba(5,9,20,0.55)", colors.surface]}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.logoTop, { paddingTop: insets.top + 16 }]}>
                <Logo size={40} />
                <AppText weight="semibold" color="#FFFFFF" style={{ letterSpacing: 0.5 }}>
                  BBD PROFOLIO
                </AppText>
              </View>
            </View>
            <View style={styles.textWrap}>
              <AppText variant="title">{item.title}</AppText>
              <AppText variant="body" muted style={{ marginTop: 10, lineHeight: 22 }}>
                {item.body}
              </AppText>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 22 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: i === index ? colors.brandPrimary : colors.border,
              }}
            />
          ))}
        </View>
        <Button
          title={index === SLIDES.length - 1 ? "Get Started" : "Next"}
          onPress={next}
          fullWidth
          testID="onboarding-next-button"
        />
        <Button title="Skip" onPress={finish} variant="ghost" fullWidth style={{ marginTop: 10, borderWidth: 0 }} testID="onboarding-skip-button" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageWrap: { height: Dimensions.get("window").height * 0.52 },
  logoTop: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20 },
  textWrap: { paddingHorizontal: 24, marginTop: 24 },
  footer: { paddingHorizontal: 24, gap: 4 },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center", marginBottom: 20 },
});

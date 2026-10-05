import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image as RNImage,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "./AppText";
import { useTheme } from "@/src/theme/ThemeContext";
import { normalizeGalleryImages } from "@/src/utils/gallery";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";
const DEFAULT_RATIO = 16 / 10;

type Props = {
  images: string[];
  exclude?: string[];
  title?: string;
};

function useImageAspectRatio(uri: string): number {
  const [ratio, setRatio] = useState(DEFAULT_RATIO);

  useEffect(() => {
    let cancelled = false;
    setRatio(DEFAULT_RATIO);

    RNImage.getSize(
      uri,
      (width, height) => {
        if (!cancelled && width > 0 && height > 0) {
          setRatio(width / height);
        }
      },
      () => {
        if (!cancelled) setRatio(DEFAULT_RATIO);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [uri]);

  return ratio;
}

function ShowcaseImage({
  uri,
  width,
  onPress,
}: {
  uri: string;
  width: number;
  onPress?: () => void;
}) {
  const { colors, radius } = useTheme();
  const ratio = useImageAspectRatio(uri);

  const frame = (
    <View
      style={[
        styles.frame,
        {
          width,
          borderRadius: radius.lg,
          borderColor: colors.border,
          overflow: "hidden",
        },
      ]}
    >
      <Image
        source={{ uri }}
        placeholder={BLURHASH}
        style={{ width, aspectRatio: ratio }}
        contentFit="cover"
        transition={200}
      />
      {onPress ? (
        <View style={[styles.tapHint, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
          <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
          <AppText variant="caption" style={{ color: "#FFFFFF", marginLeft: 4 }}>
            Tap to expand
          </AppText>
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return frame;
  return <Pressable onPress={onPress}>{frame}</Pressable>;
}

export function ImageGallery({ images, exclude = [], title = "Gallery" }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const slides = useMemo(() => normalizeGalleryImages(images, exclude), [images, exclude]);
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [listWidth, setListWidth] = useState(SCREEN_W - 32);
  const listRef = useRef<FlatList<string>>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const next = viewableItems[0]?.index;
    if (typeof next === "number") setIndex(next);
  }).current;

  if (!slides.length) {
    return (
      <View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary, borderRadius: 16 }]}>
        <Ionicons name="images-outline" size={28} color={colors.onSurfaceSecondary} />
        <AppText variant="caption" muted center style={{ marginTop: 8 }}>
          No project screenshots yet
        </AppText>
      </View>
    );
  }

  const openViewer = (i: number) => {
    setIndex(i);
    setViewerOpen(true);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (listWidth <= 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / listWidth);
    setIndex(Math.max(0, Math.min(next, slides.length - 1)));
  };

  return (
    <View onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}>
      {slides.length === 1 ? (
        <ShowcaseImage uri={slides[0]} width={listWidth} onPress={() => openViewer(0)} />
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={slides}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, i) => `${item}-${i}`}
            snapToInterval={listWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            bounces={false}
            onMomentumScrollEnd={onScrollEnd}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            renderItem={({ item, index: i }) => (
              <ShowcaseImage uri={item} width={listWidth} onPress={() => openViewer(i)} />
            )}
            getItemLayout={(_, i) => ({ length: listWidth, offset: listWidth * i, index: i })}
          />

          <View style={styles.footer}>
            <View style={styles.dots}>
              {slides.map((_, i) => (
                <Pressable
                  key={slides[i]}
                  onPress={() => {
                    listRef.current?.scrollToIndex({ index: i, animated: true });
                    setIndex(i);
                  }}
                  hitSlop={6}
                >
                  <View
                    style={{
                      width: i === index ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: i === index ? colors.brandPrimary : colors.border,
                    }}
                  />
                </Pressable>
              ))}
            </View>
            <AppText variant="caption" muted>
              {index + 1} / {slides.length}
            </AppText>
          </View>
        </>
      )}

      <Modal visible={viewerOpen} animationType="fade" transparent onRequestClose={() => setViewerOpen(false)}>
        <View style={[styles.viewer, { backgroundColor: "rgba(5,9,20,0.96)" }]}>
          <View style={[styles.viewerBar, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => setViewerOpen(false)} hitSlop={12} style={styles.viewerClose}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
            <AppText variant="label" style={{ color: "#FFFFFF" }}>
              {title}{slides.length > 1 ? ` · ${index + 1}/${slides.length}` : ""}
            </AppText>
            <View style={{ width: 34 }} />
          </View>

          {slides.length === 1 ? (
            <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 12 }}>
              <Image
                source={{ uri: slides[0] }}
                style={{ width: "100%", height: SCREEN_H * 0.72 }}
                contentFit="contain"
                transition={200}
              />
            </View>
          ) : (
            <FlatList
              data={slides}
              horizontal
              pagingEnabled
              initialScrollIndex={index}
              getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, i) => `full-${item}-${i}`}
              onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
              renderItem={({ item }) => (
                <View style={{ width: SCREEN_W, height: SCREEN_H * 0.72, justifyContent: "center", paddingHorizontal: 12 }}>
                  <Image source={{ uri: item }} style={{ width: "100%", height: "100%" }} contentFit="contain" transition={200} />
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    borderWidth: StyleSheet.hairlineWidth,
  },
  frame: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  tapHint: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 2,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  viewer: {
    flex: 1,
  },
  viewerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  viewerClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

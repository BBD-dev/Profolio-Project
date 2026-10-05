import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

const LOGO = require("../../assets/images/bbd-logo.jpeg");

/** Zoom past the dark padding baked into the JPEG asset. */
const CROP_SCALE = 1.42;

export function Logo({ size = 40, radius }: { size?: number; radius?: number }) {
  const corner = radius ?? Math.round(size * 0.24);

  return (
    <View
      style={[styles.wrap, { width: size, height: size, borderRadius: corner }]}
      testID="bbd-logo"
    >
      <Image
        source={LOGO}
        style={{ width: size * CROP_SCALE, height: size * CROP_SCALE }}
        contentFit="cover"
        contentPosition="center"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});

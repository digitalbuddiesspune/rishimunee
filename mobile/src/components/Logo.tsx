import React from "react";
import { Image, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";

const sizeMap = {
  sm: { height: 40, width: 120 },
  md: { height: 56, width: 168 },
  lg: { height: 80, width: 220 },
  xl: { height: 96, width: 260 },
} as const;

type LogoSize = keyof typeof sizeMap;

type LogoProps = {
  size?: LogoSize;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Logo({ size = "md", onPress, style }: LogoProps) {
  const dimensions = sizeMap[size];
  const image = (
    <Image
      source={require("../../assets/logoR.png")}
      style={{ height: dimensions.height, width: dimensions.width }}
      resizeMode="contain"
      accessibilityLabel="RisheeMuni"
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
        {image}
      </TouchableOpacity>
    );
  }

  return <View style={style}>{image}</View>;
}

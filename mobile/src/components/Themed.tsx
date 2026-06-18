import React from "react";
import {
  Text as RNText,
  View as RNView,
  type TextProps,
  type ViewProps,
} from "react-native";
import { useThemeColors } from "@theme/index";

export const View = (props: ViewProps) => {
  const c = useThemeColors();
  return <RNView {...props} style={[props.style]} />;
};

export const Card = (props: ViewProps) => {
  const c = useThemeColors();
  return (
    <RNView
      {...props}
      style={[
        {
          backgroundColor: c.card,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
        },
        props.style,
      ]}
    />
  );
};

export const Text = (props: TextProps & { soft?: boolean }) => {
  const c = useThemeColors();
  return (
    <RNText
      {...props}
      style={[
        { color: props.soft ? c.textSoft : c.text, fontSize: 16 },
        props.style,
      ]}
    />
  );
};

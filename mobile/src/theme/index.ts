import { lightColors, type ThemeColors } from "./colors";

export const useThemeColors = (): ThemeColors => {
  // Force light theme for the entire app
  return lightColors;
};

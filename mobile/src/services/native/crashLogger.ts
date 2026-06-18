import { NativeModules, Platform } from "react-native";

type CrashLoggerModuleType = {
  getLastCrash: () => Promise<string | null> | string | null;
  clearLastCrash?: () => Promise<void> | void;
};

const crashLogger = NativeModules.CrashLogger as CrashLoggerModuleType | undefined;

export async function getAndClearLastNativeCrash(): Promise<string | null> {
  if (Platform.OS !== "android" || !crashLogger?.getLastCrash) return null;

  try {
    const value = await crashLogger.getLastCrash();
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) return null;
    await crashLogger.clearLastCrash?.();
    return text;
  } catch {
    return null;
  }
}

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";

export async function saveToken(token: string) {
  try {
    if (Platform.OS === "web") {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainService: TOKEN_KEY
      });
    }
  } catch {}
}

export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY, {
        keychainService: TOKEN_KEY
      });
    }
  } catch {
    return null;
  }
}

export async function clearToken() {
  try {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY, {
        keychainService: TOKEN_KEY
      });
    }
  } catch {}
}


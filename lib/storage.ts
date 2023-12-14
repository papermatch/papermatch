import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const Storage = Platform.select({
  web: {
    getItem: (key: string) => {
      return AsyncStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
      AsyncStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
      AsyncStorage.removeItem(key);
    },
  },
  default: {
    getItem: (key: string) => {
      return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
      SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
      SecureStore.deleteItemAsync(key);
    },
  },
});

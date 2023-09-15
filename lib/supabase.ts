import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_API_URL } from "@env";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ExpoSecureStoreAdapter = Platform.select({
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

const supabaseUrl = SUPABASE_API_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;
const options = {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
};

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  options
);

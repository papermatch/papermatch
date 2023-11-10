import "react-native-get-random-values";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Pressable } from "react-native";
import {
  Avatar as RNPAvatar,
  ActivityIndicator,
  FAB,
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { v4 as uuidv4 } from "uuid";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

export default function Avatar({
  url,
  size = 150,
  onUpload,
  onPress,
}: {
  url: string | null;
  size: number;
  onUpload?: (newUrl: string) => void;
  onPress?: () => void;
}) {
  const [loading, setLoading] = useState(!!url);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [error, setError] = useState(false);
  const theme = useTheme();
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

  useEffect(() => {
    setAvatarUrl(url);
  }, [url]);

  async function uploadAvatar() {
    try {
      setUploading(true);

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
      });

      if (result.canceled) {
        throw new Error("User cancelled image picker");
      } else if (!result.assets) {
        throw new Error("No assets found");
      } else if (!result.assets[0].base64) {
        throw new Error("No base64 found");
      }

      const contentType = "image/jpeg";
      const fileExt = "jpeg";
      const filePath = `${uuidv4()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(result.assets[0].base64), {
          contentType: contentType,
        });

      if (error) {
        throw error;
      }

      const { data } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);

      if (!data) {
        throw new Error("Could not create signed url");
      }

      if (onUpload) {
        onUpload(data.signedUrl);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  if (uploading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator animating={true} size={size} />
      </View>
    );
  }

  return (
    <Pressable onPress={onPress || uploadAvatar} disabled={uploading}>
      {avatarUrl && !error ? (
        <View>
          <ShimmerPlaceholder
            style={{
              width: size,
              height: size,
              borderRadius: 3 * theme.roundness,
              backgroundColor: theme.colors.elevation.level1,
            }}
            shimmerColors={[
              theme.colors.elevation.level2,
              theme.colors.elevation.level3,
              theme.colors.elevation.level4,
            ]}
            visible={!loading}
          >
            <Image
              style={{
                width: size,
                height: size,
                borderRadius: 3 * theme.roundness,
              }}
              source={{ uri: avatarUrl }}
              onError={(error) => {
                if (error instanceof Error) {
                  console.error(error.message);
                }
                setError(true);
              }}
              onLoadEnd={() => {
                setLoading(false);
              }}
            />
          </ShimmerPlaceholder>
          <FAB
            icon="close"
            style={{ position: "absolute", margin: 12, right: 0, top: 0 }}
            customSize={30}
            visible={!onPress}
            onPress={() => onUpload && onUpload("")}
          />
        </View>
      ) : (
        <RNPAvatar.Icon size={size} icon={onPress ? "account" : "plus"} />
      )}
    </Pressable>
  );
}

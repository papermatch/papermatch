import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Pressable } from "react-native";
import {
  Avatar as RNPAvatar,
  ActivityIndicator,
  FAB,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { v4 as uuidv4 } from "uuid";
import { useStyles } from "../lib/styles";

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
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>("");
  const styles = useStyles();

  useEffect(() => {
    setAvatarUrl(url);
  }, [url]);

  function getContentTypeAndExtension(uri: string) {
    const match = uri.match(/^data:(.+?);base64,/);
    if (match) {
      const mime = require("mime");
      const contentType = match[1];
      const fileExt = mime.getExtension(contentType);
      return { contentType, fileExt };
    }
    throw new Error("Invalid data URI");
  }

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

      const { contentType, fileExt } = getContentTypeAndExtension(
        result.assets[0].uri
      );
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
        console.log(error.message);
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
      {avatarUrl ? (
        <View>
          <RNPAvatar.Image
            style={styles.verticallySpaced}
            size={size}
            source={{ uri: avatarUrl }}
          />
          <FAB
            icon="close"
            style={{ position: "absolute", margin: 12, right: 0, top: 0 }}
            customSize={30}
            visible={!onPress}
            onPress={() => onUpload && onUpload("")}
          />
        </View>
      ) : (
        <RNPAvatar.Icon
          style={styles.verticallySpaced}
          size={size}
          icon={onPress ? "account" : "plus"}
        />
      )}
    </Pressable>
  );
}

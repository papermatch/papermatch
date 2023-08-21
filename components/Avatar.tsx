import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Image, Button } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { v4 as uuidv4 } from "uuid";

interface Props {
  size: number;
  url: string | null;
  onUpload?: (filePath: string) => void;
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>("");
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) setAvatarUrl(url);
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

      let { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(result.assets[0].base64), {
          contentType: contentType,
        });

      if (error) {
        throw error;
      }

      let { data } = await supabase.storage
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
        Alert.alert(error.message);
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <View>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          aria-label="Avatar"
          style={[
            avatarSize,
            styles.avatar,
            styles.image,
            styles.verticallySpaced,
          ]}
        />
      ) : (
        <View
          style={[
            avatarSize,
            styles.avatar,
            styles.noImage,
            styles.verticallySpaced,
          ]}
        />
      )}
      {onUpload && (
        <View style={styles.verticallySpaced}>
          <Button
            title={uploading ? "Uploading ..." : "Upload"}
            onPress={uploadAvatar}
            disabled={uploading}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 5,
    overflow: "hidden",
    maxWidth: "100%",
  },
  image: {
    objectFit: "cover",
    paddingTop: 0,
    // center image horizontally
    marginLeft: "auto",
    marginRight: "auto",
  },
  noImage: {
    backgroundColor: "#333",
    border: "1px solid rgb(200, 200, 200)",
    borderRadius: 5,
    marginLeft: "auto",
    marginRight: "auto",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
});

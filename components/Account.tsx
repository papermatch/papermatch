import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, ScrollView, ActivityIndicator } from "react-native";
import {
  Button,
  TextInput,
  Appbar,
  Dialog,
  Portal,
  Text,
  HelperText,
  Divider,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";
import * as Location from "expo-location";

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getData();
      setEmail(session.user.email || "");
    }
  }, [session]);

  async function getData() {
    setLoading(true);
    await Promise.all([getAvatarUrl(), updateLocation()]);
    setLoading(false);
  }

  async function getAvatarUrl() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`avatar_url`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }

      setLocation(await Location.getCurrentPositionAsync({}));

      const updates = {
        lnglat: location
          ? location.coords.longitude + ", " + location.coords.latitude
          : null,
        updated_at: new Date(),
      };

      let { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  async function updateAvatarUrl({ url }: { url: string }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        avatar_url: url,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }

      setAvatarUrl(url);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateEmail({ email }: { email: string }) {
    if (!validateEmail(email)) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: email,
      });

      if (error) {
        throw error;
      } else {
        navigate(ROUTES.OTP, { state: { email } });
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const validateEmail = (email: string) => {
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!regex.test(email)) {
      setEmailError("Invalid email address");
      return false;
    } else if (email === session.user.email) {
      setEmailError("Email address must be different");
      return false;
    }
    setEmailError("");
    return true;
  };

  async function deleteUser() {
    try {
      setLoading(true);
      const { error } = await supabase.rpc("delete_current_user");
      if (error) {
        throw error;
      }

      supabase.auth.signOut();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Account" />
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={[styles.centerAligned]}>
            <Avatar
              size={200}
              url={avatarUrl}
              onUpload={(url: string) => {
                updateAvatarUrl({ url });
              }}
            />
          </View>
          <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
            <View style={{ flex: 1, flexDirection: "column" }}>
              <TextInput
                label="Update Email"
                onChangeText={(text) => {
                  setEmail(text);
                  validateEmail(text);
                }}
                value={email}
                placeholder="user@example.com"
                autoCapitalize={"none"}
                right={
                  <TextInput.Icon
                    icon="send"
                    onPress={() => updateEmail({ email })}
                  />
                }
                disabled={loading}
              />
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>
            </View>
          </View>
          <Button
            mode="outlined"
            style={styles.verticallySpaced}
            onPress={() => navigate(`${ROUTES.EDIT}`)}
            disabled={loading}
          >
            Edit Profile
          </Button>
          <Button
            mode="outlined"
            style={styles.verticallySpaced}
            onPress={() => navigate(`${ROUTES.PREFERENCES}`)}
            disabled={loading}
          >
            Dating Preferences
          </Button>
          <Divider style={styles.verticallySpaced} />
          <Button
            mode="contained"
            style={styles.verticallySpaced}
            onPress={() => supabase.auth.signOut()}
            disabled={loading}
          >
            Sign Out
          </Button>
          <Button
            mode="contained-tonal"
            style={styles.verticallySpaced}
            onPress={() => setDeleteDialogVisible(true)}
            disabled={loading}
          >
            Delete Account
          </Button>
        </ScrollView>
      )}
      <Navigation key={session.user.id} session={session} />
      <Portal>
        <Dialog visible={!loading && !location} dismissable={false}>
          <Dialog.Title>Alert</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Please click "Ok" below to enable location access in your device
              settings.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="text" onPress={updateLocation}>
              Ok
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Warning</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Deleting your account will permanently remove all of your matches
              and remaining credits! Click "Ok" below to confirm.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="text" onPress={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button mode="text" onPress={() => deleteUser()}>
              Ok
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import {
  ActivityIndicator,
  Button,
  TextInput,
  Dialog,
  Portal,
  Text,
  HelperText,
  Divider,
  Badge,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { Session } from "@supabase/supabase-js";
import { Avatar } from "./Avatar";
import { Navigation } from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";
import { Carousel } from "./Carousel";
import { Appbar } from "./Appbar";

const MAX_AVATARS = 6;

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [preferencesOnboarding, setPreferencesOnboarding] = useState(false);
  const [profileOnboarding, setProfileOnboarding] = useState(false);
  const [avatarUrls, setAvatarUrls] = useState<string[]>([]);
  const [newAvatarIndex, setNewAvatarIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();
  const theme = useTheme();

  useEffect(() => {
    if (session) {
      getData();
      setEmail(session.user.email || "");
    }
  }, [session]);

  async function getData() {
    setLoading(true);
    await Promise.all([getPreferences(), getProfile()]);
    setLoading(false);
  }

  async function getPreferences() {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("preferences")
        .select("updated_at")
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw Error(error.message);
      }

      if (data) {
        setPreferencesOnboarding(!data.updated_at);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to fetch preferences");
        setSnackbarVisible(true);
      }
    }
  }

  async function getProfile() {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select("updated_at,avatar_urls")
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw Error(error.message);
      }

      if (data) {
        if (data.avatar_urls && data.avatar_urls.length > 0) {
          try {
            await Image.prefetch(data.avatar_urls);
          } catch (error) {
            if (error instanceof Error) {
              console.error(error.message);
            }
          }
        }
        setProfileOnboarding(!data.updated_at);
        setAvatarUrls(data.avatar_urls);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to fetch profile");
        setSnackbarVisible(true);
      }
    }
  }

  const updateAvatarUrl = useCallback(
    (oldUrl: string) => async (newUrl: string) => {
      try {
        if (!session?.user) throw new Error("No user on the session!");

        const nextAvatarUrls = [...avatarUrls] || [];
        const index = nextAvatarUrls.indexOf(oldUrl);
        if (newUrl) {
          // Replace the old URL with the new one
          if (index > -1) {
            nextAvatarUrls[index] = newUrl;
          }
          // Or add the new URL to the end of the list
          else {
            nextAvatarUrls.push(newUrl);
          }
        }
        // If no new URL, just remove the old one
        else if (index > -1) {
          nextAvatarUrls.splice(index, 1);
        }

        const updates = {
          avatar_urls: nextAvatarUrls,
          updated_at: new Date(),
        };

        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", session.user.id);

        if (error) {
          throw Error(error.message);
        }

        setAvatarUrls(nextAvatarUrls);
        setNewAvatarIndex(index > -1 ? index : nextAvatarUrls.length - 1);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          setSnackbarMessage("Unable to update avatar URL");
          setSnackbarVisible(true);
        }
      }
    },
    [avatarUrls, session]
  );

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
        throw Error(error.message);
      } else {
        navigate(`../${ROUTES.OTP}`, { state: { email } });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to update email");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser() {
    try {
      setLoading(true);
      const { error } = await supabase.rpc("delete_current_user");
      if (error) {
        throw Error(error.message);
      }

      supabase.auth.signOut();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to delete user");
        setSnackbarVisible(true);
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

  return (
    <View style={{ flex: 1 }}>
      <Appbar
        title="Account"
        menuItems={[
          {
            title: "About",
            onPress: () => {
              navigate(`../${ROUTES.ABOUT}`);
            },
          },
        ]}
      />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.container}>
              <View style={styles.separator} />
              <Text variant="titleLarge" style={styles.verticallySpaced}>
                Edit pictures
              </Text>
              <View>
                <Badge
                  visible={!loading && avatarUrls.length === 0}
                  size={10}
                  style={{ position: "absolute", top: 10, right: 10 }}
                  theme={{ colors: { error: theme.colors.tertiaryContainer, onError: theme.colors.onTertiaryContainer } }}
                />
                <Carousel
                  data={
                    avatarUrls
                      ? avatarUrls.length < MAX_AVATARS
                        ? [...avatarUrls, ""]
                        : avatarUrls
                      : [""]
                  }
                  renderItem={(item) => (
                    <Avatar
                      size={200}
                      url={item}
                      onUpload={updateAvatarUrl(item)}
                    />
                  )}
                  size={200}
                  index={newAvatarIndex}
                  pageControl={false}
                />
              </View>
              <View style={styles.separator} />
              <Divider style={styles.verticallySpaced} />
              <Text variant="titleLarge" style={styles.verticallySpaced}>
                Profile settings
              </Text>
              <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
                <View style={{ flex: 1, flexDirection: "column" }}>
                  <TextInput
                    style={styles.textInput}
                    label="Update email"
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
                  {emailError ? (
                    <HelperText type="error" visible={!!emailError}>
                      {emailError}
                    </HelperText>
                  ) : null}
                </View>
              </View>
              <View>
                <Badge
                  visible={!loading && profileOnboarding}
                  size={10}
                  style={{ position: "absolute", top: 10, right: 10 }}
                  theme={{ colors: { error: theme.colors.tertiaryContainer, onError: theme.colors.onTertiaryContainer } }}
                />
                <Button
                  mode="outlined"
                  style={styles.verticallySpaced}
                  labelStyle={styles.buttonLabel}
                  onPress={() => navigate(`../${ROUTES.EDIT}`)}
                  disabled={loading}
                >
                  Edit Profile
                </Button>
              </View>
              <View>
                <Badge
                  visible={!loading && preferencesOnboarding}
                  size={10}
                  style={{ position: "absolute", top: 10, right: 10 }}
                  theme={{ colors: { error: theme.colors.tertiaryContainer, onError: theme.colors.onTertiaryContainer } }}
                />
                <Button
                  mode="outlined"
                  style={styles.verticallySpaced}
                  labelStyle={styles.buttonLabel}
                  onPress={() => navigate(`../${ROUTES.PREFERENCES}`)}
                  disabled={loading}
                >
                  Match Preferences
                </Button>
              </View>
              <Divider style={styles.verticallySpaced} />
              <Text variant="titleLarge" style={styles.verticallySpaced}>
                Account options
              </Text>
              <Button
                mode="outlined"
                style={styles.verticallySpaced}
                labelStyle={styles.buttonLabel}
                onPress={() => navigate(`../${ROUTES.BLOCKED}`)}
                disabled={loading}
              >
                Blocked Users
              </Button>
              <Button
                mode="contained"
                style={styles.verticallySpaced}
                labelStyle={styles.buttonLabel}
                onPress={() => supabase.auth.signOut()}
                disabled={loading}
              >
                Sign Out
              </Button>
              <Button
                mode="contained-tonal"
                theme={{ colors: { secondaryContainer: theme.colors.tertiaryContainer, onSecondaryContainer: theme.colors.onTertiaryContainer } }}
                style={styles.verticallySpaced}
                labelStyle={styles.buttonLabel}
                onPress={() => setDeleteDialogVisible(true)}
                disabled={loading}
              >
                Delete Account
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      <Navigation key={session.user.id} session={session} />
      <Portal>
        {deleteDialogVisible && (
          <View style={styles.portalContainer}>
            <Dialog
              style={styles.dialog}
              visible={deleteDialogVisible}
              onDismiss={() => setDeleteDialogVisible(false)}
            >
              <Dialog.Title style={styles.dialogText}>Warning</Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyLarge" style={styles.dialogText}>
                  Deleting your account will permanently remove all of your
                  matches and remaining credits! Click "Ok" below to confirm.
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  textColor={theme.colors.onSecondaryContainer}
                  mode="text"
                  labelStyle={styles.buttonLabel}
                  onPress={() => setDeleteDialogVisible(false)}
                >
                  Cancel
                </Button>
                <Button
                  textColor={theme.colors.onSecondaryContainer}
                  mode="text"
                  labelStyle={styles.buttonLabel}
                  onPress={handleDeleteUser}
                >
                  Ok
                </Button>
              </Dialog.Actions>
            </Dialog>
          </View>
        )}
      </Portal>
      <Portal>
        <Snackbar
          style={[styles.snackbar, styles.aboveNav]}
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: "Dismiss",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </View>
  );
}

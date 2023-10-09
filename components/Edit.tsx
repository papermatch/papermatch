import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, TouchableOpacity } from "react-native";
import {
  Button,
  TextInput,
  Appbar,
  Snackbar,
  Menu,
  IconButton,
  ActivityIndicator,
  HelperText,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";
import { GenderType, KidsType } from "../lib/types";

export default function Edit({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [gender, setGender] = useState<GenderType | null>(null);
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [kids, setKids] = useState<KidsType | null>(null);
  const [kidsMenuVisible, setKidsMenuVisible] = useState(false);
  const [about, setAbout] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setGender(data.gender);
        setKids(data.kids);
        setAbout(data.about);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    gender,
    kids,
    about,
  }: {
    username: string;
    gender: GenderType | null;
    kids: KidsType | null;
    about: string;
  }) {
    if (!validateUsername(username)) {
      return;
    }

    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        username: username,
        gender: gender,
        kids: kids,
        about: about,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }

      setSnackbarMessage("Profile updated!");
      setSnackbarVisible(true);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const validateUsername = (username: string) => {
    if (username.trim() === "") {
      setUsernameError("Username cannot be empty");
      return false;
    }
    setUsernameError("");
    return true;
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.BackAction
          onPress={() => {
            navigate(-1);
          }}
        />
        <Appbar.Content title="Edit" />
        <Menu
          visible={appbarMenuVisible}
          onDismiss={() => setAppbarMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setAppbarMenuVisible(!appbarMenuVisible)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              navigate(`${ROUTES.PROFILE}/${session.user.id}`);
            }}
            title="View"
          />
        </Menu>
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <View style={styles.container}>
          <TextInput
            style={styles.verticallySpaced}
            label="Username (your first name is fine)"
            value={username || ""}
            onChangeText={(text) => {
              setUsername(text);
              validateUsername(text);
            }}
            maxLength={50}
            error={!!usernameError}
          />
          <HelperText type="error" visible={!!usernameError}>
            {usernameError}
          </HelperText>
          <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
            <View style={{ flex: 1 }}>
              <Menu
                visible={genderMenuVisible}
                onDismiss={() => setGenderMenuVisible(false)}
                anchor={
                  <TextInput
                    label="Gender"
                    value={gender ? gender : ""}
                    left={
                      <TextInput.Icon
                        onPress={() => {
                          setGenderMenuVisible(!genderMenuVisible);
                        }}
                        icon={genderMenuVisible ? "menu-up" : "menu-down"}
                      />
                    }
                    right={
                      gender && (
                        <TextInput.Icon
                          icon="close-circle"
                          onPress={() => setGender(null)}
                        />
                      )
                    }
                    disabled={true}
                  />
                }
                anchorPosition="bottom"
              >
                <Menu.Item
                  leadingIcon="gender-male"
                  onPress={() => {
                    setGender("male");
                    setGenderMenuVisible(false);
                  }}
                  title="Male"
                />
                <Menu.Item
                  leadingIcon="gender-female"
                  onPress={() => {
                    setGender("female");
                    setGenderMenuVisible(false);
                  }}
                  title="Female"
                />
                <Menu.Item
                  leadingIcon="gender-non-binary"
                  onPress={() => {
                    setGender("nonbinary");
                    setGenderMenuVisible(false);
                  }}
                  title="Nonbinary"
                />
              </Menu>
            </View>
          </View>
          <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
            <View style={{ flex: 1 }}>
              <Menu
                visible={kidsMenuVisible}
                onDismiss={() => setKidsMenuVisible(false)}
                anchor={
                  <TextInput
                    label="Kids"
                    value={kids ? kids : ""}
                    left={
                      <TextInput.Icon
                        onPress={() => {
                          setKidsMenuVisible(!kidsMenuVisible);
                        }}
                        icon={kidsMenuVisible ? "menu-up" : "menu-down"}
                      />
                    }
                    right={
                      kids && (
                        <TextInput.Icon
                          icon="close-circle"
                          onPress={() => setKids(null)}
                        />
                      )
                    }
                    disabled={true}
                  />
                }
                anchorPosition="bottom"
              >
                <Menu.Item
                  leadingIcon="egg-off"
                  onPress={() => {
                    setKids("none");
                    setKidsMenuVisible(false);
                  }}
                  title="Don't want kids"
                />
                <Menu.Item
                  leadingIcon="head-question"
                  onPress={() => {
                    setKids("unsure");
                    setKidsMenuVisible(false);
                  }}
                  title="Not sure about kids"
                />
                <Menu.Item
                  leadingIcon="baby"
                  onPress={() => {
                    setKids("want");
                    setKidsMenuVisible(false);
                  }}
                  title="Want kids"
                />
                <Menu.Item
                  leadingIcon="baby-carriage-off"
                  onPress={() => {
                    setKids("have");
                    setKidsMenuVisible(false);
                  }}
                  title="Have kids and don't want more"
                />
                <Menu.Item
                  leadingIcon="baby-carriage"
                  onPress={() => {
                    setKids("more");
                    setKidsMenuVisible(false);
                  }}
                  title="Have kids and want more"
                />
              </Menu>
            </View>
          </View>
          <TextInput
            style={[styles.verticallySpaced]}
            label="About"
            value={about ? about : ""}
            onChangeText={(text) => setAbout(text)}
            multiline={true}
            numberOfLines={8}
            maxLength={1500}
          />
          <Button
            mode="contained"
            style={styles.verticallySpaced}
            onPress={() => updateProfile({ username, gender, kids, about })}
            disabled={loading}
          >
            {loading ? "Loading ..." : "Update"}
          </Button>
        </View>
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{ label: "Dismiss", onPress: () => setSnackbarVisible(false) }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

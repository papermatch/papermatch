import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert } from "react-native";
import {
  Button,
  TextInput,
  Appbar,
  Snackbar,
  Menu,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";
import { GenderType, KidsType } from "../lib/types";

export default function Edit({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<GenderType | null>(null);
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [kids, setKids] = useState<KidsType | null>(null);
  const [kidsMenuVisible, setKidsMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [about, setAbout] = useState("");
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
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username: username,
        gender: gender,
        kids: kids,
        about: about,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);

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

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.BackAction
          onPress={() => {
            navigate(-1);
          }}
        />
        <Appbar.Content title="Edit" />
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
            label="Username"
            value={username || ""}
            onChangeText={(text) => setUsername(text)}
            maxLength={50}
            left={<TextInput.Icon icon="account" />}
          />
          <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
            <TextInput
              style={{ flex: 1 }}
              label="Gender"
              value={gender ? gender : ""}
              left={<TextInput.Icon icon="gender-transgender" />}
              disabled
            />
            <Menu
              visible={genderMenuVisible}
              onDismiss={() => setGenderMenuVisible(false)}
              anchor={
                <IconButton
                  onPress={() => setGenderMenuVisible(true)}
                  icon="menu-down"
                />
              }
            >
              <Menu.Item onPress={() => setGender(null)} title="Reset" />
              <Menu.Item onPress={() => setGender("male")} title="Male" />
              <Menu.Item onPress={() => setGender("female")} title="Female" />
              <Menu.Item
                onPress={() => setGender("nonbinary")}
                title="Nonbinary"
              />
            </Menu>
          </View>
          <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
            <TextInput
              style={{ flex: 1 }}
              label="Kids"
              value={kids ? kids : ""}
              left={<TextInput.Icon icon="baby-carriage" />}
              disabled
            />
            <Menu
              visible={kidsMenuVisible}
              onDismiss={() => setKidsMenuVisible(false)}
              anchor={
                <IconButton
                  onPress={() => setKidsMenuVisible(true)}
                  icon="menu-down"
                />
              }
            >
              <Menu.Item onPress={() => setKids(null)} title="Reset" />
              <Menu.Item
                onPress={() => setKids("none")}
                title="Don't want kids"
              />
              <Menu.Item
                onPress={() => setKids("unsure")}
                title="Not sure about kids"
              />
              <Menu.Item onPress={() => setKids("want")} title="Want kids" />
              <Menu.Item
                onPress={() => setKids("have")}
                title="Have kids and don't want more"
              />
              <Menu.Item
                onPress={() => setKids("more")}
                title="Have kids and want more"
              />
            </Menu>
          </View>
          <TextInput
            style={[styles.verticallySpaced]}
            label="About"
            value={about ? about : ""}
            onChangeText={(text) => setAbout(text)}
            multiline={true}
            numberOfLines={8}
            maxLength={1500}
            left={<TextInput.Icon icon="text-account" />}
          />
          <Button
            style={styles.verticallySpaced}
            onPress={() => updateProfile({ username, gender, kids, about })}
            disabled={loading}
          >
            {loading ? "Loading ..." : "Update"}
          </Button>
          <Button
            style={styles.verticallySpaced}
            onPress={() => navigate(`${ROUTES.PROFILE}/${session.user.id}`)}
            disabled={loading}
          >
            View Profile
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

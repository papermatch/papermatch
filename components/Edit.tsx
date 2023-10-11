import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, ScrollView } from "react-native";
import {
  Button,
  TextInput,
  Appbar,
  Snackbar,
  Menu,
  ActivityIndicator,
  HelperText,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { Dropdown } from "./Dropdown";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";
import {
  DietType,
  DietData,
  GenderType,
  GenderData,
  IntentionType,
  IntentionData,
  KidsType,
  KidsData,
  RelationshipType,
  RelationshipData,
} from "../lib/types";

export default function Edit({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [gender, setGender] = useState<GenderType | null>(null);
  const [intention, setIntention] = useState<IntentionType | null>(null);
  const [relationship, setRelationship] = useState<RelationshipType | null>(
    null
  );
  const [kids, setKids] = useState<KidsType | null>(null);
  const [diet, setDiet] = useState<DietType | null>(null);
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
        setIntention(data.intention);
        setRelationship(data.relationship);
        setKids(data.kids);
        setDiet(data.diet);
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
    intention,
    relationship,
    kids,
    diet,
    about,
  }: {
    username: string;
    gender: GenderType | null;
    intention: IntentionType | null;
    relationship: RelationshipType | null;
    kids: KidsType | null;
    diet: DietType | null;
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
        intention: intention,
        relationship: relationship,
        kids: kids,
        diet: diet,
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
        <ScrollView style={styles.container}>
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
          <Dropdown
            style={[styles.verticallySpaced, { flex: 1 }]}
            label="Gender"
            data={GenderData}
            value={gender}
            onChange={setGender}
          />
          <Dropdown
            style={[styles.verticallySpaced, { flex: 1 }]}
            label="Family plan"
            data={KidsData}
            value={kids}
            onChange={setKids}
          />
          <Dropdown
            style={[styles.verticallySpaced, { flex: 1 }]}
            label="Dating intention"
            data={IntentionData}
            value={intention}
            onChange={setIntention}
          />
          <Dropdown
            style={[styles.verticallySpaced, { flex: 1 }]}
            label="Relationship style"
            data={RelationshipData}
            value={relationship}
            onChange={setRelationship}
          />
          <Dropdown
            style={[styles.verticallySpaced, { flex: 1 }]}
            label="Diet"
            data={DietData}
            value={diet}
            onChange={setDiet}
          />
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
            onPress={() =>
              updateProfile({
                username,
                gender,
                intention,
                relationship,
                kids,
                diet,
                about,
              })
            }
            disabled={loading}
          >
            {loading ? "Loading ..." : "Update"}
          </Button>
        </ScrollView>
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

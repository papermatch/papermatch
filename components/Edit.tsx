import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, ScrollView } from "react-native";
import {
  Button,
  TextInput,
  Appbar,
  Portal,
  Snackbar,
  Menu,
  ActivityIndicator,
  HelperText,
  Text,
  Divider
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { Dropdown } from "./Dropdown";
import { ROUTES, useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";
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
import * as Location from "expo-location";

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
  const [lnglat, setLnglat] = useState("");
  const [lnglatError, setLnglatError] = useState("");
  const [about, setAbout] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
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
        setLnglat(data.lnglat || "");
        setAbout(data.about || "");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        setSnackbarMessage("Unable to fetch profile");
        setSnackbarVisible(true);
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

      const location = await Location.getCurrentPositionAsync({});

      if (location) {
        setLnglat(`(${location.coords.longitude},${location.coords.latitude})`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        setSnackbarMessage("Unable to update location");
        setSnackbarVisible(true);
      }
    }
  }

  async function updateProfile({
    username,
    gender,
    intention,
    relationship,
    kids,
    diet,
    lnglat,
    about,
  }: {
    username: string;
    gender: GenderType | null;
    intention: IntentionType | null;
    relationship: RelationshipType | null;
    kids: KidsType | null;
    diet: DietType | null;
    lnglat: string;
    about: string;
  }) {
    if ([validateUsername(username), validateLnglat(lnglat)].includes(false)) {
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
        lnglat: lnglat || null,
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
        console.log(error.message);
        setSnackbarMessage("Unable to update profile");
        setSnackbarVisible(true);
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

  const validateLnglat = (lnglat: string) => {
    const regex =
      /^\(?-?[0-9]{1,3}(?:\.[0-9]{1,})?,\s?-?[0-9]{1,3}(?:\.[0-9]{1,})?\)?$/;
    if (lnglat == "") {
      setLnglatError("");
      return true;
    } else if (!regex.test(lnglat)) {
      setLnglatError("Invalid longitude and latitude");
      return false;
    }
    setLnglatError("");
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
        <Appbar.Content titleStyle={styles.appbarTitle} title="Edit" />
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
          <Text style={styles.verticallySpaced}>
            Edit your profile below. The more information you provide, the
            better your matches will be!
          </Text>
          <Divider style={styles.verticallySpaced} />
          <TextInput
            style={styles.verticallySpaced}
            label="Username (your first name is fine)"
            value={username}
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
            style={styles.verticallySpaced}
            label="Location (lng,lat)"
            value={lnglat}
            onChangeText={(text) => {
              setLnglat(text);
              validateLnglat(text);
            }}
            right={
              <TextInput.Icon
                icon="crosshairs-gps"
                onPress={() => updateLocation()}
              />
            }
            error={!!lnglatError}
          />
          <HelperText type="error" visible={!!lnglatError}>
            {lnglatError}
          </HelperText>
          <TextInput
            style={[styles.verticallySpaced]}
            label="About"
            value={about}
            onChangeText={(text) => setAbout(text)}
            multiline={true}
            numberOfLines={8}
            maxLength={1500}
          />
          <Button
            mode="contained"
            style={styles.verticallySpaced}
            labelStyle={styles.buttonLabel}
            onPress={() =>
              updateProfile({
                username,
                gender,
                intention,
                relationship,
                kids,
                diet,
                lnglat,
                about,
              })
            }
            disabled={loading}
          >
            {loading ? "Loading ..." : "Update"}
          </Button>
        </ScrollView>
      )}
      <Portal>
        <Snackbar
          style={styles.snackbar}
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

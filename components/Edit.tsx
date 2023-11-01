import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
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
  Divider,
  FAB,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { Dropdown } from "./Dropdown";
import { ROUTES, useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";
import {
  DietType,
  DietData,
  EducationType,
  EducationData,
  GenderType,
  GenderData,
  IntentionType,
  IntentionData,
  KidsType,
  KidsData,
  RelationshipType,
  RelationshipData,
  ReligionType,
  ReligionData,
  SexualityType,
  SexualityData,
} from "../lib/types";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function Edit({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [gender, setGender] = useState<GenderType | null>(null);
  const [education, setEducation] = useState<EducationType | null>(null);
  const [religion, setReligion] = useState<ReligionType | null>(null);
  const [sexuality, setSexuality] = useState<SexualityType | null>(null);
  const [intention, setIntention] = useState<IntentionType | null>(null);
  const [relationship, setRelationship] = useState<RelationshipType | null>(
    null
  );
  const [kids, setKids] = useState<KidsType | null>(null);
  const [diet, setDiet] = useState<DietType | null>(null);
  const [lnglat, setLnglat] = useState("");
  const [lnglatError, setLnglatError] = useState("");
  const [mapVisible, setMapVisible] = useState(false);
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
        setEducation(data.education);
        setReligion(data.religion);
        setSexuality(data.sexuality);
        setIntention(data.intention);
        setRelationship(data.relationship);
        setKids(data.kids);
        setDiet(data.diet);
        setLnglat(data.lnglat || "");
        setAbout(data.about || "");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
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
        setLnglat(toLngLat(location.coords));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to update location");
        setSnackbarVisible(true);
      }
    } finally {
      setMapVisible(true);
    }
  }

  async function updateProfile({
    username,
    gender,
    education,
    religion,
    sexuality,
    intention,
    relationship,
    kids,
    diet,
    lnglat,
    about,
  }: {
    username: string;
    gender: GenderType | null;
    education: EducationType | null;
    religion: ReligionType | null;
    sexuality: SexualityType | null;
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
        education: education,
        religion: religion,
        sexuality: sexuality,
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
        console.error(error.message);
        setSnackbarMessage("Unable to update profile");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const toLngLat = ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => {
    return `(${longitude},${latitude})`;
  };

  const toLatLng = ({ lnglat }: { lnglat: string }) => {
    if (!lnglat) {
      return { latitude: 0, longitude: 0 };
    }
    const [longitude, latitude] = lnglat.replace(/[()]/g, "").split(",");
    return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
  };

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
              navigate(`../${ROUTES.PROFILE}/${session.user.id}`);
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.container}>
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
              {usernameError ? (
                <HelperText type="error" visible={!!usernameError}>
                  {usernameError}
                </HelperText>
              ) : null}
              <Dropdown
                style={[styles.verticallySpaced, { flex: 1 }]}
                label="Gender"
                data={GenderData}
                value={gender}
                onChange={setGender}
              />
              <Dropdown
                style={[styles.verticallySpaced, { flex: 1 }]}
                label="Education level"
                data={EducationData}
                value={education}
                onChange={setEducation}
              />
              <Dropdown
                style={[styles.verticallySpaced, { flex: 1 }]}
                label="Religion"
                data={ReligionData}
                value={religion}
                onChange={setReligion}
              />
              <Dropdown
                style={[styles.verticallySpaced, { flex: 1 }]}
                label="Sexuality"
                data={SexualityData}
                value={sexuality}
                onChange={setSexuality}
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
                    onPress={updateLocation}
                  />
                }
                error={!!lnglatError}
                editable={Platform.OS === "web"}
              />
              {lnglatError ? (
                <HelperText type="error" visible={!!lnglatError}>
                  {lnglatError}
                </HelperText>
              ) : null}
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
                    education,
                    religion,
                    sexuality,
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
      {Platform.OS !== "web" && mapVisible ? (
        <Portal>
          <StatusBar hidden={true} />
          <View style={{ flex: 1 }}>
            <MapView
              style={{ width: "100%", height: "100%" }}
              initialRegion={{
                ...toLatLng({ lnglat }),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onRegionChangeComplete={(event) => {
                setLnglat(toLngLat(event));
              }}
              provider={PROVIDER_GOOGLE}
            >
              <Marker coordinate={toLatLng({ lnglat })} />
            </MapView>
          </View>
          <FAB
            icon="keyboard-backspace"
            style={{ position: "absolute", margin: 16, left: 0, top: 0 }}
            size="medium"
            onPress={() => setMapVisible(false)}
            disabled={loading}
          />
        </Portal>
      ) : null}
    </View>
  );
}

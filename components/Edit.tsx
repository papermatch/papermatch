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
  Checkbox,
  Text,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";
import { GenderType } from "../lib/types";
import * as Location from "expo-location";
import Icon from "react-native-paper/lib/typescript/components/Icon";

export default function Edit({ session }: { session: Session }) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<GenderType>("none");
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [haveKids, setHaveKids] = useState(false);
  const [wantKids, setWantKids] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  function parseLocation(str: string): Location.LocationObject | null {
    const regex = /\((-?\d+\.\d+),(-?\d+\.\d+)\)/;
    const match = str.match(regex);

    if (match) {
      return {
        coords: {
          longitude: parseFloat(match[1]),
          latitude: parseFloat(match[2]),
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
        mocked: true,
      };
    } else {
      return null;
    }
  }

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
        setHaveKids(data.have_kids);
        setWantKids(data.want_kids);
        setLocation(parseLocation(data.location));
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function getLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setSnackbarMessage("Permission to access location was denied");
      setSnackbarVisible(true);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  }

  async function updateProfile({
    username,
    gender,
    haveKids,
    wantKids,
    location,
  }: {
    username: string;
    gender: GenderType;
    haveKids: boolean;
    wantKids: boolean;
    location: Location.LocationObject | null;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username: username,
        gender: gender,
        have_kids: haveKids,
        want_kids: wantKids,
        location: location
          ? location.coords.longitude + ", " + location.coords.latitude
          : null,
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
      <View style={styles.container}>
        <TextInput
          style={styles.verticallySpaced}
          label="Username"
          value={username || ""}
          onChangeText={(text) => setUsername(text)}
        />
        <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
          <TextInput
            style={{ flex: 1 }}
            label="Gender"
            value={gender}
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
            <Menu.Item onPress={() => setGender("none")} title="None" />
            <Menu.Item onPress={() => setGender("male")} title="Male" />
            <Menu.Item onPress={() => setGender("female")} title="Female" />
            <Menu.Item
              onPress={() => setGender("nonbinary")}
              title="Nonbinary"
            />
          </Menu>
        </View>
        <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
          <Checkbox
            status={haveKids ? "checked" : "unchecked"}
            onPress={() => setHaveKids(!haveKids)}
          />
          <Text style={{ flex: 1, alignSelf: "center" }}>Have Kids?</Text>
          <Checkbox
            status={wantKids ? "checked" : "unchecked"}
            onPress={() => setWantKids(!wantKids)}
          />
          <Text style={{ flex: 1, alignSelf: "center" }}>Want Kids?</Text>
        </View>
        <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
          <TextInput
            style={{ flex: 1 }}
            label="Location"
            value={
              location?.coords?.latitude + ", " + location?.coords?.longitude
            }
            disabled
          />
          <IconButton
            style={[styles.verticallySpaced, { alignSelf: "center" }]}
            onPress={() => {
              getLocation();
            }}
            icon="crosshairs-gps"
          />
        </View>
        <Button
          style={styles.verticallySpaced}
          onPress={() =>
            updateProfile({ username, gender, haveKids, wantKids, location })
          }
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

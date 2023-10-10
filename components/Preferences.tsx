import { useState, useEffect, SetStateAction } from "react";
import { supabase } from "../lib/supabase";
import { Dispatch } from "react";
import { View, Alert, ScrollView } from "react-native";
import {
  Button,
  TextInput,
  Appbar,
  Snackbar,
  ActivityIndicator,
  HelperText,
  Divider,
  Text,
  Checkbox,
  Chip,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "../lib/routing";
import styles from "../lib/styles";
import { GenderType, GenderData, KidsType, KidsData } from "../lib/types";
import { Checkboxes } from "./Checkboxes";

export default function Preferences({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [minAge, setMinAge] = useState("");
  const [minAgeError, setMinAgeError] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [maxAgeError, setMaxAgeError] = useState("");
  const [gender, setGender] = useState<GenderType[]>([]);
  const [kids, setKids] = useState<KidsType[]>([]);
  const [radius, setRadius] = useState("");
  const [radiusError, setRadiusError] = useState("");
  const [keyword, setKeyword] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getPreferences();
    }
  }, [session]);

  async function getPreferences() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
        .from("preferences")
        .select("*")
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setMinAge(data.min_age?.toString() ?? "");
        setMaxAge(data.max_age?.toString() ?? "");
        setGender(data.gender ?? []);
        setKids(data.kids ?? []);
        setRadius(data.radius?.toString() ?? "");
        setKeywords(data.keywords ?? []);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updatePreferences({
    minAge,
    maxAge,
    gender,
    kids,
    radius,
    keywords,
  }: {
    minAge: string;
    maxAge: string;
    gender: GenderType[];
    kids: KidsType[];
    radius: string;
    keywords: string[];
  }) {
    if (
      [
        validateAge(minAge, setMinAgeError),
        validateAge(maxAge, setMaxAgeError),
        validateRadius(radius),
      ].includes(false)
    ) {
      return false;
    }

    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        min_age: parseInt(minAge),
        max_age: parseInt(maxAge),
        gender: gender.length ? gender : null,
        kids: kids.length ? kids : null,
        radius: parseFloat(radius),
        keywords: keywords.length ? keywords : null,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("preferences")
        .update(updates)
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }

      setSnackbarMessage("Preferences updated!");
      setSnackbarVisible(true);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const updateKeywords = (keyword: string) => {
    const newKeywords = keyword
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .filter((k) => k !== "");
    setKeywords([...new Set([...keywords, ...newKeywords])]);
    setKeyword("");
  };

  const validateAge = (
    age: string,
    setAgeError: Dispatch<SetStateAction<string>>
  ) => {
    const regex = /^[0-9]{2,}$/;
    if (age === "") {
      setAgeError("");
      return true;
    } else if (!regex.test(age)) {
      setAgeError("Age must be 2 digits or more");
      return false;
    } else {
      setAgeError("");
      return true;
    }
  };

  const validateRadius = (radius: string) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (radius === "") {
      setRadiusError("");
      return true;
    } else if (!regex.test(radius)) {
      setRadiusError("Distance must be a number");
      return false;
    } else {
      setRadiusError("");
      return true;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.BackAction
          onPress={() => {
            navigate(-1);
          }}
        />
        <Appbar.Content title="Preferences" />
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
            label="Minimum Age"
            value={minAge}
            onChangeText={(text) => {
              setMinAge(text);
              validateAge(text, setMinAgeError);
            }}
            keyboardType="numeric"
            error={!!minAgeError}
          />
          <HelperText type="error" visible={!!minAgeError}>
            {minAgeError}
          </HelperText>
          <TextInput
            style={styles.verticallySpaced}
            label="Maximum Age"
            value={maxAge}
            onChangeText={(text) => {
              setMaxAge(text);
              validateAge(text, setMaxAgeError);
            }}
            keyboardType="numeric"
            error={!!maxAgeError}
          />
          <HelperText type="error" visible={!!maxAgeError}>
            {maxAgeError}
          </HelperText>
          <Divider style={styles.verticallySpaced} />
          <Checkboxes
            label="Gender"
            data={GenderData}
            value={gender}
            onChange={setGender}
          />
          <Divider style={styles.verticallySpaced} />
          <Checkboxes
            label="Kids"
            data={KidsData}
            value={kids}
            onChange={setKids}
          />
          <Divider style={styles.verticallySpaced} />
          <TextInput
            style={styles.verticallySpaced}
            label="Maximum Distance"
            value={radius}
            onChangeText={(text) => {
              setRadius(text);
              validateRadius(text);
            }}
            keyboardType="numeric"
            error={!!radiusError}
          />
          <HelperText type="error" visible={!!radiusError}>
            {radiusError}
          </HelperText>
          <TextInput
            style={styles.verticallySpaced}
            label="Keywords"
            value={keyword}
            onChangeText={(text) => setKeyword(text)}
            onSubmitEditing={() => updateKeywords(keyword)}
            right={
              <TextInput.Icon
                icon="plus-circle"
                onPress={() => updateKeywords(keyword)}
              />
            }
          />
          <View
            style={[
              styles.verticallySpaced,
              { flexDirection: "row", flexWrap: "wrap" },
            ]}
          >
            {keywords.map((keyword) => (
              <Chip
                style={{ margin: 8 }}
                key={keyword}
                onClose={() =>
                  setKeywords(keywords.filter((k) => k !== keyword))
                }
              >
                {keyword}
              </Chip>
            ))}
          </View>
          <Button
            mode="contained"
            style={styles.verticallySpaced}
            onPress={() =>
              updatePreferences({
                minAge,
                maxAge,
                gender,
                kids,
                radius,
                keywords,
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

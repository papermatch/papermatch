import { useState, useEffect, SetStateAction } from "react";
import { supabase } from "../lib/supabase";
import { Dispatch } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import {
  Button,
  TextInput,
  Appbar,
  Portal,
  Snackbar,
  ActivityIndicator,
  HelperText,
  Divider,
  Chip,
  Text,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";
import {
  DietType,
  DietData,
  EducationType,
  EducationData,
  FamilyType,
  FamilyData,
  GenderType,
  GenderData,
  IntentionType,
  IntentionData,
  RelationshipType,
  RelationshipData,
  ReligionType,
  ReligionData,
  SexualityType,
  SexualityData,
} from "../lib/types";
import { Checkboxes } from "./Checkboxes";

export default function Preferences({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [minAge, setMinAge] = useState("");
  const [minAgeError, setMinAgeError] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [maxAgeError, setMaxAgeError] = useState("");
  const [gender, setGender] = useState<GenderType[]>([]);
  const [education, setEducation] = useState<EducationType[]>([]);
  const [religion, setReligion] = useState<ReligionType[]>([]);
  const [sexuality, setSexuality] = useState<SexualityType[]>([]);
  const [intention, setIntention] = useState<IntentionType[]>([]);
  const [relationship, setRelationship] = useState<RelationshipType[]>([]);
  const [family, setFamily] = useState<FamilyType[]>([]);
  const [diet, setDiet] = useState<DietType[]>([]);
  const [radius, setRadius] = useState("");
  const [radiusError, setRadiusError] = useState("");
  const [keyword, setKeyword] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();

  useEffect(() => {
    if (session) {
      getPreferences();
    }
  }, [session]);

  async function getPreferences() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
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
        setEducation(data.education ?? []);
        setReligion(data.religion ?? []);
        setSexuality(data.sexuality ?? []);
        setIntention(data.intention ?? []);
        setRelationship(data.relationship ?? []);
        setFamily(data.family ?? []);
        setDiet(data.diet ?? []);
        setRadius(data.radius?.toString() ?? "");
        setKeywords(data.keywords ?? []);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to get preferences");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updatePreferences({
    minAge,
    maxAge,
    gender,
    education,
    religion,
    sexuality,
    intention,
    relationship,
    family,
    diet,
    radius,
    keywords,
  }: {
    minAge: string;
    maxAge: string;
    gender: GenderType[];
    education: EducationType[];
    religion: ReligionType[];
    sexuality: SexualityType[];
    intention: IntentionType[];
    relationship: RelationshipType[];
    family: FamilyType[];
    diet: DietType[];
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
        education: education.length ? education : null,
        religion: religion.length ? religion : null,
        sexuality: sexuality.length ? sexuality : null,
        intention: intention.length ? intention : null,
        relationship: relationship.length ? relationship : null,
        family: family.length ? family : null,
        diet: diet.length ? diet : null,
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
        console.error(error);
        setSnackbarMessage("Unable to update preferences");
        setSnackbarVisible(true);
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
    }
    setAgeError("");
    return true;
  };

  const validateRadius = (radius: string) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (radius === "") {
      setRadiusError("");
      return true;
    } else if (!regex.test(radius)) {
      setRadiusError("Distance must be a number");
      return false;
    }
    setRadiusError("");
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
        <Appbar.Content titleStyle={styles.appbarTitle} title="Preferences" />
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
              <View style={styles.separator} />
              <Text style={styles.verticallySpaced}>
                Update your preferences below. The more information you provide,
                the better your matches will be!
              </Text>
              <Divider style={styles.verticallySpaced} />
              <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <TextInput
                    label="Minimum age"
                    value={minAge}
                    onChangeText={(text) => {
                      setMinAge(text);
                      validateAge(text, setMinAgeError);
                    }}
                    keyboardType="numeric"
                    error={!!minAgeError}
                  />
                  {minAgeError ? (
                    <HelperText type="error" visible={!!minAgeError}>
                      {minAgeError}
                    </HelperText>
                  ) : null}
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <TextInput
                    label="Maximum age"
                    value={maxAge}
                    onChangeText={(text) => {
                      setMaxAge(text);
                      validateAge(text, setMaxAgeError);
                    }}
                    keyboardType="numeric"
                    error={!!maxAgeError}
                  />
                  {maxAgeError ? (
                    <HelperText type="error" visible={!!maxAgeError}>
                      {maxAgeError}
                    </HelperText>
                  ) : null}
                </View>
              </View>
              <Divider style={styles.verticallySpaced} />
              <Checkboxes
                label="Gender"
                data={GenderData}
                value={gender}
                onChange={setGender}
              />
              <Divider style={styles.verticallySpaced} />
              <Checkboxes
                label="Education level"
                data={EducationData}
                value={education}
                onChange={setEducation}
              />
              <Divider style={styles.verticallySpaced} />
              <Checkboxes
                label="Religion"
                data={ReligionData}
                value={religion}
                onChange={setReligion}
              />
              <Divider style={styles.verticallySpaced} />
              <Checkboxes
                label="Sexuality"
                data={SexualityData}
                value={sexuality}
                onChange={setSexuality}
              />
              <Divider style={styles.verticallySpaced} />
              <Checkboxes
                label="Family plan"
                data={FamilyData}
                value={family}
                onChange={setFamily}
              />
              <Divider style={styles.verticallySpaced} />
              <Checkboxes
                label="Dating intention"
                data={IntentionData}
                value={intention}
                onChange={setIntention}
              />
              <Divider style={styles.verticallySpaced} />
              <Checkboxes
                label="Relationship style"
                data={RelationshipData}
                value={relationship}
                onChange={setRelationship}
              />
              <Divider style={styles.verticallySpaced} />
              <Checkboxes
                label="Diet"
                data={DietData}
                value={diet}
                onChange={setDiet}
              />
              <Divider style={styles.verticallySpaced} />
              <TextInput
                style={styles.verticallySpaced}
                label="Maximum distance (miles)"
                value={radius}
                onChangeText={(text) => {
                  setRadius(text);
                  validateRadius(text);
                }}
                keyboardType="numeric"
                error={!!radiusError}
              />
              {radiusError ? (
                <HelperText type="error" visible={!!radiusError}>
                  {radiusError}
                </HelperText>
              ) : null}
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
              {keywords.length > 0 && (
                <View
                  style={[
                    styles.verticallySpaced,
                    { flexDirection: "row", flexWrap: "wrap" },
                  ]}
                >
                  {keywords.map((keyword) => (
                    <Chip
                      style={{ margin: 4 }}
                      key={keyword}
                      onClose={() =>
                        setKeywords(keywords.filter((k) => k !== keyword))
                      }
                    >
                      {keyword}
                    </Chip>
                  ))}
                </View>
              )}
              <Button
                mode="contained"
                style={styles.verticallySpaced}
                labelStyle={styles.buttonLabel}
                onPress={() =>
                  updatePreferences({
                    minAge,
                    maxAge,
                    gender,
                    education,
                    religion,
                    sexuality,
                    intention,
                    relationship,
                    family,
                    diet,
                    radius,
                    keywords,
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
    </View>
  );
}

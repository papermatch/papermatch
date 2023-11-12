import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import {
  ActivityIndicator,
  Text,
  TextInput,
  Button,
  HelperText,
  Portal,
  Snackbar,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { useParams, useNavigate } from "../lib/routing";
import { Dropdown } from "./Dropdown";
import { ProfileData, ReasonType, ReasonData } from "../lib/types";
import { useStyles } from "../lib/styles";
import { Appbar } from "./Appbar";

export default function Report({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reason, setReason] = useState<ReasonType | null>(null);
  const [reasonError, setReasonError] = useState("");
  const [details, setDetails] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id && session) {
      getProfile();
    }
  }, [id, session]);

  async function getProfile() {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to get profile");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendReport({
    reason,
    details,
  }: {
    reason: ReasonType | null;
    details: string;
  }) {
    if (!validateReason(reason)) {
      return;
    }

    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { error } = await supabase
        .from("reports")
        .insert([
          {
            user_id: id,
            reporter_id: session.user.id,
            reason,
            details,
          },
        ])
        .single();

      if (error) {
        throw error;
      }

      setReason(null);
      setDetails("");
      setSnackbarMessage("Report sent!");
      setSnackbarVisible(true);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to send report");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const validateReason = (reason: ReasonType | null) => {
    if (!reason) {
      setReasonError("Must select a reason");
      return false;
    }
    setReasonError("");
    return true;
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar backAction={true} title="Report" />
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
              {profile ? (
                <View>
                  <Text variant="titleLarge" style={styles.verticallySpaced}>
                    Report {profile?.username ?? "profile"}
                  </Text>
                  <View style={styles.verticallySpaced}>
                    <Dropdown
                      style={{ flex: 1 }}
                      label="Reason"
                      data={ReasonData}
                      value={reason}
                      onChange={setReason}
                    />
                    {reasonError ? (
                      <HelperText type="error" visible={!!reasonError}>
                        {reasonError}
                      </HelperText>
                    ) : null}
                  </View>
                  <TextInput
                    style={[styles.verticallySpaced, styles.textInput]}
                    label="Details"
                    value={details}
                    onChangeText={(text) => setDetails(text)}
                    multiline={true}
                    numberOfLines={4}
                    maxLength={1500}
                  />
                  <Button
                    mode="contained"
                    style={styles.verticallySpaced}
                    labelStyle={styles.buttonLabel}
                    onPress={() => {
                      sendReport({ reason, details });
                    }}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Send"}
                  </Button>
                </View>
              ) : (
                <Text style={styles.verticallySpaced}>Profile not found</Text>
              )}
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

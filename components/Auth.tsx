import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Button,
  TextInput,
  SegmentedButtons,
  HelperText,
  ActivityIndicator,
  Portal,
  Snackbar,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { ROUTES, useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";
import { calculateAge, toDateString } from "../lib/utils";
import { Appbar } from "./Appbar";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signUp");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [birthday, setBirthday] = useState("");
  const [birthdayError, setBirthdayError] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();

  async function handleAuth() {
    if (
      mode === "signUp" &&
      [
        validateEmail(email),
        validateUsername(username),
        validateBirthday(birthday),
      ].includes(false)
    ) {
      return;
    } else {
      if (!validateEmail(email)) {
        return;
      }
    }

    try {
      setLoading(true);
      const { error } =
        mode === "signUp"
          ? await supabase.auth.signInWithOtp({
              email: email,
              options: { data: { username: username, birthday: birthday } },
            })
          : await supabase.auth.signInWithOtp({
              email: email,
              options: { shouldCreateUser: false },
            });
      if (error) {
        throw Error(error.message);
      } else {
        navigate(`../${ROUTES.OTP}`, { state: { email } });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to send OTP, please try again later");
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
    }
    setEmailError("");
    return true;
  };

  const validateUsername = (username: string) => {
    if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }
    setUsernameError("");
    return true;
  };

  const validateBirthday = (birthday: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(birthday)) {
      setBirthdayError("Birthday must be in the format YYYY-MM-DD");
      return false;
    } else if (calculateAge(new Date(birthday).getTime()) < 18) {
      setBirthdayError("You must be at least 18 years old");
      return false;
    }
    setBirthdayError("");
    return true;
  };

  const onDatePickerDismiss = useCallback(() => {
    setDatePickerVisible(false);
  }, [setDatePickerVisible]);

  const onDatePickerConfirm = useCallback(
    (params: { date: Date | undefined }) => {
      setDatePickerVisible(false);
      if (params.date) {
        const birthday = toDateString(params.date);
        setBirthday(birthday);
        validateBirthday(birthday);
      }
    },
    [setDatePickerVisible, setBirthday, validateBirthday]
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar title="Authentication" />
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
              <SegmentedButtons
                style={styles.verticallySpaced}
                value={mode}
                onValueChange={setMode}
                buttons={[
                  {
                    value: "signUp",
                    label: "Sign Up",
                  },
                  {
                    value: "signIn",
                    label: "Sign In",
                  },
                ]}
              />
              <View style={styles.verticallySpaced}>
                <TextInput
                  style={styles.textInput}
                  label="Email"
                  onChangeText={(text) => {
                    setEmail(text);
                    validateEmail(text);
                  }}
                  onSubmitEditing={() => mode === "signIn" && handleAuth()}
                  value={email}
                  placeholder="user@example.com"
                  autoCapitalize={"none"}
                  error={!!emailError}
                />
                {emailError ? (
                  <HelperText type="error" visible={!!emailError}>
                    {emailError}
                  </HelperText>
                ) : null}
              </View>
              {mode === "signUp" && (
                <View>
                  <View style={styles.verticallySpaced}>
                    <TextInput
                      style={styles.textInput}
                      label="Username (your first name is fine)"
                      value={username || ""}
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
                  </View>
                  <View
                    style={(styles.verticallySpaced, { flexDirection: "row" })}
                  >
                    <View style={[styles.verticallySpaced, { flex: 1 }]}>
                      <Pressable onPress={() => setDatePickerVisible(true)}>
                        <TextInput
                          style={styles.textInput}
                          label="Birthday"
                          value={birthday}
                          error={!!birthdayError}
                          editable={false}
                          right={
                            <TextInput.Icon
                              icon="calendar"
                              onPress={() => setDatePickerVisible(true)}
                            />
                          }
                        />
                      </Pressable>
                      {birthdayError ? (
                        <HelperText type="error" visible={!!birthdayError}>
                          {birthdayError}
                        </HelperText>
                      ) : null}
                    </View>
                    <DatePickerModal
                      label="Select your birthday"
                      locale="en-CA"
                      mode="single"
                      visible={datePickerVisible}
                      onDismiss={onDatePickerDismiss}
                      onConfirm={onDatePickerConfirm}
                    />
                  </View>
                </View>
              )}
              <Button
                mode="contained"
                style={styles.verticallySpaced}
                labelStyle={styles.buttonLabel}
                disabled={loading}
                onPress={handleAuth}
              >
                Continue
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

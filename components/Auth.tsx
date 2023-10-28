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
  Appbar,
  Portal,
  Snackbar,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { ROUTES, useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";
import { calculateAge } from "../lib/utils";

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
        throw error;
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
    if (username.trim() === "") {
      setUsernameError("Username cannot be empty");
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
        const birthday = params.date.toLocaleDateString("en-CA");
        setBirthday(birthday);
        validateBirthday(birthday);
      }
    },
    [setDatePickerVisible, setBirthday, validateBirthday]
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content
          titleStyle={styles.appbarTitle}
          title="Authentication"
        />
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
              <SegmentedButtons
                style={styles.verticallySpaced}
                value={mode}
                onValueChange={setMode}
                buttons={[
                  {
                    value: "signUp",
                    label: "Sign Up",
                    labelStyle: { padding: 1 },
                  },
                  {
                    value: "signIn",
                    label: "Sign In",
                    labelStyle: { padding: 1 },
                  },
                ]}
              />
              <TextInput
                style={styles.verticallySpaced}
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

              {mode === "signUp" && (
                <View>
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
                  {usernameError ? (
                    <HelperText type="error" visible={!!usernameError}>
                      {usernameError}
                    </HelperText>
                  ) : null}
                  <View
                    style={(styles.verticallySpaced, { flexDirection: "row" })}
                  >
                    <View style={[styles.verticallySpaced, { flex: 1 }]}>
                      <Pressable onPress={() => setDatePickerVisible(true)}>
                        <TextInput
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
                      locale="en"
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

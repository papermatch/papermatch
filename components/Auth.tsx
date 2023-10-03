import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Alert, View } from "react-native";
import {
  Button,
  TextInput,
  SegmentedButtons,
  IconButton,
  HelperText,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";

export default function Auth() {
  const [mode, setMode] = useState("signUp");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onDismiss = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onConfirm = useCallback(
    (params: { date: Date | undefined }) => {
      setVisible(false);
      params.date && setBirthday(params.date.toISOString().split("T")[0]);
    },
    [setVisible, setBirthday]
  );

  async function handleAuth() {
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
      Alert.alert(error.message);
    } else {
      navigate(ROUTES.OTP, { state: { email } });
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
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
      <TextInput
        style={styles.verticallySpaced}
        label="Email"
        onChangeText={setEmail}
        value={email}
        placeholder="user@example.com"
        autoCapitalize={"none"}
      />
      {mode === "signUp" && (
        <View>
          <TextInput
            style={styles.verticallySpaced}
            label="Username (your first name is fine)"
            value={username || ""}
            onChangeText={(text) => setUsername(text)}
          />
          <View style={(styles.verticallySpaced, { flexDirection: "row" })}>
            <View style={[styles.verticallySpaced, { flex: 1 }]}>
              <TextInput
                label="Birthday"
                value={birthday}
                error={!birthday}
                disabled
              />
              <HelperText type="error" visible={!birthday}>
                Must select a birthday!
              </HelperText>
            </View>
            <IconButton
              style={[styles.verticallySpaced, { alignSelf: "center" }]}
              onPress={() => setVisible(true)}
              disabled={loading}
              icon="calendar"
            />
            <DatePickerModal
              locale="en"
              mode="single"
              visible={visible}
              onDismiss={onDismiss}
              onConfirm={onConfirm}
            />
          </View>
        </View>
      )}
      <Button
        style={styles.verticallySpaced}
        disabled={loading}
        onPress={handleAuth}
      >
        Continue
      </Button>
    </View>
  );
}

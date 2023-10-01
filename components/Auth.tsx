import { useState, useCallback } from "react";
import { Alert, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, TextInput } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";

export default function Auth() {
  const [signUp, setSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onDismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = useCallback(
    (params: { date: Date | undefined }) => {
      setOpen(false);
      params.date && setBirthday(params.date.toISOString().split("T")[0]);
    },
    [setOpen, setBirthday]
  );

  async function handleAuth() {
    setLoading(true);
    const { error } = signUp
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
      <Button
        style={styles.verticallySpaced}
        onPress={() => setSignUp((prevMode) => !prevMode)}
      >
        {signUp ? "Switch to Sign In" : "Switch to Sign Up"}
      </Button>
      <TextInput
        style={styles.verticallySpaced}
        label="Email"
        onChangeText={setEmail}
        value={email}
        placeholder="user@example.com"
        autoCapitalize={"none"}
      />
      {signUp && (
        <View>
          <TextInput
            style={styles.verticallySpaced}
            label="Username"
            value={username || ""}
            onChangeText={(text) => setUsername(text)}
          />
          <TextInput
            style={styles.verticallySpaced}
            label="Birthday"
            value={birthday}
            error={!birthday}
            disabled
          />
          <Button
            style={styles.verticallySpaced}
            onPress={() => setOpen(true)}
            uppercase={false}
            mode="outlined"
            disabled={loading}
          >
            Select Birthday
          </Button>
          <DatePickerModal
            locale="en"
            mode="single"
            visible={open}
            onDismiss={onDismiss}
            onConfirm={onConfirm}
          />
        </View>
      )}
      <Button
        style={styles.verticallySpaced}
        disabled={loading}
        onPress={handleAuth}
      >
        {signUp ? "Sign Up" : "Sign In"}
      </Button>
    </View>
  );
}

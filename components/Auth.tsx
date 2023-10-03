import { useState, useCallback } from "react";
import { Alert, View } from "react-native";
import { Modal } from "react-native-paper";
import { supabase } from "../lib/supabase";
import {
  Button,
  TextInput,
  Text,
  Switch,
  IconButton,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import styles from "../lib/styles";
import Otp from "./Otp";

export default function Auth() {
  const [signIn, setSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDismiss = useCallback(() => {
    setDatePickerVisible(false);
  }, [setDatePickerVisible]);

  const onConfirm = useCallback(
    (params: { date: Date | undefined }) => {
      setDatePickerVisible(false);
      params.date && setBirthday(params.date.toISOString().split("T")[0]);
    },
    [setDatePickerVisible, setBirthday]
  );

  async function handleAuth() {
    setLoading(true);
    const { error } = signIn
      ? await supabase.auth.signInWithOtp({
          email: email,
          options: { shouldCreateUser: false },
        })
      : await supabase.auth.signInWithOtp({
          email: email,
          options: { data: { username: username, birthday: birthday } },
        });

    if (error) {
      Alert.alert(error.message);
    } else {
      setOtpVisible(true);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
        <Text style={{ flex: 1 }}>
          Switch to {signIn ? "Sign Up" : "Sign In"}
        </Text>
        <Switch value={signIn} onValueChange={() => setSignIn(!signIn)} />
      </View>
      <TextInput
        style={styles.verticallySpaced}
        label="Email"
        onChangeText={setEmail}
        value={email}
        placeholder="user@example.com"
        autoCapitalize={"none"}
      />
      {!signIn && (
        <View>
          <TextInput
            style={styles.verticallySpaced}
            label="Username (your first name is fine)"
            value={username || ""}
            onChangeText={(text) => setUsername(text)}
          />
          <View style={(styles.verticallySpaced, { flexDirection: "row" })}>
            <TextInput
              style={[styles.verticallySpaced, { flex: 1 }]}
              label="Birthday"
              value={birthday}
              error={!birthday}
              disabled
            />
            <IconButton
              style={[styles.verticallySpaced, { alignSelf: "center" }]}
              onPress={() => setDatePickerVisible(true)}
              disabled={loading}
              icon="calendar"
            />
            <DatePickerModal
              locale="en"
              mode="single"
              visible={datePickerVisible}
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
        {signIn ? "Sign In" : "Sign Up"}
      </Button>
      <Modal visible={otpVisible} onDismiss={() => setOtpVisible(false)}>
        <Otp email={email} />
      </Modal>
    </View>
  );
}

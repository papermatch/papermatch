import React, { useState } from "react";
import { Alert, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, TextInput, ActivityIndicator } from "react-native-paper";
import { ROUTES, useLocation, useNavigate } from "../lib/routing";
import styles from "../lib/styles";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const email = location.state?.email || "";
  const navigate = useNavigate();

  if (!email) {
    navigate(ROUTES.AUTH, { replace: true });
  }

  async function verify() {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "magiclink",
    });

    if (error) {
      Alert.alert(error.message);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.verticallySpaced}
        label="OTP"
        onChangeText={setOtp}
        value={otp}
        keyboardType="numeric"
        placeholder="Enter your OTP"
      />
      <Button
        style={styles.verticallySpaced}
        disabled={loading}
        onPress={verify}
      >
        Verify
      </Button>
      <Button
        style={styles.verticallySpaced}
        disabled={loading}
        onPress={() => navigate(-1)}
      >
        Cancel
      </Button>
    </View>
  );
}

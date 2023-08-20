import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "react-native-elements";
import { ROUTES, useLocation, useNavigate } from "../lib/routing";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const phone = location.state?.phone || "";
  const navigate = useNavigate();

  if (!phone) {
    navigate(ROUTES.AUTH, { replace: true });
  }

  async function verify() {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      Alert.alert(error.message);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="OTP"
          onChangeText={setOtp}
          value={otp}
          keyboardType="numeric"
          placeholder="Enter your OTP"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Verify" disabled={loading} onPress={verify} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});

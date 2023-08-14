import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "react-native-elements";

export default function Auth() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  async function signInWithOtp() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      setShowOtpInput(true);
    }
    setLoading(false);
  }

  async function verifyOtp() {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      Alert.alert(error.message);
    }

    setShowOtpInput(false);
  }

  return (
    <View style={styles.container}>
      {!showOtpInput ? (
        <>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
              label="Phone"
              leftIcon={{ type: "font-awesome", name: "phone" }}
              onChangeText={(text) => setPhone(text)}
              value={phone}
              placeholder="+13115552368"
              autoCapitalize={"none"}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              title="Sign in"
              disabled={loading}
              onPress={() => signInWithOtp()}
            />
          </View>
        </>
      ) : (
        <>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
              label="OTP"
              onChangeText={(text) => setOtp(text)}
              value={otp}
              keyboardType="numeric"
              placeholder="Enter your OTP"
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              title="Verify"
              disabled={loading}
              onPress={() => verifyOtp()}
            />
          </View>
        </>
      )}
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

import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "@rneui/themed";
import { ROUTES, useNavigate } from "../lib/routing";

export default function Auth() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });

    if (error) {
      Alert.alert(error.message);
    } else {
      navigate(ROUTES.OTP, { state: { phone } });
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Phone"
          leftIcon={{ type: "font-awesome", name: "phone" }}
          onChangeText={setPhone}
          value={phone}
          placeholder="+13115552368"
          autoCapitalize={"none"}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={signIn} />
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

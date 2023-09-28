import React, { useState } from "react";
import { Alert, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, TextInput } from "react-native-paper";
import { ROUTES, useNavigate } from "../lib/routing";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email });

    if (error) {
      Alert.alert(error.message);
    } else {
      navigate(ROUTES.OTP, { state: { email } });
    }
    setLoading(false);
  }

  return (
    <View>
      <View>
        <TextInput
          label="Email"
          onChangeText={setEmail}
          value={email}
          placeholder="user@example.com"
          autoCapitalize={"none"}
        />
      </View>
      <View>
        <Button disabled={loading} onPress={signIn}>
          Sign In
        </Button>
      </View>
    </View>
  );
}

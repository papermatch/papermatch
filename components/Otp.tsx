import React, { useState } from "react";
import { Alert, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, TextInput } from "react-native-paper";
import { ROUTES, useLocation, useNavigate } from "../lib/routing";

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

  return (
    <View>
      <View>
        <TextInput
          label="OTP"
          onChangeText={setOtp}
          value={otp}
          keyboardType="numeric"
          placeholder="Enter your OTP"
        />
      </View>
      <View>
        <Button disabled={loading} onPress={verify}>
          Verify
        </Button>
      </View>
    </View>
  );
}

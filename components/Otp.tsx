import { useState, useEffect } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { supabase } from "../lib/supabase";
import {
  Button,
  TextInput,
  ActivityIndicator,
  HelperText,
  Appbar,
  Portal,
  Snackbar,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { ROUTES, useLocation, useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";

export default function Otp({ session = undefined }: { session?: Session }) {
  const location = useLocation();
  const email = location.state?.email || "";
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState(
    `Check ${email} for your one-time password`
  );
  const navigate = useNavigate();
  const styles = useStyles();

  useEffect(() => {
    if (session) {
      setAuthenticated(true);
    }
  }, [session]);

  if (!email) {
    navigate(-1);
  }

  async function handleOtp() {
    if (!validateOtp(otp)) {
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: authenticated ? "email_change" : "email",
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        navigate(ROUTES.PROFILES);
      } else {
        navigate(ROUTES.AUTH);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to verify OTP");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const validateOtp = (otp: string) => {
    const regex = /^[0-9]{6}$/;
    if (!regex.test(otp)) {
      setOtpError("OTP must be 6 digits");
      return false;
    } else {
      setOtpError("");
      return true;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.BackAction
          onPress={() => {
            navigate(-1);
          }}
        />
        <Appbar.Content
          titleStyle={styles.appbarTitle}
          title="One-time password"
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
              <TextInput
                style={styles.verticallySpaced}
                label="OTP"
                onChangeText={(text) => {
                  setOtp(text);
                  validateOtp(text);
                }}
                onSubmitEditing={handleOtp}
                value={otp}
                keyboardType="numeric"
                placeholder="Enter your OTP"
                error={!!otpError}
              />
              <HelperText type="error" visible={!!otpError}>
                {otpError}
              </HelperText>
              <Button
                mode="contained"
                style={styles.verticallySpaced}
                labelStyle={styles.buttonLabel}
                disabled={loading}
                onPress={handleOtp}
              >
                Verify
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

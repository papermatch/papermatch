import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Platform, View, KeyboardAvoidingView } from "react-native";
import {
  Button,
  TextInput,
  Appbar,
  Text,
  ActivityIndicator,
  HelperText,
  Divider,
  Portal,
  Snackbar,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { WebView, WebViewNavigation } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import Navigation from "./Navigation";
import { ROUTES, useParams } from "../lib/routing";
import { useStyles } from "../lib/styles";

export default function Credits({ session }: { session: Session }) {
  const currentOrigin =
    Platform.OS === "web"
      ? window.location.origin + "/" + ROUTES.APP
      : "https://www.papermat.ch";
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [quantityError, setQuantityError] = useState<string>("");
  const [credits, setCredits] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const styles = useStyles();
  const { result } = useParams<{ result: string }>();

  useEffect(() => {
    if (Platform.OS === "web" && checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  useEffect(() => {
    if (session) {
      getCredits();
    }
  }, [session]);

  useEffect(() => {
    if (result) {
      setSnackbarMessage(
        result === "success"
          ? "Payment successful!"
          : "Payment unsuccessful, you have not been charged."
      );
      setSnackbarVisible(true);
    }
  }, []);

  async function getCredits() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("credits")
        .select("credits")
        .eq("user_id", session?.user.id);
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setCredits(data.reduce((acc, curr) => acc + curr.credits, 0));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to fetch credits");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const fetchCheckoutUrl = async () => {
    if (!validateQuantity(quantity)) {
      return;
    }

    try {
      setLoading(true);
      if (!session?.user) {
        throw new Error("No user on the session!");
      }

      const response = await supabase.functions.invoke("stripe-checkout", {
        body: {
          id: session?.user.id,
          quantity: parseInt(quantity) || 1,
          origin: currentOrigin,
        },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const data = await response.data;
      setCheckoutUrl(data.url);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to fetch checkout URL");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    if (navState.url === `${currentOrigin}/credits/success`) {
      setCheckoutUrl(null);
      setSnackbarMessage("Payment successful!");
      setSnackbarVisible(true);
    } else if (navState.url === `${currentOrigin}/credits/cancel`) {
      setCheckoutUrl(null);
      setSnackbarMessage("Payment unsuccessful, you have not been charged.");
      setSnackbarVisible(true);
    }
  };

  const validateQuantity = (quantity: string) => {
    const regex = /^[0-9]+$/;
    if (!regex.test(quantity)) {
      setQuantityError("Quantity must be a number");
      return false;
    }
    setQuantityError("");
    return true;
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content titleStyle={styles.appbarTitle} title="Credits" />
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
          <View style={styles.container}>
            <View style={styles.separator} />
            <Text style={styles.verticallySpaced}>
              You have {credits} credit{credits === 1 ? "" : "s"}. Each match
              costs 1 credit, and your profile will not be searchable if you
              have 0 credits.
            </Text>
            <Divider style={styles.verticallySpaced} />
            <Text style={styles.verticallySpaced} variant="titleLarge">
              Purchase credits
            </Text>
            <View style={styles.verticallySpaced}>
              <TextInput
                style={styles.textInput}
                label="Credits"
                keyboardType="numeric"
                value={quantity}
                onChangeText={(text) => {
                  setQuantity(text);
                  validateQuantity(text);
                }}
                placeholder="Enter Quantity"
                error={!!quantityError}
              />
              {quantityError ? (
                <HelperText type="error" visible={!!quantityError}>
                  {quantityError}
                </HelperText>
              ) : null}
            </View>
            <Button
              mode="contained"
              labelStyle={styles.buttonLabel}
              style={styles.verticallySpaced}
              onPress={fetchCheckoutUrl}
              disabled={loading}
            >
              Checkout
            </Button>
          </View>
        </KeyboardAvoidingView>
      )}
      <Portal>
        <Snackbar
          style={[styles.snackbar, styles.aboveNav]}
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
      {Platform.OS !== "web" && checkoutUrl ? (
        <Portal>
          <StatusBar hidden={true} />
          <WebView
            style={{ flex: 1 }}
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleNavigationStateChange}
          />
        </Portal>
      ) : null}
      <Navigation key={session.user.id} session={session} />
    </View>
  );
}

import { SUPABASE_URL } from "@env";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Platform, Alert, View } from "react-native";
import {
  Button,
  TextInput,
  Appbar,
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { WebView, WebViewNavigation } from "react-native-webview";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";

export default function Credits({ session }: { session: Session }) {
  const currentOrigin =
    Platform.OS === "web" ? window.location.origin : "https://papermat.ch";
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  async function getCredits() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
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
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const fetchCheckoutUrl = async () => {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: session?.user.id,
            quantity: parseInt(quantity) || 1,
            origin: currentOrigin,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const data = await response.json();
      setCheckoutUrl(data.url);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("An error occurred", error.message);
      }
    }
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    if (navState.url === `${currentOrigin}/checkout/success`) {
      Alert.alert(
        "Payment Successful",
        "Your payment was successful.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    } else if (navState.url === `${currentOrigin}/checkout/cancel`) {
      Alert.alert(
        "Payment Cancelled",
        "Your payment was cancelled.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }

    if (session?.user?.id) {
      navigate(ROUTES.ACCOUNT);
    }
  };

  const handleSubmit = () => {
    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert("Invalid quantity", "Please enter a valid quantity.");
      return;
    }
    setLoading(true);
    fetchCheckoutUrl();
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Credits" />
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.verticallySpaced}>
            You have {credits} credit{credits === 1 ? "" : "s"}. Each match
            costs 1 credit, and your profile will not be searchable if you have
            0 credits.
          </Text>
          <TextInput
            style={styles.verticallySpaced}
            label="Credits"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Enter Quantity"
          />
          <Button
            style={styles.verticallySpaced}
            onPress={handleSubmit}
            disabled={loading}
          >
            Checkout
          </Button>
          {Platform.OS !== "web" && checkoutUrl ? (
            <WebView
              source={{ uri: checkoutUrl }}
              onNavigationStateChange={handleNavigationStateChange}
            />
          ) : null}
        </View>
      )}
      <Navigation key={session.user.id} session={session} />
    </View>
  );
}

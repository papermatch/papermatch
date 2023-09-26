import { SUPABASE_URL } from "@env";
import { useState, useEffect } from "react";
import { StyleSheet, Platform, Alert, Text, View } from "react-native";
import { Button, Input } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { WebView, WebViewNavigation } from "react-native-webview";
import { ROUTES, useNavigate } from "../lib/routing";

export default function Checkout({ session }: { session: Session }) {
  const currentOrigin =
    Platform.OS === "web" ? window.location.origin : "https://papermat.ch";
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (Platform.OS === "web" && checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

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
    <View style={styles.verticallySpaced}>
      <Input
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter Quantity"
      />
      <Button
        title="Continue Checkout"
        onPress={handleSubmit}
        disabled={loading}
      />
      {Platform.OS !== "web" && checkoutUrl ? (
        <WebView
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={handleNavigationStateChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
});

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Platform, View, KeyboardAvoidingView, FlatList } from "react-native";
import {
  Button,
  TextInput,
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
import { Navigation } from "./Navigation";
import { useStyles } from "../lib/styles";
import { Appbar } from "./Appbar";
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";

export default function Credits({ session }: { session: Session }) {
  const currentOrigin = "https://www.papermat.ch";
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOfferings>();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [quantityError, setQuantityError] = useState<string>("");
  const [credits, setCredits] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const styles = useStyles();

  useEffect(() => {
    if (session) {
      getData();
    }
  }, [session]);

  async function getData() {
    setLoading(true);
    await Promise.all([getCredits(), getOfferings()]);
    setLoading(false);
  }

  async function getCredits() {
    try {
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
    }
  }

  async function getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to fetch offerings");
        setSnackbarVisible(true);
      }
    }
  }

  async function purchasePackage(purchasesPackage: PurchasesPackage) {
    try {
      const purchaseMade = await Purchases.purchasePackage(purchasesPackage);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to purchase package");
        setSnackbarVisible(true);
      }
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
      <Appbar title="Credits" />
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
            {offerings?.current ? (
              <FlatList
                data={offerings.current.availablePackages}
                keyExtractor={(item) => item.identifier}
                renderItem={({ item }) => (
                  <View style={styles.verticallySpaced}>
                    <Text style={styles.verticallySpaced}>
                      {item.product.description}
                    </Text>
                    <Button
                      mode="contained"
                      labelStyle={styles.buttonLabel}
                      style={styles.verticallySpaced}
                      onPress={() => purchasePackage(item)}
                      disabled={loading}
                    >
                      Purchase
                    </Button>
                  </View>
                )}
              />
            ) : (
              <View>
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
            )}
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

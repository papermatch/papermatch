import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ScrollView, View, FlatList, Pressable } from "react-native";
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
import { Navigation } from "./Navigation";
import { useParams } from "../lib/routing";
import { useStyles } from "../lib/styles";
import { Appbar } from "./Appbar";
import { CreditData } from "../lib/types";
import { ROUTES, useNavigate } from "../lib/routing";

export default function Credits({ session }: { session: Session }) {
  const currentOrigin = window.location.origin;
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [quantityError, setQuantityError] = useState<string>("");
  const [credits, setCredits] = useState(0);
  const [history, setHistory] = useState<CreditData[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const styles = useStyles();
  const navigate = useNavigate();
  const { result } = useParams<{ result: string }>();

  useEffect(() => {
    if (checkoutUrl) {
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
          ? "Checkout successful!"
          : "Checkout unsuccessful, you have not been charged."
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
        .select("*")
        .eq("user_id", session?.user.id)
        .order("created_at", { ascending: false });
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setCredits(data.reduce((acc, curr) => acc + curr.credits, 0));
        setHistory(data);
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
        <ScrollView style={styles.container}>
          <View style={styles.separator} />
          <Text style={styles.verticallySpaced}>
            You have {credits} credit{credits === 1 ? "" : "s"}. Each match
            costs 1 credit, and your profile will not be searchable if you have
            0 credits.
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
          <Divider style={styles.verticallySpaced} />
          <Text style={styles.verticallySpaced} variant="titleLarge">
            Credit history
          </Text>
          <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
            <Text style={{ flex: 3 }}>Date</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Credits</Text>
            <Text style={{ flex: 2, textAlign: "right" }}>Type</Text>
          </View>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.verticallySpaced, { flexDirection: "row" }]}
                onPress={
                  item.creditor === "match"
                    ? () => {
                        navigate(`../${ROUTES.MATCH}/${item.creditor_id}`);
                      }
                    : null
                }
              >
                <Text style={{ flex: 3 }}>
                  {new Date(item.created_at).toLocaleString("EN-CA", {
                    hour12: false,
                  })}
                </Text>
                <Text style={{ flex: 1, textAlign: "right" }}>
                  {item.credits}
                </Text>
                <Text style={{ flex: 2, textAlign: "right" }}>
                  {item.creditor === "match"
                    ? "Match"
                    : item.creditor === "init"
                    ? "Initial"
                    : "Purchase"}
                </Text>
              </Pressable>
            )}
          />
        </ScrollView>
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
      <Navigation key={session.user.id} session={session} />
    </View>
  );
}

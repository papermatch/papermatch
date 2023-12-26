import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ScrollView, View } from "react-native";
import {
  Button,
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
import { History } from "./History";

export default function Credits({ session }: { session: Session }) {
  const currentOrigin = window.location.origin;
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const [history, setHistory] = useState<CreditData[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const styles = useStyles();
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
        throw Error(error.message);
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

  const fetchCheckoutUrl = async (quantity: number) => {
    try {
      setLoading(true);
      if (!session?.user) {
        throw new Error("No user on the session!");
      }

      const response = await supabase.functions.invoke("stripe-checkout", {
        body: {
          id: session?.user.id,
          quantity: quantity,
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
            <Button
              mode="contained"
              labelStyle={styles.buttonLabel}
              onPress={() => {
                fetchCheckoutUrl(1);
              }}
              disabled={loading}
            >
              Single Credit ($1.49)
            </Button>
            <HelperText type="info" visible={true}>
              Each credit is good for one match!
            </HelperText>
          </View>{" "}
          <View style={styles.verticallySpaced}>
            <Button
              mode="contained"
              labelStyle={styles.buttonLabel}
              onPress={() => {
                fetchCheckoutUrl(6);
              }}
              disabled={loading}
            >
              Six Pack ($5.99)
            </Button>
            <HelperText type="info" visible={true}>
              A six pack of Paper Match credits!
            </HelperText>
          </View>
          <Divider style={styles.verticallySpaced} />
          <Text style={styles.verticallySpaced} variant="titleLarge">
            Credit history
          </Text>
          <History history={history} />
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

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, FlatList, ScrollView } from "react-native";
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

type PriceData = {
  name: string;
  description: string;
  quantity: number;
  price: string;
};

const PRICE_DATA: PriceData[] = [
  {
    name: "Single Credit",
    description: "Each credit is good for one match!",
    quantity: 1,
    price: "$1.49",
  },
  {
    name: "Six Pack",
    description: "A six pack of Paper Match credits!",
    quantity: 6,
    price: "$5.99",
  },
];

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
          <FlatList
            data={PRICE_DATA}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.verticallySpaced}>
                <Button
                  mode="contained"
                  labelStyle={styles.buttonLabel}
                  onPress={() => fetchCheckoutUrl(item.quantity)}
                  disabled={loading}
                >
                  {item.name + " (" + item.price + ")"}
                </Button>
                <HelperText type="info" visible={true}>
                  {item.description}
                </HelperText>
              </View>
            )}
          />
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

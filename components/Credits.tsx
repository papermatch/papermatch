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
import { useStyles } from "../lib/styles";
import { Appbar } from "./Appbar";
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";
import { CreditData } from "../lib/types";
import { History } from "./History";

export default function Credits({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOfferings>();
  const [credits, setCredits] = useState(0);
  const [history, setHistory] = useState<CreditData[]>([]);
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
      setPurchasing(true);
      const purchaseMade = await Purchases.purchasePackage(purchasesPackage);
      if (purchaseMade.productIdentifier) {
        setSnackbarMessage("Purchase successful!");
        setSnackbarVisible(true);
        await getCredits();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Purchase unsuccessful, you have not been charged.");
        setSnackbarVisible(true);
      }
    } finally {
      setPurchasing(false);
    }
  }

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
          {offerings?.current ? (
            <View>
              {offerings.current.availablePackages.map((item) => (
                <View key={item.identifier} style={styles.verticallySpaced}>
                  <Button
                    mode="contained"
                    labelStyle={styles.buttonLabel}
                    onPress={() => purchasePackage(item)}
                    disabled={purchasing}
                  >
                    {item.identifier + " (" + item.product.priceString + ")"}
                  </Button>
                  <HelperText type="info" visible={true}>
                    {item.product.description}
                  </HelperText>
                </View>
              ))}
            </View>
          ) : (
            <Text
              style={[
                styles.verticallySpaced,
                { marginTop: 12, paddingHorizontal: 12 },
              ]}
            >
              No purchase offerings found, please try again later.
            </Text>
          )}
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

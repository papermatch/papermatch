import { View, ScrollView, FlatList, Linking, Pressable } from "react-native";
import {
  Button,
  Text,
  Divider,
  IconButton,
  Icon,
  HelperText,
} from "react-native-paper";
import { Image } from "expo-image";
import { ROUTES, useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";
import { Appbar } from "./Appbar";

export default function Home() {
  const navigate = useNavigate();
  const styles = useStyles();

  return (
    <View style={{ flex: 1 }}>
      <Appbar
        title="Paper Match"
        menuItems={[
          {
            title: "About",
            onPress: () => {
              navigate(`../${ROUTES.ABOUT}`);
            },
          },
        ]}
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.separator} />
          <Image
            source={{ uri: "/papermatch.png" }}
            style={[
              styles.verticallySpaced,
              { width: 150, height: 150, alignSelf: "center" },
            ]}
            onError={(error) => {
              console.error(error.error);
            }}
          />
          <Text style={styles.verticallySpaced}>
            At Paper Match, we believe in dating without hidden fees or costly
            subscriptions (or fancy websites). Our unique pay-per-match (get
            it?) policy means that you're only charged when you make an actual
            connection.
          </Text>
          <Divider style={styles.verticallySpaced} />
          <Text variant="titleLarge" style={styles.verticallySpaced}>
            How it works
          </Text>
          <FlatList
            data={[
              "Sign up for an account and create your profile",
              "Start liking other profiles (your first match is on us!)",
              "If the other person likes you back, you get matched (and one credit is deducted from both accounts)",
              "Start chatting and see where it goes!",
              "Get more credits for only $1 each (your profile will only be searchable if you have credits available)",
            ]}
            renderItem={({ item, index }) => {
              return (
                <View style={styles.verticallySpaced}>
                  <Text>
                    {index + 1}. {item}
                  </Text>
                </View>
              );
            }}
          />
          <Divider style={styles.verticallySpaced} />
          <Text variant="titleLarge" style={styles.verticallySpaced}>
            Try the app
          </Text>
          <View
            style={[
              styles.verticallySpaced,
              { flexDirection: "row", justifyContent: "space-evenly" },
            ]}
          >
            <IconButton
              icon="web"
              size={60}
              onPress={() => navigate(ROUTES.APP)}
            />
            <IconButton
              icon="google-play"
              size={60}
              onPress={() =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=ch.papermat.papermatch"
                )
              }
            />
            <View style={{ flexDirection: "column", alignItems: "center" }}>
              <IconButton icon="apple" size={60} disabled={true} />
              <HelperText type="info" visible={true}>
                Coming soon!
              </HelperText>
            </View>
          </View>
          <Divider style={styles.verticallySpaced} />
          <Text variant="titleLarge" style={styles.verticallySpaced}>
            Other resources
          </Text>
          <Button
            style={styles.verticallySpaced}
            mode="outlined"
            onPress={() => Linking.openURL("mailto:info@papermat.ch")}
          >
            Contact Us
          </Button>
          <Button
            style={styles.verticallySpaced}
            mode="outlined"
            onPress={() => navigate(ROUTES.PRIVACY)}
          >
            Privacy Policy
          </Button>
          <Divider style={styles.verticallySpaced} />
          <Text
            variant="titleLarge"
            style={[styles.verticallySpaced, { textAlign: "center" }]}
          >
            Be Good On Paper
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

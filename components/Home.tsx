import { useState } from "react";
import { View, ScrollView, FlatList, Linking } from "react-native";
import { Button, Appbar, Text, Divider, Menu } from "react-native-paper";
import { Image } from "expo-image";
import { ROUTES, useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";

export default function Home() {
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const navigate = useNavigate();
  const styles = useStyles();

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content titleStyle={styles.appbarTitle} title="Paper Match" />
        <Menu
          visible={appbarMenuVisible}
          onDismiss={() => setAppbarMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setAppbarMenuVisible(!appbarMenuVisible)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              navigate(ROUTES.ABOUT);
            }}
            title="About"
          />
        </Menu>
      </Appbar.Header>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Image
            source={{ uri: "/papermatch.png" }}
            style={[
              styles.verticallySpaced,
              { width: 150, height: 150, alignSelf: "center" },
            ]}
            onError={(error) =>
              console.error(`Image /papermatch.png error:`, error)
            }
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
          <Text style={styles.verticallySpaced}>
            Paper Match for Android and iOS coming soon! In the meantime, the
            web app is available below.
          </Text>
          <Button
            style={styles.verticallySpaced}
            mode="contained"
            onPress={() => navigate(ROUTES.APP)}
          >
            Web App
          </Button>
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

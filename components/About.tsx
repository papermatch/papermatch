import { View, ScrollView, Linking, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";
import Constants from "expo-constants";
import { Appbar } from "./Appbar";

export default function Home() {
  const navigate = useNavigate();
  const styles = useStyles();

  return (
    <View style={{ flex: 1 }}>
      <Appbar backAction={true} title="About" />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.verticallySpaced}>
            <Text style={{ fontWeight: "500" }}>Contact: </Text>
            <Pressable
              onPress={() => Linking.openURL("mailto:info@papermat.ch")}
            >
              <Text style={{ color: "blue" }}>info@papermat.ch</Text>
            </Pressable>
          </Text>
          <Text style={styles.verticallySpaced}>
            <Text style={{ fontWeight: "500" }}>Version: </Text>
            {Constants.expoConfig?.version}
          </Text>
          <Text style={styles.verticallySpaced}>
            © {new Date().getFullYear()} Consequential Technologies, LLC. All
            rights reserved. All content on this site, including text, graphics,
            logos, and software, is the property of Consequential Technologies,
            LLC and is protected by copyright and other intellectual property
            laws. The content is provided "as is" without warranty of any kind,
            either express or implied. Neither Consequential Technologies, LLC
            nor any of its affiliates shall be liable for any damages arising
            out of the use of the information contained herein.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

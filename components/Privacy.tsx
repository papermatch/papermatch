import { View, ScrollView, FlatList } from "react-native";
import { Text, Divider } from "react-native-paper";
import { useStyles } from "../lib/styles";
import { Appbar } from "./Appbar";

export default function Privacy() {
  const styles = useStyles();

  return (
    <View style={{ flex: 1 }}>
      <Appbar backAction={true} title="Privacy" />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.separator} />
          <Text style={styles.verticallySpaced}>
            Last updated: May 19th, 2024
          </Text>
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            Who We Are
          </Text>
          <Text style={styles.verticallySpaced}>
            Paper Match helps you meet new people based on your interests
            and preferences. We are committed to protecting your privacy
            and ensuring that your personal information is handled responsibly.
          </Text>
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            Where This Privacy Policy Applies
          </Text>
          <Text style={styles.verticallySpaced}>
            This Privacy Policy applies to the Paper Match app and any related
            services provided by us. It does not apply to third-party websites
            or services that may be linked to our app.
          </Text>
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            Information We Collect
          </Text>
          <FlatList
            data={[
              "Information you provide directly to us, such as your name, email address, date of birth, gender, location, and profile pictures.",
              "Information we collect automatically, such as your device information, IP address, and usage data.",
            ]}
            renderItem={({ item, index }) => (
              <Text style={styles.verticallySpaced}>
                {index + 1}. {item}
              </Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            How We Use Information
          </Text>
          <FlatList
            data={[
              "Provide and improve our services",
              "Personalize your experience",
              "Communicate with you",
              "Monitor and analyze usage and trends",
              "Prevent and address fraud, abuse, and other harmful activity",
            ]}
            renderItem={({ item, index }) => (
              <Text style={styles.verticallySpaced}>
                {index + 1}. {item}
              </Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            How We Share Information
          </Text>
          <FlatList
            data={[
              "Other users when you interact with them through our app",
              "Third-party service providers that help us operate our app",
              "Law enforcement or other third parties in response to legal requests",
              "Other parties with your consent or as required by law",
            ]}
            renderItem={({ item, index }) => (
              <Text style={styles.verticallySpaced}>
                {index + 1}. {item}
              </Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            Cross-Border Data Transfers
          </Text>
          <Text style={styles.verticallySpaced}>
            We may transfer your information to countries outside of your
            country of residence, which may have different data protection laws.
            We take steps to ensure that your information is protected in
            accordance with this Privacy Policy.
          </Text>
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            Your Rights And Choices
          </Text>
          <FlatList
            data={[
              "Update your account information or delete your account through the app settings",
              "Control the information you share with other users through your profile settings",
              "Opt-out of promotional communications by following the instructions in those messages",
            ]}
            renderItem={({ item, index }) => (
              <Text style={styles.verticallySpaced}>
                {index + 1}. {item}
              </Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            How Long We Retain Your Information
          </Text>
          <Text style={styles.verticallySpaced}>
            We retain your information for as long as your account is active and
            as needed to provide you with our services. We may also retain and
            use your information to comply with our legal obligations, resolve
            disputes, and enforce our agreements.
          </Text>
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            No Children Allowed
          </Text>
          <Text style={styles.verticallySpaced}>
            Our app is not intended for users under the age of 18. We do not
            knowingly collect information from children.
          </Text>
          <Divider style={styles.verticallySpaced} />

          <Text variant="titleLarge" style={styles.verticallySpaced}>
            Privacy Policy Changes
          </Text>
          <Text style={styles.verticallySpaced}>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on our app and
            updating the "Last updated" date at the top of this document
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

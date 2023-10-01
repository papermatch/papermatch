import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { Session } from "@supabase/supabase-js";
import styles from "../lib/styles";

export default function Edit({ session }: { session: Session }) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [open, setOpen] = useState(false);

  const onDismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = useCallback(
    (params: { date: Date | undefined }) => {
      setOpen(false);
      params.date && setBirthday(params.date.toISOString().split("T")[0]);
    },
    [setOpen, setBirthday]
  );

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setBirthday(data.birthday);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    birthday,
  }: {
    username: string;
    birthday: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        birthday,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.verticallySpaced}
        label="Username"
        value={username || ""}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        style={styles.verticallySpaced}
        label="Birthday"
        value={birthday}
        error={!birthday}
        disabled
      />
      <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
        Select Birthday
      </Button>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={onDismiss}
        onConfirm={onConfirm}
      />
      <Button
        style={styles.verticallySpaced}
        onPress={() => updateProfile({ username, birthday })}
        disabled={loading}
      >
        {loading ? "Loading ..." : "Update"}
      </Button>
    </View>
  );
}

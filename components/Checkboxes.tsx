import { useState } from "react";
import { StyleProp, View, ViewStyle, Pressable } from "react-native";
import { Text, Checkbox, IconButton } from "react-native-paper";
import { AttributeData } from "../lib/types";
import { useStyles } from "../lib/styles";

type CheckboxesProps<T> = {
  label: string;
  data: AttributeData<T>[];
  value: T[];
  onChange: (nextValue: T[]) => void;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  collapsed?: boolean;
};

export const Checkboxes = <T extends string>({
  label,
  data,
  value,
  onChange,
  style,
  loading,
  collapsed = true,
}: CheckboxesProps<T>) => {
  const [visible, setVisible] = useState(!collapsed);
  const styles = useStyles();

  return (
    <View style={style}>
      <Pressable onPress={() => setVisible(!visible)}>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ flex: 1, alignSelf: "center" }} variant="titleMedium">
            {label}
          </Text>
          <IconButton
            icon={visible ? "menu-up" : "menu-down"}
            onPress={() => setVisible(!visible)}
          />
        </View>
      </Pressable>
      {visible && (
        <View style={styles.verticallySpaced}>
          {data.map((item) => (
            <View key={item.value} style={{ flexDirection: "row" }}>
              <IconButton icon={item.icon} />
              <View style={{ flex: 1 }}>
                <Checkbox.Item
                  style={{ flex: 1 }}
                  label={item.label}
                  status={
                    value.indexOf(item.value) == -1 ? "unchecked" : "checked"
                  }
                  onPress={() => {
                    const next = [...value];
                    const index = next.indexOf(item.value);
                    if (index === -1) {
                      next.push(item.value);
                    } else {
                      next.splice(index, 1);
                    }
                    onChange(next);
                  }}
                  disabled={loading}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

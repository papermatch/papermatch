import { useState, Key } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { TextInput, Menu } from "react-native-paper";
import { AttributeData } from "../lib/types";

type DropdownProps<T extends Key> = {
  label: string;
  data: AttributeData<T>[];
  value: T | null;
  onChange: (nextValue: T | null) => void;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
};

export const Dropdown = <T extends Key>({
  label,
  data,
  value,
  onChange,
  style,
  loading,
}: DropdownProps<T>) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={style}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TextInput
            label={label}
            value={data.find((item) => item.value === value)?.label || ""}
            left={
              <TextInput.Icon
                onPress={() => {
                  setMenuVisible(!menuVisible);
                }}
                icon={menuVisible ? "menu-up" : "menu-down"}
              />
            }
            right={
              value && (
                <TextInput.Icon
                  icon="close-circle"
                  onPress={() => onChange(null)}
                />
              )
            }
            disabled={true}
          />
        }
        anchorPosition="bottom"
      >
        {data.map((item) => (
          <Menu.Item
            key={item.value}
            leadingIcon={item.icon}
            onPress={() => {
              onChange(item.value);
              setMenuVisible(false);
            }}
            title={item.label}
            disabled={loading}
          />
        ))}
      </Menu>
    </View>
  );
};

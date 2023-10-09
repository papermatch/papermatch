import { useState, Key } from "react";
import { View } from "react-native";
import { TextInput, Menu } from "react-native-paper";

export type DropdownData<T extends Key> = {
  value: T;
  label: string;
  icon: string;
};

type DropdownProps<T extends Key> = {
  label: string;
  data: DropdownData<T>[];
  value: T | null;
  onChange: (newValue: T | null) => void;
};

export const Dropdown = <T extends Key>({
  label,
  data,
  value,
  onChange,
}: DropdownProps<T>) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
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
          />
        ))}
      </Menu>
    </View>
  );
};

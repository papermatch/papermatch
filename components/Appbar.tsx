import { memo, useState } from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { Appbar as RNPAppbar, Menu } from "react-native-paper";
import { useNavigate } from "../lib/routing";
import { useStyles } from "../lib/styles";

type MenuItem = {
  title: string;
  onPress: () => void;
};

type AppbarProps = {
  backAction?: boolean;
  title: string;
  menuItems?: MenuItem[];
  style?: StyleProp<ViewStyle>;
};

export const Appbar = memo(
  ({ backAction, title, menuItems, style }: AppbarProps) => {
    const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
    const navigate = useNavigate();
    const styles = useStyles();

    return (
      <RNPAppbar.Header mode="center-aligned" style={style}>
        {backAction && (
          <RNPAppbar.BackAction
            onPress={() => {
              navigate(-1);
            }}
          />
        )}
        <RNPAppbar.Content titleStyle={styles.appbarTitle} title={title} />
        {!!menuItems && menuItems.length > 0 && (
          <Menu
            visible={appbarMenuVisible}
            onDismiss={() => setAppbarMenuVisible(false)}
            anchor={
              <RNPAppbar.Action
                icon="dots-vertical"
                onPress={() => setAppbarMenuVisible(!appbarMenuVisible)}
              />
            }
          >
            <View>
              {menuItems?.map((item, index) => (
                <Menu.Item
                  key={index}
                  onPress={() => {
                    setAppbarMenuVisible(false);
                    item.onPress();
                  }}
                  title={item.title}
                />
              ))}
            </View>
          </Menu>
        )}
      </RNPAppbar.Header>
    );
  }
);

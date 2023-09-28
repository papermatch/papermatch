import { useState } from "react";
import { BottomNavigation } from "react-native-paper";
import { ROUTES, useNavigate } from "../lib/routing";

export default function Navigation() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: ROUTES.PROFILES,
      title: "Profiles",
      focusedIcon: "magnify-plus",
      unfocusedIcon: "magnify-plus-outline",
    },
    {
      key: ROUTES.MATCHES,
      title: "Matches",
      focusedIcon: "chat",
      unfocusedIcon: "chat-outline",
    },
    {
      key: ROUTES.CHECKOUT,
      title: "Checkout",
      focusedIcon: "cart",
      unfocusedIcon: "cart-outline",
    },
    {
      key: ROUTES.ACCOUNT,
      title: "Account",
      focusedIcon: "account",
      unfocusedIcon: "account-outline",
    },
  ]);
  const navigate = useNavigate();

  const handleIndexChange = (index: number) => {
    setIndex(index);
    navigate(routes[index].key);
  };

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={handleIndexChange}
      renderScene={() => null}
    />
  );
}

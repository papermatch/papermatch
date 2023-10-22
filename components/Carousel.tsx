import { ReactNode, useState, Key } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

type CarouselProps<T extends Key> = {
  data: T[];
  renderItem: (item: T) => ReactNode;
  start?: T;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  vertical?: boolean;
};

export const Carousel = <T extends Key>({
  data,
  renderItem,
  start,
  style,
  loading,
  vertical,
}: CarouselProps<T>) => {
  const [index, setIndex] = useState(
    start && data.includes(start) ? data.indexOf(start) : 0
  );
  const theme = useTheme();

  return (
    <View
      style={[
        style,
        {
          flexDirection: vertical ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
      ]}
    >
      <IconButton
        icon={vertical ? "chevron-up" : "chevron-left"}
        iconColor={
          index > 0 ? theme.colors.onSurface : theme.colors.onSurfaceDisabled
        }
        onPress={() => {
          setIndex(Math.max(index - 1, 0));
        }}
        disabled={loading}
      />
      {renderItem(data[index])}
      <IconButton
        icon={vertical ? "chevron-down" : "chevron-right"}
        iconColor={
          index < data.length - 1
            ? theme.colors.onSurface
            : theme.colors.onSurfaceDisabled
        }
        onPress={() => {
          setIndex(Math.min(index + 1, data.length - 1));
        }}
        disabled={loading}
      />
    </View>
  );
};

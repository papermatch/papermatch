import { ReactNode, useState, Key } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { IconButton } from "react-native-paper";

type CarouselProps<T extends Key> = {
  data: T[];
  renderItem: (item: T) => ReactNode;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
};

export const Carousel = <T extends Key>({
  data,
  renderItem,
  style,
  loading,
}: CarouselProps<T>) => {
  const [index, setIndex] = useState(0);

  return (
    <View
      style={[
        style,
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
      ]}
    >
      <IconButton
        icon="chevron-left"
        onPress={() => {
          setIndex(index - 1);
        }}
        disabled={loading || index <= 0}
      />
      {renderItem(data[index])}
      <IconButton
        icon="chevron-right"
        onPress={() => {
          setIndex(index + 1);
        }}
        disabled={loading || index >= data.length - 1}
      />
    </View>
  );
};

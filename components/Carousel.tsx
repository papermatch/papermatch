import { ReactElement, Key, useState } from "react";
import { StyleProp, View, ViewStyle, FlatList } from "react-native";
import { useStyles } from "../lib/styles";

const SEPARATOR_SIZE = 12;

type CarouselProps<T extends Key> = {
  data: T[];
  renderItem: (item: T, index: number) => ReactElement;
  size: number;
  index?: number;
  style?: StyleProp<ViewStyle>;
};

export const Carousel = <T extends Key>({
  data,
  renderItem,
  size,
  index = 0,
  style,
}: CarouselProps<T>) => {
  const [width, setWidth] = useState<number>();
  const styles = useStyles();

  return (
    <View
      style={[style, { minHeight: size }]}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
    >
      {width && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item, index }) => renderItem(item, index)}
          horizontal={true}
          snapToInterval={size + SEPARATOR_SIZE}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          getItemLayout={(data, index) => ({
            length: size + SEPARATOR_SIZE,
            offset: (size + SEPARATOR_SIZE) * index,
            index,
          })}
          initialScrollIndex={index}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: (width - size) / 2,
          }}
        />
      )}
    </View>
  );
};

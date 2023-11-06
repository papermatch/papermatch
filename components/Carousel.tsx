import { ReactElement, Key, useState } from "react";
import { StyleProp, View, ViewStyle, FlatList } from "react-native";

const SEPARATOR_SIZE = 12;

type CarouselProps<T extends Key> = {
  data: T[];
  renderItem: (item: T) => ReactElement;
  size: number;
  start?: T;
  style?: StyleProp<ViewStyle>;
};

export const Carousel = <T extends Key>({
  data,
  renderItem,
  size,
  start,
  style,
}: CarouselProps<T>) => {
  const [index, setIndex] = useState(
    start && data.includes(start) ? data.indexOf(start) : 0
  );
  const [width, setWidth] = useState<number>();

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
          renderItem={({ item }) => renderItem(item)}
          horizontal={true}
          snapToInterval={size + SEPARATOR_SIZE}
          ItemSeparatorComponent={() => (
            <View style={{ width: SEPARATOR_SIZE, height: SEPARATOR_SIZE }} />
          )}
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

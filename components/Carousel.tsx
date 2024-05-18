import { memo, ReactElement, useState, useCallback } from "react";
import { StyleProp, View, ViewStyle, FlatList } from "react-native";
import { useStyles } from "../lib/styles";

const SEPARATOR_SIZE = 12;

type CarouselProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => ReactElement;
  size: number;
  index?: number;
  style?: StyleProp<ViewStyle>;
  pageControl?: boolean;
};

function areEqual<T>(
  prevProps: CarouselProps<T>,
  nextProps: CarouselProps<T>
) {
  return prevProps.data === nextProps.data;
}

export const Carousel = memo(
  <T extends string>({
    data,
    renderItem,
    size,
    index = 0,
    style,
    pageControl = true,
  }: CarouselProps<T>) => {
    const [currentIndex, setCurrentIndex] = useState(index);
    const [width, setWidth] = useState<number>();
    const styles = useStyles();

    const handleScroll = useCallback((event: any) => {
      if (pageControl) {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const newIndex = Math.floor(contentOffset / size + 0.5);
        setCurrentIndex(newIndex);
      }
    }, []);

    return (
      <View style={[style, { minHeight: size }]}>
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
                paddingHorizontal:
                  data.length == 1 ? (width - size) / 2 : SEPARATOR_SIZE,
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
        {pageControl && (
          <View style={styles.pageIndicatorContainer}>
            {data.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.pageIndicator,
                  currentIndex === i ? styles.pageIndicatorActive : null,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  },
  areEqual
);

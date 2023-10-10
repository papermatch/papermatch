import { StyleProp, View, ViewStyle } from "react-native";
import { Chip } from "react-native-paper";
import { ProfileData } from "../lib/types";
import { calculateAge } from "../lib/utils";
import { GenderData, KidsData } from "../lib/types";

type AttributesProps = {
  profile: ProfileData;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
};

export const Attributes = ({ profile, style, loading }: AttributesProps) => {
  const gender = GenderData.find((item) => item.value === profile.gender);
  const kids = KidsData.find((item) => item.value === profile.kids);

  return (
    <View style={style}>
      {profile.birthday && (
        <Chip style={{ margin: 4 }} icon="cake-variant" disabled={loading}>
          {calculateAge(Date.parse(profile.birthday))}
        </Chip>
      )}
      {profile.gender && (
        <Chip
          style={{ margin: 4 }}
          icon={gender?.icon || "gender-transgender"}
          disabled={loading}
        >
          {gender?.label || ""}
        </Chip>
      )}
      {profile.kids && (
        <Chip
          style={{ margin: 4 }}
          icon={kids?.icon || "baby-carriage"}
          disabled={loading}
        >
          {kids?.label || ""}
        </Chip>
      )}
    </View>
  );
};

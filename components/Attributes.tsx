import { StyleProp, View, ViewStyle } from "react-native";
import { Chip } from "react-native-paper";
import { ProfileData } from "../lib/types";
import { calculateAge } from "../lib/utils";
import {
  DietData,
  GenderData,
  IntentionData,
  KidsData,
  RelationshipData,
} from "../lib/types";

type AttributesProps = {
  profile: ProfileData;
  distance: number | null;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
};

export const Attributes = ({
  profile,
  distance,
  style,
  loading,
}: AttributesProps) => {
  const gender = GenderData.find((item) => item.value === profile.gender);
  const intention = IntentionData.find(
    (item) => item.value === profile.intention
  );
  const relationship = RelationshipData.find(
    (item) => item.value === profile.relationship
  );
  const kids = KidsData.find((item) => item.value === profile.kids);
  const diet = DietData.find((item) => item.value === profile.diet);

  return (
    <View style={style}>
      {profile.birthday && (
        <Chip
          style={{ margin: 4 }}
          textStyle={{ padding: 1 }}
          icon="cake-variant"
          disabled={loading}
        >
          {calculateAge(Date.parse(profile.birthday))}
        </Chip>
      )}
      {profile.gender && (
        <Chip
          style={{ margin: 4 }}
          textStyle={{ padding: 1 }}
          icon={gender?.icon || "gender-transgender"}
          disabled={loading}
        >
          {gender?.label || ""}
        </Chip>
      )}
      {profile.kids && (
        <Chip
          style={{ margin: 4 }}
          textStyle={{ padding: 1 }}
          icon={kids?.icon || "baby"}
          disabled={loading}
        >
          {kids?.label || ""}
        </Chip>
      )}
      {profile.intention && (
        <Chip
          style={{ margin: 4 }}
          textStyle={{ padding: 1 }}
          icon={intention?.icon || "heart"}
          disabled={loading}
        >
          {intention?.label || ""}
        </Chip>
      )}
      {profile.relationship && (
        <Chip
          style={{ margin: 4 }}
          textStyle={{ padding: 1 }}
          icon={relationship?.icon || "heart-broken"}
          disabled={loading}
        >
          {relationship?.label || ""}
        </Chip>
      )}
      {profile.diet && (
        <Chip
          style={{ margin: 4 }}
          textStyle={{ padding: 1 }}
          icon={diet?.icon || "food-apple"}
          disabled={loading}
        >
          {diet?.label || ""}
        </Chip>
      )}
      {distance !== null && (
        <Chip
          style={{ margin: 4 }}
          textStyle={{ padding: 1 }}
          icon="map-marker"
          disabled={loading}
        >
          {Math.round(distance)} miles
        </Chip>
      )}
    </View>
  );
};

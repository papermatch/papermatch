import { memo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Chip } from "react-native-paper";
import { ProfileData } from "../lib/types";
import { calculateAge } from "../lib/utils";
import {
  DietData,
  EducationData,
  FamilyData,
  GenderData,
  IntentionData,
  RelationshipData,
  ReligionData,
  SexualityData,
} from "../lib/types";

type AttributesProps = {
  profile: ProfileData;
  distance: number | null;
  score: number | null;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
};

export const Attributes = memo(
  ({ profile, distance, score, style, loading }: AttributesProps) => {
    const gender = GenderData.find((item) => item.value === profile.gender);
    const education = EducationData.find(
      (item) => item.value === profile.education
    );
    const religion = ReligionData.find(
      (item) => item.value === profile.religion
    );
    const sexuality = SexualityData.find(
      (item) => item.value === profile.sexuality
    );
    const intention = IntentionData.find(
      (item) => item.value === profile.intention
    );
    const relationship = RelationshipData.find(
      (item) => item.value === profile.relationship
    );
    const family = FamilyData.find((item) => item.value === profile.family);
    const diet = DietData.find((item) => item.value === profile.diet);

    return (
      <View style={style}>
        {score !== null && (
          <Chip style={{ margin: 4 }} icon="gauge" disabled={loading}>
            {score}
          </Chip>
        )}
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
        {profile.education && (
          <Chip
            style={{ margin: 4 }}
            icon={education?.icon || "school"}
            disabled={loading}
          >
            {education?.label || ""}
          </Chip>
        )}
        {profile.religion && (
          <Chip
            style={{ margin: 4 }}
            icon={religion?.icon || "hands-pray"}
            disabled={loading}
          >
            {religion?.label || ""}
          </Chip>
        )}
        {profile.sexuality && (
          <Chip
            style={{ margin: 4 }}
            icon={sexuality?.icon || "human-male-female"}
            disabled={loading}
          >
            {sexuality?.label || ""}
          </Chip>
        )}
        {profile.family && (
          <Chip
            style={{ margin: 4 }}
            icon={family?.icon || "baby"}
            disabled={loading}
          >
            {family?.label || ""}
          </Chip>
        )}
        {profile.intention && (
          <Chip
            style={{ margin: 4 }}
            icon={intention?.icon || "heart"}
            disabled={loading}
          >
            {intention?.label || ""}
          </Chip>
        )}
        {profile.relationship && (
          <Chip
            style={{ margin: 4 }}
            icon={relationship?.icon || "heart-broken"}
            disabled={loading}
          >
            {relationship?.label || ""}
          </Chip>
        )}
        {profile.diet && (
          <Chip
            style={{ margin: 4 }}
            icon={diet?.icon || "food-apple"}
            disabled={loading}
          >
            {diet?.label || ""}
          </Chip>
        )}
        {distance !== null && (
          <Chip style={{ margin: 4 }} icon="map-marker" disabled={loading}>
            {Math.round(distance)} miles
          </Chip>
        )}
      </View>
    );
  }
);

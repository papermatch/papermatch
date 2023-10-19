import { Key } from "react";
import { Database } from "./database";

export type CreditData = Database["public"]["Tables"]["credits"]["Row"];
export type InteractionData =
  Database["public"]["Tables"]["interactions"]["Row"];
export type MatchData = Database["public"]["Tables"]["matches"]["Row"];
export type MessageData = Database["public"]["Tables"]["messages"]["Row"];
export type ProfileData = Database["public"]["Tables"]["profiles"]["Row"];

export type MatchesData = {
  match: MatchData;
  profile: ProfileData;
  message: MessageData | null;
  unread: boolean;
};

export type ProfilesData = {
  profile: ProfileData;
  distance: number | null;
  score: number | null;
};

export type CreditorType = Database["public"]["Enums"]["creditor_type"];
export type DietType = Database["public"]["Enums"]["diet_type"];
export type GenderType = Database["public"]["Enums"]["gender_type"];
export type IntentionType = Database["public"]["Enums"]["intention_type"];
export type InteractionType = Database["public"]["Enums"]["interaction_type"];
export type KidsType = Database["public"]["Enums"]["kids_type"];
export type RelationshipType = Database["public"]["Enums"]["relationship_type"];

export type AttributeData<T extends Key> = {
  value: T;
  label: string;
  icon: string;
};

export const DietData: AttributeData<DietType>[] = [
  {
    value: "omnivore",
    label: "Omnivore",
    icon: "food-steak",
  },
  {
    value: "pescatarian",
    label: "Pescatarian",
    icon: "fish",
  },
  {
    value: "vegetarian",
    label: "Vegetarian",
    icon: "carrot",
  },
  {
    value: "vegan",
    label: "Vegan",
    icon: "alpha-v",
  },
  {
    value: "kosher",
    label: "Kosher",
    icon: "food-kosher",
  },
  {
    value: "halal",
    label: "Halal",
    icon: "food-halal",
  },
  {
    value: "gluten",
    label: "Gluten-free",
    icon: "food-croissant",
  },
  {
    value: "other",
    label: "Other diet",
    icon: "food",
  },
];

export const GenderData: AttributeData<GenderType>[] = [
  {
    value: "male",
    label: "Male",
    icon: "gender-male",
  },
  {
    value: "female",
    label: "Female",
    icon: "gender-female",
  },
  {
    value: "nonbinary",
    label: "Nonbinary",
    icon: "gender-non-binary",
  },
];

export const IntentionData: AttributeData<IntentionType>[] = [
  {
    value: "unsure",
    label: "Figuring out my dating intention",
    icon: "head-question",
  },
  {
    value: "casual",
    label: "Casual dating",
    icon: "heart-half",
  },
  {
    value: "serious",
    label: "Serious dating",
    icon: "heart",
  },
  {
    value: "marriage",
    label: "Marriage",
    icon: "ring",
  },
  {
    value: "friends",
    label: "Friendship",
    icon: "account-group",
  },
];

export const KidsData: AttributeData<KidsType>[] = [
  {
    value: "none",
    label: "Don't want kids",
    icon: "egg-off",
  },
  {
    value: "unsure",
    label: "Might want kids",
    icon: "head-question",
  },
  {
    value: "want",
    label: "Want kids",
    icon: "baby",
  },
  {
    value: "have",
    label: "Have kids and don't want more",
    icon: "baby-carriage-off",
  },
  {
    value: "more",
    label: "Have kids and want more",
    icon: "baby-carriage",
  },
];

export const RelationshipData: AttributeData<RelationshipType>[] = [
  {
    value: "unsure",
    label: "Figuring out my relationship style",
    icon: "head-question",
  },
  {
    value: "monog",
    label: "Monogamous",
    icon: "heart",
  },
  {
    value: "enm",
    label: "Ethically non-monogamous",
    icon: "heart-multiple",
  },
];

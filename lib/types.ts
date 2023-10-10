import { Key } from "react";
import { Database } from "./database";

export type CreditData = Database["public"]["Tables"]["credits"]["Row"];
export type InteractionData =
  Database["public"]["Tables"]["interactions"]["Row"];
export type MatchData = Database["public"]["Tables"]["matches"]["Row"];
export type MessageData = Database["public"]["Tables"]["messages"]["Row"];
export type ProfileData = Database["public"]["Tables"]["profiles"]["Row"];

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

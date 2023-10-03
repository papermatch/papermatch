import { Database } from "./database";

export type CreditData = Database["public"]["Tables"]["credits"]["Row"];
export type InteractionData =
  Database["public"]["Tables"]["interactions"]["Row"];
export type MatchData = Database["public"]["Tables"]["matches"]["Row"];
export type MessageData = Database["public"]["Tables"]["messages"]["Row"];
export type ProfileData = Database["public"]["Tables"]["profiles"]["Row"];

export type CreditorType = Database["public"]["Enums"]["creditor_type"];
export type GenderType = Database["public"]["Enums"]["gender_type"];
export type InteractionType = Database["public"]["Enums"]["interaction_type"];

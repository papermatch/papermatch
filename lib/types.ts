import { Database } from "./database";

export type CreditData = Database["public"]["Tables"]["credits"]["Row"];
export type InteractionData =
  Database["public"]["Tables"]["interactions"]["Row"];
export type MatchData = Database["public"]["Tables"]["matches"]["Row"];
export type MessageData = Database["public"]["Tables"]["messages"]["Row"];
export type ProfileData = Database["public"]["Tables"]["profiles"]["Row"];

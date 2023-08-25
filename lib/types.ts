import { Database } from "./database";

export type InteractionData =
  Database["public"]["Tables"]["interactions"]["Row"];
export type ProfileData = Database["public"]["Tables"]["profiles"]["Row"];

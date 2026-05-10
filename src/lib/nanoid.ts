import { nanoid } from "nanoid";

/** Length of share IDs in characters. Matches SPEC §5 (ShareRecord). */
export const SHARE_ID_LENGTH = 10;

/** Generate a 10-character URL-safe share ID. */
export function generateShareId(): string {
  return nanoid(SHARE_ID_LENGTH);
}

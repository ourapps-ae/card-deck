// Card facts for a client that draws cards: rank, suit, colour, suit glyph, court name. Data only;
// the card faces and pip layouts belong to card-graphics.

export type CardFacts = { code: string; rank: string; suit: string; red: boolean; glyph: string; court: string | null; joker: boolean };

export const SUIT_GLYPHS: Record<string, string> = { c: "\u2663", d: "\u2666", h: "\u2665", s: "\u2660" };
export const COURT_NAMES: Record<string, string> = { J: "jack", Q: "queen", K: "king" };
const RANKS = "23456789TJQKA";
const SUITS = "cdhs";

// Null for anything that is not a card code.
export function cardFacts(code: unknown): CardFacts | null {
  if (typeof code !== "string" || code.length !== 2) return null;
  const rank = code[0];
  const suit = code[1];
  if (rank === "*" && (suit === "r" || suit === "b")) return { code, rank, suit, red: suit === "r", glyph: "\u2605", court: null, joker: true };
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) return null;
  return { code, rank, suit, red: suit === "h" || suit === "d", glyph: SUIT_GLYPHS[suit], court: COURT_NAMES[rank] ?? null, joker: false };
}

// The rank as printed: T shows as 10 unless the language supplies its own letter (J is V in French).
export function rankLabel(rank: string, letters: Record<string, string> = {}): string {
  if (rank === "T" && !letters.T) return "10";
  return letters[rank] ?? rank;
}

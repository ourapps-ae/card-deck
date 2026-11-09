// Not packaged. card-deck over the real fair-shuffle and poker-hand-ranking components (siblings).
// Run: node --test authoring/integration.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { cardCodes, createShuffledDeck, fullPack } from "../implementation/server/deck.ts";

const shuffleFile = new URL("../../fair-shuffle/implementation/server/random.ts", import.meta.url);
const rankingFile = new URL("../../poker-hand-ranking/implementation/server/ranking.ts", import.meta.url);

test("a created fair-shuffle source deals a full, repeatable deck", { skip: existsSync(shuffleFile) ? false : "fair-shuffle is not present" }, async () => {
  const fair = await import(shuffleFile.href);
  const a = createShuffledDeck({ decks: 1, jokers: false }, fair.seededSource(42));
  assert.deepEqual([...a.draw].sort(), [...fullPack()].sort());
  assert.deepEqual(a, createShuffledDeck({ decks: 1, jokers: false }, fair.seededSource(42)));
});

test("poker-hand-ranking accepts card-deck's cardCodes", { skip: existsSync(rankingFile) ? false : "poker-hand-ranking is not present" }, async () => {
  const { createHandRanking } = await import(rankingFile.href);
  const ranking = createHandRanking(cardCodes);
  assert.ok(ranking.compare(["As", "Ks", "Qs", "Js", "Ts"], ["2c", "2d", "5h", "9s", "Kd"]) > 0);
  assert.equal(ranking.evaluate(["As", "Ks", "Qs", "Js", "Ts"]).category, "straightFlush");
});

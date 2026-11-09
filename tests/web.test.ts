import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {burn, cardCodes, cardName, createDeck, createShuffledDeck, deal, fullPack, isCard, isRed, makeCard, parseCard, rankOf, remaining, shuffleDeck, suitOf, validateSettings, type Shuffler} from "../implementation/server/deck.ts";
import {cardFacts, rankLabel} from "../implementation/web/cards.ts";
import {dealHoldem} from "../examples/consumer.ts";

const fixture = JSON.parse(readFileSync(new URL("fixtures/cards.json", import.meta.url), "utf8"));

// A source that needs no random-source component: rotates the list by one.
const rotate: Shuffler = {shuffle: <T>(items: readonly T[]) => [...items.slice(1), items[0]]};
// A tiny seeded source of its own, so the deal is varied but repeatable.
function lcgSource(seed: number): Shuffler {
  let s = seed;
  const next = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  return {shuffle: <T>(items: readonly T[]) => {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }};
}

test("a full pack has 52 distinct cards in suit order", () => {
  const pack = fullPack();
  assert.equal(pack.length, 52);
  assert.equal(new Set(pack).size, 52);
  assert.deepEqual(pack.slice(0, 3), ["2c", "3c", "4c"]);
  assert.equal(pack[51], "As");
  assert.ok(pack.every(isCard));
});

test("card code parsing, colour and names match the shared fixture", () => {
  for (const [code, valid, rankIndex, suitIndex, red, court, label, glyph] of fixture.rows) {
    assert.equal(isCard(code), valid, code);
    assert.equal(parseCard(code) !== null, valid, code);
    const facts = cardFacts(code);
    assert.equal(facts !== null, valid, code);
    if (!valid) continue;
    assert.equal(parseCard(code)!.rank, rankIndex, code);
    assert.equal(parseCard(code)!.suit, suitIndex, code);
    assert.equal(isRed(code), red, code);
    assert.equal(facts!.red, red, code);
    assert.equal(facts!.court, court, code);
    assert.equal(facts!.glyph.codePointAt(0), glyph, code);
    if (!facts!.joker) assert.equal(rankLabel(facts!.rank), label, code);
  }
  for (const [code, label] of Object.entries(fixture.frenchLabels)) assert.equal(rankLabel(code[0], fixture.frenchLetters), label, code);
  for (const bad of [null, undefined, 12, {}]) {
    assert.equal(parseCard(bad), null);
    assert.equal(cardFacts(bad), null);
  }
});

test("rank and suit indexes round trip through makeCard", () => {
  for (let r = 0; r < 13; r++) for (let s = 0; s < 4; s++) {
    const c = makeCard(r, s);
    assert.equal(rankOf(c), r);
    assert.equal(suitOf(c), s);
  }
  assert.throws(() => makeCard(13, 0), RangeError);
  assert.throws(() => makeCard(0, 4), RangeError);
  assert.equal(cardName("As"), "ace of spades");
  assert.equal(cardName("*r"), "red joker");
  assert.throws(() => cardName("zz"), RangeError);
});

test("settings: decks and jokers", () => {
  assert.equal(createDeck({decks: 1, jokers: false}).draw.length, 52);
  assert.equal(createDeck({decks: 1, jokers: true}).draw.length, 54);
  assert.equal(createDeck({decks: 6, jokers: false}).draw.length, 312);
  const two = createDeck({decks: 2, jokers: true}).draw;
  assert.equal(two.length, 108);
  assert.equal(two.filter((c) => c === "*r").length, 2);
  assert.equal(two.filter((c) => c === "As").length, 2);
  for (const bad of [0, 9, 1.5, NaN]) assert.throws(() => validateSettings({decks: bad, jokers: false}), RangeError);
  assert.throws(() => validateSettings({decks: 1, jokers: "yes" as never}), TypeError);
});

test("shuffle keeps every card, goes through the injected source, and leaves the input deck alone", () => {
  const fresh = createDeck({decks: 1, jokers: false});
  const rotated = shuffleDeck(fresh, rotate);
  assert.equal(rotated.draw[0], "3c");
  assert.equal(rotated.draw[51], "2c");
  assert.equal(fresh.draw[0], "2c");
  const shuffled = createShuffledDeck({decks: 1, jokers: true}, lcgSource(5));
  assert.deepEqual([...shuffled.draw].sort(), [...createDeck({decks: 1, jokers: true}).draw].sort());
  assert.notDeepEqual(shuffled.draw, createDeck({decks: 1, jokers: true}).draw);
  assert.deepEqual(createShuffledDeck({decks: 1, jokers: false}, lcgSource(5)), createShuffledDeck({decks: 1, jokers: false}, lcgSource(5)));
});

test("deal takes from the end of the pile, first card first, without changing the old deck", () => {
  const deck = createDeck({decks: 1, jokers: false});
  const {cards, deck: rest} = deal(deck, 3);
  assert.deepEqual(cards, ["As", "Ks", "Qs"]);
  assert.equal(remaining(rest), 49);
  assert.equal(remaining(deck), 52);
  assert.deepEqual(deal(deck, 0).cards, []);
  assert.equal(deal(deck).cards.length, 1);
  assert.throws(() => deal(rest, 50), /cannot deal 50 from 49/);
  assert.throws(() => deal(deck, -1), RangeError);
  assert.throws(() => deal(deck, 1.5), RangeError);
});

test("cardCodes is the surface poker-hand-ranking reads", () => {
  assert.equal(cardCodes.ranks, "23456789TJQKA");
  assert.equal(cardCodes.suits, "cdhs");
  assert.equal(cardCodes.rankNames.length, 13);
  assert.equal(cardCodes.rankPlurals[12], "aces");
  assert.equal(cardCodes.rankOf("As"), 12);
  assert.equal(cardCodes.suitOf("2h"), 2);
  assert.deepEqual(cardCodes.fullDeck(), fullPack());
});

test("burn moves cards aside and a later shuffle does not bring them back", () => {
  const burned = burn(createDeck({decks: 1, jokers: false}), 2);
  assert.deepEqual(burned.burned, ["As", "Ks"]);
  assert.equal(remaining(burned), 50);
  const again = shuffleDeck(burned, lcgSource(9));
  assert.deepEqual(again.burned, ["As", "Ks"]);
  assert.ok(!again.draw.includes("As"));
  assert.equal(new Set([...again.draw, ...again.burned]).size, 52);
});

test("a whole holdem deal uses distinct cards and leaves the right count", () => {
  const out = dealHoldem(9, lcgSource(11));
  const all = [...out.hands.flat(), ...out.flop];
  assert.equal(all.length, 21);
  assert.equal(new Set(all).size, 21);
  assert.equal(out.left, 52 - 18 - 1 - 3);
});

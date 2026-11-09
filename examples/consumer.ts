import {burn, createShuffledDeck, deal, type Card, type Shuffler} from "../implementation/server/deck.ts";

// A hold'em style deal using only the deck: two hole cards each, burn one, then three board cards.
export function dealHoldem(players: number, source: Shuffler): {hands: Card[][]; flop: Card[]; left: number} {
  let deck = createShuffledDeck({decks: 1, jokers: false}, source);
  const hands: Card[][] = Array.from({length: players}, () => []);
  for (let round = 0; round < 2; round++) {
    for (const hand of hands) {
      const dealt = deal(deck);
      hand.push(...dealt.cards);
      deck = dealt.deck;
    }
  }
  deck = burn(deck);
  const flop = deal(deck, 3);
  return {hands, flop: flop.cards, left: flop.deck.draw.length};
}

# Source mapping

Reference revision: `19905b75dbea89fbfd424d67fe26c81aaed0e018`. Extraction source: the `recipe/` folder of `ourapps-ae/OurPoker`; paths below are relative to it.

- `implementation/server/deck.ts` <- `server/src/cards.ts:1-27` (RANKS, SUITS, `rankOf`, `suitOf`, `makeCard`, `isCard`, `fullDeck`), `cards.ts:39-40` (RANK_NAMES, RANK_PLURALS), `server/src/contract.ts:9-10` (the `Card` type), `server/src/engine.ts:653-657` and `engine.ts:858-866` (deck created, shuffled, dealt with `deck.pop()`).
  - Kept: card code format, rank and suit order, order of `fullDeck` (as `fullPack`), dealing from the end of the pile, the name tables.
  - Generalised: `fullDeck()` -> `createDeck({decks, jokers})`; the deck is an immutable `Deck {draw, burned}` instead of a bare array mutated by `pop()`; `deal(deck, n)` and `burn(deck, n)` replace the engine's inline `pop()` calls (including the flop's three cards and the runout); shuffling goes through an injected `{shuffle}` (the `random-source` interface) instead of the recipe's `shuffle(items, rng)`.
  - Added, not in the recipe: `decks` (1 to 8) and `jokers` settings with joker codes `*r` and `*b`; `parseCard`, `cardName`, `isRed`, `validateSettings`; range checks on `makeCard`, `deal`.
  - Left behind: `shuffle(items, rng)` (`cards.ts:29-37`) now lives in `fair-shuffle`; hand evaluation and the poker-specific use of ranks (`evaluate.ts`, `odds.ts`, `bot.ts`) belong to poker-hand-ranking, poker-odds and poker-strategy.
- `implementation/web/cards.ts` <- `web/src/dom.ts:18-24` (SUITS glyph map, COURT names, `rankText`) and `dom.ts:79-82` (rank, suit and red from a code in `cardEl`).
  - Kept: glyph code points, court names, red = hearts or diamonds, rank label with `T` printed as 10 (`web/src/strings.json` `rank_T`).
  - Generalised: the language lookup `L("rank_" + r)` becomes an injected `letters` map; jokers added.
  - Left behind: everything that builds elements (`h`, `cardEl`, `PIPS`, card artwork lookup, `setCardTheme`) belongs to `card-graphics`.
- `implementation/apple/Sources/CardCodes.swift` <- `ios/OurPoker/Sources/Cards.swift:3-10` (`suitGlyph`), `Cards.swift:12-15` (`rankText`), `Cards.swift:17-24` (`courtName`), `Cards.swift:71-72` and `Cards.swift:89` (code split into rank and suit, red test).
  - Kept: glyphs, court names, red rule. Generalised: the three private helpers and the parse become one public `CardCode` struct with a failable initialiser; the localised lookup `L("rank_...")` becomes an injected dictionary; jokers and `rankIndex`/`suitIndex` added.
  - Left behind: SwiftUI drawing, pip layout, card theme environment key (`card-graphics`).
- `implementation/android/src/main/java/ae/deck/CardCode.kt` <- `android/app/src/main/java/app/ourapps/ourpoker/ui/Cards.kt:53-55` (`suitGlyph`), `Cards.kt:57-63` (`rankText`), `Cards.kt:65-67` (`courtName`), `Cards.kt:116-119` (code split, red test).
  - Same generalisation as Apple; package `ae.deck`. Not compiled here (no kotlinc).
  - Left behind: Compose drawing, colours, pip layout (`card-graphics`).
- `tests/fixtures/cards.json`: new, shared by the web, Apple and Android tests (15 rows of codes, valid or not, with expected indexes, colour, court name, label and glyph code point).
- `tests/web.test.ts`, `tests/apple/main.swift`, `tests/android/Main.kt`, `tests/native.py`: new. `native.py` follows `tests/native.py` in `ourapps-ae/store-update`.
- `cardCodes` (`generated-platform`): the `CardCodes` object poker-hand-ranking takes. `authoring/integration.test.ts`: new.
- `examples/consumer.ts`: new; a hold'em style deal using only this component and an injected shuffler.
- `interfaces/required-random-source.json`: a byte copy of fair-shuffle's `ae/random-source` document; card-deck calls only `RandomSource.shuffle` (the `Shuffler` schema of `interfaces/card-deck.json`).

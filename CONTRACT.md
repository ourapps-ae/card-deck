# Card deck component

## Purpose and facilities
Every card game needs the same data: which cards exist, how to name them, how to shuffle them fairly, and how to hand them out. This component holds that and nothing about any particular game. A card is a two-character code (rank 2-9, T, J, Q, K, A, then suit c, d, h, s; jokers are `*r` and `*b`). A `Deck` is an immutable pair of piles: cards still to deal and cards burned. `shuffleDeck` shuffles through an injected random source, so tests can replay a deal. Clients get the data side of cards (colour, suit glyph, court name, rank label) without any drawing code; faces belong to `card-graphics`.

Facilities: `card-deck` (Create, shuffle, deal and burn cards; card codes, colours and names).

## User inputs
The installer collects two settings. `decks` is how many 52-card packs to combine (whole number, 1 to 8; default 1). `jokers` adds two jokers per pack when true (default false).

- `decks` (integer; optional; default `1`)
- `jokers` (boolean; optional; default `False`)

## Artefacts and dependencies
`component.json` maps every `implementation/` source into `components/card-deck/`:

- `implementation/android/src/main/java/ae/deck/CardCode.kt` -> `components/card-deck/android/src/main/java/ae/deck/CardCode.kt`
- `implementation/apple/Sources/CardCodes.swift` -> `components/card-deck/apple/Sources/CardCodes.swift`
- `implementation/server/deck.ts` -> `components/card-deck/server/deck.ts`
- `implementation/web/cards.ts` -> `components/card-deck/web/cards.ts`

Dependencies: none.
`tools.lock.json` pins verification tools: node 26.5, python3 3.12, swiftc 6.4, kotlinc 2.2, java 26.0. Licence: `Apache-2.0` (`LICENCE`, `NOTICE`).

## Provided interfaces
- `interfaces/card-deck.json` defines `card-deck` (ae/card-deck) version 1.0.0: an OpenRPC 1.3.2 document, one method per function (a member of a created object is `<Type>.<member>`), with parameter, result and data types as JSON Schema 2020-12 (`components.schemas`) and thrown errors under `errors`.

## Required interfaces
- `random-source` (ae/random-source) version 1.0.0, supplied by the recipe or application.

`interfaces/required-random-source.json` is a byte copy of the providing component's document.

## Integration
Server code builds a deck from the settings, shuffles it with the `random-source` the recipe connects, and deals with `deal(deck, n)`. Cards come off the end of the pile, first card first. Rules components (`holdem-rules`, `poker-hand-ranking`, `poker-odds`) use `parseCard`, `rankOf` and `suitOf`. Client code uses `cardFacts` (web) or `CardCode` (Apple, Android) to decide colour, glyph and court name before handing the result to a graphics component. The required `random-source` is used through one method, `shuffle(items)`; a created fair-shuffle source (`createSource`, `seededSource`, `secureSource`, `sourceFrom`) has it, and so does any object with that method, so the component is testable without the shuffle component. `cardCodes` is the `CardCodes` object (ranks, suits, names, `rankOf`, `suitOf`, `fullDeck`) that poker-hand-ranking takes.

## Visual definition and connected examples
`visual/definition.json` maps its ports to the provided and required interfaces. `visual/examples/connected.json` connects the component to an illustrative application consumer. Both image formats and a text description are retained under `visual/output/`.

## Infrastructure
No deployed service and no accounts; local library functions only.

## Verification
`tests/web.test.ts` (required-local) checks the 52-card pack, jokers and decks counts, code parsing against `tests/fixtures/cards.json`, shuffling through an injected source, `cardCodes`, deal order and errors, burn, and a nine-player hold'em deal. `tests/native.py apple` compiles `CardCode.swift` with swiftc and checks the same fixture (run and passed on this machine). `tests/native.py android` compiles `CardCode.kt` with kotlinc and checks the same fixture; kotlinc is not installed here, so it was written but not run. `authoring/integration.test.ts` (not packaged) deals with the real fair-shuffle sibling and ranks with the real poker-hand-ranking sibling.

- `node --test tests/web.test.ts` (web, required-local; tools: node 26.5)
- `python3 tests/native.py apple` (apple, platform; tools: python3 3.12, swiftc 6.4)
- `python3 tests/native.py android` (android, platform; tools: python3 3.12, kotlinc 2.2, java 26.0)

## Scenarios and presentation
A hold'em table shuffles a single deck each hand. A game with several decks (a shoe) sets `decks` to 6. A rummy-style game sets `jokers` to true. A test fixes the deal by injecting a source that reorders the deck in a known way.

## Updates and removal
Patch updates replace the files only. Card codes and the order of `createDeck` are part of the contract: changing either is a new major version. The component keeps no data.

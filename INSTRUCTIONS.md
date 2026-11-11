# Card deck instructions

## For the agent
Select this component for any game that deals playing cards. Set `decks` and `jokers` from the recipe's answers (hold'em: 1 deck, no jokers). Connect a `random-source` (fair-shuffle) to its required `random-source` port. Include the web, Apple and Android client files only when the matching client targets are selected.

- Select package `ourapps-ae/card-deck` version `0.4.0`.
- Settings to configure:
  - `decks` (integer; optional; default `1`)
  - `jokers` (boolean; optional; default `False`)
- Connect the provided `card-deck` (ae/card-deck 1.0.0) to the consumer that needs it.
- Supply `random-source` (ae/random-source 1.0.0) from the component that provides it.
- No accounts or keys are needed.

## For the developer
Call `createShuffledDeck(settings, source)` once per round and keep the returned `Deck` in game state; every operation returns a new deck. Do not draw card faces here; use `card-graphics`. If your game has extra card values, add them in your own rules component, not in the code table here.

## How to check
From the component directory:

- `node --test tests/web.test.ts` (web, required-local; tools: node 26.5)
- `python3 tests/native.py apple` (apple, platform; tools: python3 3.12, swiftc 6.4)
- `python3 tests/native.py android` (android, platform; tools: python3 3.12, kotlinc 2.2, java 26.0)
- `python3 -m aepm review <digest> --store STORE --policy POLICY --trusted --allow-network` checks an archive fetched with `python3 -m aepm fetch ourapps-ae/card-deck@VERSION --store STORE --from https://ourapps.app` and runs its suites.

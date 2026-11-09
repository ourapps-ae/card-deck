package ae.deck

// Card facts for a client that draws cards. Data only; faces and pip layouts belong to card-graphics.
// A code is two characters: rank 2-9, T, J, Q, K, A then suit c, d, h, s. Jokers are "*r" and "*b".
class CardCode private constructor(val rank: Char, val suit: Char) {
    val isJoker: Boolean get() = rank == '*'
    val isRed: Boolean get() = suit == 'h' || suit == 'd' || (isJoker && suit == 'r')

    // Rank index 0 is a two, 12 an ace; -1 for a joker.
    val rankIndex: Int get() = RANKS.indexOf(rank)

    // Suit index follows "cdhs"; -1 for a joker.
    val suitIndex: Int get() = if (isJoker) -1 else SUITS.indexOf(suit)

    val suitGlyph: String
        get() = when (suit) {
            'c' -> "\u2663"; 'd' -> "\u2666"; 'h' -> "\u2665"; 's' -> "\u2660"; else -> "\u2605"
        }

    val courtName: String?
        get() = when (rank) {
            'J' -> "jack"; 'Q' -> "queen"; 'K' -> "king"; else -> null
        }

    // The rank as printed: T shows as 10 unless the language supplies its own text (J is V in French).
    fun rankLabel(letters: Map<Char, String> = emptyMap()): String =
        letters[rank] ?: if (rank == 'T') "10" else rank.toString()

    companion object {
        const val RANKS = "23456789TJQKA"
        const val SUITS = "cdhs"

        // Null for anything that is not a card code.
        fun parse(code: String?): CardCode? {
            if (code == null || code.length != 2) return null
            val rank = code[0]
            val suit = code[1]
            val joker = rank == '*' && (suit == 'r' || suit == 'b')
            return if (joker || (RANKS.indexOf(rank) >= 0 && SUITS.indexOf(suit) >= 0)) CardCode(rank, suit) else null
        }
    }
}

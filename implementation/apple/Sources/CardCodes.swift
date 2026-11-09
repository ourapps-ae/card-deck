import Foundation

// Card facts for a client that draws cards. Data only; faces and pip layouts belong to card-graphics.
// A code is two characters: rank 2-9, T, J, Q, K, A then suit c, d, h, s. Jokers are "*r" and "*b".
public struct CardCode: Equatable {
    public static let ranks = Array("23456789TJQKA")
    public static let suits = Array("cdhs")

    public let rank: Character
    public let suit: Character

    // Nil for anything that is not a card code.
    public init?(_ code: String?) {
        guard let code, code.count == 2, let rank = code.first, let suit = code.last else { return nil }
        let joker = rank == "*" && (suit == "r" || suit == "b")
        guard joker || (CardCode.ranks.contains(rank) && CardCode.suits.contains(suit)) else { return nil }
        self.rank = rank
        self.suit = suit
    }

    public var isJoker: Bool { rank == "*" }
    public var isRed: Bool { suit == "h" || suit == "d" || (isJoker && suit == "r") }
    // Rank index 0 is a two, 12 an ace; -1 for a joker.
    public var rankIndex: Int { CardCode.ranks.firstIndex(of: rank) ?? -1 }
    // Suit index follows "cdhs"; -1 for a joker.
    public var suitIndex: Int { isJoker ? -1 : (CardCode.suits.firstIndex(of: suit) ?? -1) }

    public var suitGlyph: String {
        switch suit {
        case "c": return "\u{2663}"
        case "d": return "\u{2666}"
        case "h": return "\u{2665}"
        case "s": return "\u{2660}"
        default: return "\u{2605}"
        }
    }

    public var courtName: String? {
        switch rank {
        case "J": return "jack"
        case "Q": return "queen"
        case "K": return "king"
        default: return nil
        }
    }

    // The rank as printed: T shows as 10 unless the language supplies its own text (J is V in French).
    public func rankLabel(_ letters: [Character: String] = [:]) -> String {
        if let text = letters[rank] { return text }
        return rank == "T" ? "10" : String(rank)
    }
}

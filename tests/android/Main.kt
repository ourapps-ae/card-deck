import ae.deck.CardCode
import java.io.File

// Minimal reader for the flat fixture: rows are lines of the form ["2c", true, 0, 0, false, null, "2", 9827].
fun main() {
    var checks = 0
    fun verify(condition: Boolean, message: String) {
        check(condition) { "FAIL $message" }
        checks++
    }
    val rowPattern = Regex("""^\s*\[("[^"]*"), (true|false), (-?\d+), (-?\d+), (true|false), (null|"[a-z]+"), "([^"]*)", (\d+)\],?\s*$""")
    var rows = 0
    for (line in File("tests/fixtures/cards.json").readLines()) {
        val m = rowPattern.matchEntire(line) ?: continue
        rows++
        val code = m.groupValues[1].trim('"')
        val card = CardCode.parse(code)
        verify((card != null) == (m.groupValues[2] == "true"), "valid $code")
        if (card == null) continue
        verify(card.rankIndex == m.groupValues[3].toInt(), "rankIndex $code")
        verify(card.suitIndex == m.groupValues[4].toInt(), "suitIndex $code")
        verify(card.isRed == (m.groupValues[5] == "true"), "red $code")
        verify(card.courtName == m.groupValues[6].trim('"').takeIf { it != "null" }, "court $code")
        verify(card.isJoker || card.rankLabel() == m.groupValues[7], "label $code")
        verify(card.suitGlyph[0].code == m.groupValues[8].toInt(), "glyph $code")
    }
    verify(rows == 15, "fixture rows read: $rows")
    verify(CardCode.parse(null) == null, "null code")
    val french = mapOf('J' to "V", 'Q' to "D", 'K' to "R")
    verify(CardCode.parse("Js")!!.rankLabel(french) == "V", "french jack")
    verify(CardCode.parse("Th")!!.rankLabel(french) == "10", "ten")
    println("$checks card code assertions passed")
}

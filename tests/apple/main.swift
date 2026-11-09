import Foundation

let data = try Data(contentsOf: URL(fileURLWithPath: "tests/fixtures/cards.json"))
let fixture = try JSONSerialization.jsonObject(with: data) as! [String: Any]
let rows = fixture["rows"] as! [[Any]]
var checks = 0
func expect(_ condition: Bool, _ message: String) {
    if !condition { FileHandle.standardError.write(Data("FAIL \(message)\n".utf8)); exit(1) }
    checks += 1
}
for row in rows {
    let code = row[0] as! String
    let card = CardCode(code)
    expect((card != nil) == (row[1] as! Bool), "valid \(code)")
    guard let card else { continue }
    expect(card.rankIndex == (row[2] as! Int), "rankIndex \(code)")
    expect(card.suitIndex == (row[3] as! Int), "suitIndex \(code)")
    expect(card.isRed == (row[4] as! Bool), "red \(code)")
    expect(card.courtName == (row[5] as? String), "court \(code)")
    expect(card.rankLabel() == (row[6] as! String) || card.isJoker, "label \(code)")
    expect(card.suitGlyph.unicodeScalars.first!.value == UInt32(row[7] as! Int), "glyph \(code)")
}
expect(CardCode(nil) == nil, "nil code")
let french = (fixture["frenchLetters"] as! [String: String]).reduce(into: [Character: String]()) { $0[Character($1.key)] = $1.value }
for (code, label) in fixture["frenchLabels"] as! [String: String] {
    expect(CardCode(code)!.rankLabel(french) == label, "french \(code)")
}
print("\(checks) card code assertions passed")

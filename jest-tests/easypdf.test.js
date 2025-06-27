const EasyCsvPdf = require('../easycsvpdf.js');

test('should retrieve column title when index is given', () => {
    const csvData = "Name,Age,Height\nJohn,32,180\nAlice,29,170";
    const pdf = new EasyCsvPdf(csvData);
    expect(pdf.getColumnTitle(0)).toBe("Name");
});
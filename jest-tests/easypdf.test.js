const EasyCsvPdf = require('../easycsvpdf.js');

test('should retrieve column title when index is given', () => {
    const csvData = "Name,Age,Height\nJohn,32,180\nAlice,29,170";
    const pdf = new EasyCsvPdf(csvData);
    expect(pdf.getColumnTitle(0)).toBe("Name");
});

test('should retrieve error when getColumnTitle index is lower than 0', () => {
    const csvData = "Name,Age,Height\nJohn,32,180\nAlice,29,170";
    const pdf = new EasyCsvPdf(csvData);
    expect(pdf.getColumnTitle(-1)).toBe("[error]: index is lower than valid index");
});

test('should retrieve error when getColumnTitle index is equal to titles length', () => {
    const csvData = "Name,Age,Height\nJohn,32,180\nAlice,29,170";
    const pdf = new EasyCsvPdf(csvData);
    expect(pdf.getColumnTitle(3)).toBe("[error]: index is greather than valid index");
});
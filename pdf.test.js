const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

test('given_two_rows_pdf_contains_title_column_header_and_data', async ({ page }) => {

    // Access to URL
    const filePath = path.resolve(__dirname, 'given_two_rows_pdf_contains_title_column_header_and_data.html');
    const fileUrl = `file://${filePath}`;
    await page.goto(fileUrl);

    // Click Button & Download PDF
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('#generatePdf')
    ])

    const downloadPath = await download.path();
    const dataBuffer = fs.readFileSync(downloadPath);
    const data = await pdf(dataBuffer);

    // Check PDF content only appear once a time
    expect(data.text).toContain('Testing PDF with my machine');
    const countOneTitle = data.text.split('Testing PDF with my machine');
    expect(countOneTitle.length).toBe(2);

    expect(data.text).toContain('Nombre');
    const countOneNombre = data.text.split('Nombre');
    expect(countOneNombre.length).toBe(2);

    expect(data.text).toContain('Mario Bros');
    const countOneMario = data.text.split('Mario Bros');
    expect(countOneMario.length).toBe(2);

    expect(data.text).toContain('Edad');
    const countOneEdad = data.text.split('Edad');
    expect(countOneEdad.length).toBe(2);

    expect(data.text).toContain('150');
    const countOneEdadValue = data.text.split('150');
    expect(countOneEdadValue.length).toBe(2);

    expect(data.text).toContain('Altura');
    const countOneAltura = data.text.split('Altura');
    expect(countOneAltura.length).toBe(2);

    expect(data.text).toContain('300');
    const countOne3Meters = data.text.split('300');
    expect(countOne3Meters.length).toBe(2);
});

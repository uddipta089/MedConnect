import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const generateCSV = (data, fields) => {
  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(data);
};

export const generateExcel = async (data, columns, sheetName = 'Data') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map(col => ({ header: col, key: col }));
  
  data.forEach(item => {
    worksheet.addRow(item);
  });

  return await workbook.xlsx.writeBuffer();
};

export const generatePDF = (data, title, res) => {
  const doc = new PDFDocument();
  doc.pipe(res);
  
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();

  data.forEach((item, i) => {
    doc.fontSize(12).text(`${i + 1}. ${JSON.stringify(item)}`);
    doc.moveDown(0.5);
  });

  doc.end();
};

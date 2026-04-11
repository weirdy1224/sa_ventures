const { Parser } = require('json2csv');

const generateCSV = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (err) {
    console.error('CSV generation error:', err.message);
    return '';
  }
};

module.exports = { generateCSV };

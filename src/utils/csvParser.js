const fs = require('fs').promises;

class CSVParser {
  constructor() {
    this.mandatoryFields = ['name.firstName', 'name.lastName', 'age'];
  }

  async parseCSVFile(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      return this.parseCSVContent(fileContent);
    } catch (error) {
      console.error('Error reading CSV file:', error);
      throw new Error('Failed to read CSV file');
    }
  }

  parseCSVContent(csvContent) {
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least header and one data row');
    }

    const headers = this.parseCSVLine(lines[0]);
    this.validateMandatoryFields(headers);

    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = this.parseCSVLine(lines[i]);
        const record = this.createRecordObject(headers, values);
        records.push(record);
      }
    }

    return records;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  validateMandatoryFields(headers) {
    for (const field of this.mandatoryFields) {
      if (!headers.includes(field)) {
        throw new Error(`Mandatory field '${field}' is missing from CSV headers`);
      }
    }
  }

  createRecordObject(headers, values) {
    if (headers.length !== values.length) {
      throw new Error('Mismatch between number of headers and values');
    }

    const record = {};
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = values[i];
      
      if (header.includes('.')) {
        this.setNestedProperty(record, header, value);
      } else {
        record[header] = this.convertValue(value);
      }
    }
    
    return record;
  }

  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = this.convertValue(value);
  }

  convertValue(value) {
    // Try to convert to number if it's a valid number
    if (!isNaN(value) && !isNaN(parseFloat(value)) && value.trim() !== '') {
      return parseFloat(value);
    }
    
    // Convert boolean strings
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Return as string
    return value;
  }
}

module.exports = CSVParser;
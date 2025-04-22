import axios from 'axios';
import Papa from 'papaparse';

// Google Sheets CSV URL (Replace with your own)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1otFshEgsBOEeCoH6F6TfZdh0K1P6zNXRlbsAA4ZE-VxgzbYfdoSKq5864Wokp-t8UP8143iQF5Xo/pub?output=csv";

export default async function handler(req, res) {
  try {
    // Fetch CSV data from Google Sheets
    const response = await axios.get(CSV_URL);
    const csvData = response.data;
    
    // Parse CSV
    const results = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });
    
    // Transform data to match the expected format
    // Mapping the new Excel structure to our application structure
    const products = results.data.map(row => ({
      name: row['/Company/@name'] || 'Unknown Company',
      description: `${row['/Company/md'] || 'No description available'}`,
      location: row['/Company/postaladdress'] || 'Unknown',
      industry: row['/Company/type'] || 'Uncategorized',
      products: row['/Company/products'] || '',
      website: row['/Company/website'] || '',
      companyDetails: {
        email: row['/Company/email'] || '',
        phone: row['/Company/phone'] || '',
        fax: row['/Company/fax'] || '',
        year: row['/Company/year'] || '',
        employees: row['/Company/noe'] || '',
        contactPerson: row['/Company/cp'] || '',
        contactNumber: row['/Company/cpnumber'] || '',
        plantAddress: row['/Company/plantaddress'] || '',
        plantEmail: row['/Company/plemail'] || '',
        plantPhone: row['/Company/plphone'] || '',
        services: row['/Company/ser'] || '',
        annualProduction: row['/Company/ap'] || '',
        consumption: row['/Company/cons'] || ''
      }
    }));
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

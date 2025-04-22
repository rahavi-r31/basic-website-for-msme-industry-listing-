import axios from 'axios';
import Papa from 'papaparse';

// Google Sheets CSV URL (Replace with your own)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTu0V1mPTPCNDrTtUZ9oab-OYlHRYabOVZOnYd7t2Ruz7rytwZ45ajxkefh5SziH5DpCdpGFtshqqz1/pub?output=csv";

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
    
    // Filter products where 'Listed' column is 'Yes'
    const filteredProducts = results.data.filter(row => row.Listed === 'Yes');
    
    // Transform data to match the expected format
    const products = filteredProducts.map(row => ({
      name: row.Name || 'Unknown Company',
      description: row.Description || 'No description available',
      location: row.Location || 'Unknown',
      industry: row.Industry || 'Uncategorized',
      products: row.Products || '',
      website: row.Website || '',
      logo: row.Logo || null
    }));
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

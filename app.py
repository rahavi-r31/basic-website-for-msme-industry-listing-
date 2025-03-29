from flask import Flask, jsonify, render_template
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Allow frontend to access API

# Google Sheets CSV URL (Replace with your own)
CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTu0V1mPTPCNDrTtUZ9oab-OYlHRYabOVZOnYd7t2Ruz7rytwZ45ajxkefh5SziH5DpCdpGFtshqqz1/pub?output=csv"

def get_products():
    """Fetch products from Google Sheets and filter checked products."""
    try:
        df = pd.read_csv(CSV_URL)
        filtered_products = df[df['Listed'] == 'Yes']  # Filter products where 'Listed' column is 'Yes'
        
        # Transform data to match the expected format for the frontend
        products_list = []
        for _, row in filtered_products.iterrows():
            product = {
                'name': row.get('Name', 'Unknown Company'),
                'description': row.get('Description', 'No description available'),
                'location': row.get('Location', 'Unknown'),
                'industry': row.get('Industry', 'Uncategorized'),
                'products': row.get('Products', ''),
                'website': row.get('Website', '')
            }
            
            # Add logo if available
            if 'Logo' in row and pd.notna(row['Logo']):
                product['logo'] = row['Logo']
                
            products_list.append(product)
            
        return products_list
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []

@app.route("/")
def home():
    return render_template("xyz-search-website.html")  # Serve frontend

@app.route("/api/products")
def products():
    return jsonify(get_products())  # Serve product list as JSON

if __name__ == "__main__":
    app.run(debug=True)
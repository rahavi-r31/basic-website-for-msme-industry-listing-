# app.py
from flask import Flask, jsonify, render_template
import requests
import pandas as pd
import io
import os
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Google Sheets CSV URL
CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1otFshEgsBOEeCoH6F6TfZdh0K1P6zNXRlbsAA4ZE-VxgzbYfdoSKq5864Wokp-t8UP8143iQF5Xo/pub?output=csv"

# Cache mechanism
cache = {
    "data": None,
    "timestamp": 0
}
CACHE_DURATION = 3600  # Cache for 1 hour (in seconds)

def fetch_and_process_csv():
    # Check if cache is valid
    current_time = time.time()
    if cache["data"] is not None and (current_time - cache["timestamp"]) < CACHE_DURATION:
        return cache["data"]
    
    # Fetch data if cache is invalid
    response = requests.get(CSV_URL)
    
    if response.status_code != 200:
        return []
    
    # Parse CSV
    csv_data = response.content.decode('utf-8')
    df = pd.read_csv(io.StringIO(csv_data))
    
    # Transform data to match the expected format
    products = []
    for _, row in df.iterrows():
        product = {
            "name": row.get('/Company/@name', 'Unknown Company'),
            "description": row.get('/Company/md', 'No description available'),
            "location": row.get('/Company/postaladdress', 'Unknown'),
            "industry": row.get('/Company/type', 'Uncategorized'),
            "products": row.get('/Company/products', ''),
            "website": row.get('/Company/website', ''),
            "companyDetails": {
                "email": row.get('/Company/email', ''),
                "phone": row.get('/Company/phone', ''),
                "fax": row.get('/Company/fax', ''),
                "year": row.get('/Company/year', ''),
                "employees": row.get('/Company/noe', ''),
                "contactPerson": row.get('/Company/cp', ''),
                "contactNumber": row.get('/Company/cpnumber', ''),
                "plantAddress": row.get('/Company/plantaddress', ''),
                "plantEmail": row.get('/Company/plemail', ''),
                "plantPhone": row.get('/Company/plphone', ''),
                "services": row.get('/Company/ser', ''),
                "annualProduction": row.get('/Company/ap', ''),
                "consumption": row.get('/Company/cons', '')
            }
        }
        products.append(product)
    
    # Update cache
    cache["data"] = products
    cache["timestamp"] = current_time
    
    return products

@app.route('/api/products')
def get_products():
    try:
        products = fetch_and_process_csv()
        return jsonify(products)
    except Exception as e:
        print(f"Error fetching products: {e}")
        return jsonify({"error": "Failed to fetch products"}), 500

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)

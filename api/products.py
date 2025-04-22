# api/products.py
from http.server import BaseHTTPRequestHandler
import requests
import pandas as pd
import json
import io
import time
from urllib.parse import parse_qs

# Google Sheets CSV URL
CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1otFshEgsBOEeCoH6F6TfZdh0K1P6zNXRlbsAA4ZE-VxgzbYfdoSKq5864Wokp-t8UP8143iQF5Xo/pub?output=csv"

# Simplified cache (note: this will reset on each cold start)
cached_data = None
cache_timestamp = 0
CACHE_DURATION = 3600  # 1 hour in seconds

def fetch_and_process_csv():
    global cached_data, cache_timestamp
    
    # Check if cache is valid
    current_time = time.time()
    if cached_data is not None and (current_time - cache_timestamp) < CACHE_DURATION:
        return cached_data
    
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
        # Handle potential missing columns with get() method
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
    cached_data = products
    cache_timestamp = current_time
    
    return products

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            products = fetch_and_process_csv()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(products).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_message = {"error": str(e)}
            self.wfile.write(json.dumps(error_message).encode())

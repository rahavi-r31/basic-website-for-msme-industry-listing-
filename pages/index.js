import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

// Extract unique industries from the data
function extractIndustries(products) {
  const uniqueIndustries = new Set();
  products.forEach(product => {
    if (product.industry) {
      uniqueIndustries.add(product.industry);
    }
  });
  return Array.from(uniqueIndustries).sort();
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState([]);
  const [expandedCompany, setExpandedCompany] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
        setIndustries(extractIndustries(data));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Toggle industry selection
  const toggleIndustry = (industry) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  // Filter products based on search criteria
  const handleSearch = () => {
    const filtered = products.filter(product => {
      // Keyword filter - search across multiple fields
      const searchFields = [
        product.name,
        product.description,
        product.products,
        product.industry,
        product.location,
        product.companyDetails?.email,
        product.companyDetails?.services
      ].filter(Boolean);
      
      const keywordMatch = !keyword || 
        searchFields.some(field => 
          field.toLowerCase().includes(keyword.toLowerCase())
        );
      
      // Location filter - partial match on location
      const locationMatch = !location || 
        product.location.toLowerCase().includes(location.toLowerCase());
      
      // Industry filter
      const industryMatch = selectedIndustries.length === 0 || 
        selectedIndustries.includes(product.industry);
      
      return keywordMatch && locationMatch && industryMatch;
    });
    
    setFilteredProducts(filtered);
  };

  // Reset search form
  const handleReset = () => {
    setKeyword('');
    setLocation('');
    setSelectedIndustries([]);
    setFilteredProducts(products);
  };

  // Toggle company details expansion
  const toggleCompanyDetails = (index) => {
    if (expandedCompany === index) {
      setExpandedCompany(null);
    } else {
      setExpandedCompany(index);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>XYZ - Company Search</title>
        <meta name="description" content="XYZ Company Search Portal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <h1>XYZ - Company Search</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.searchPanel}>
          <div className={styles.searchTitle}>Search Conditions</div>
          <div className={styles.searchForm}>
            <div className={styles.formGroup}>
              <label htmlFor="keyword">Keyword</label>
              <input 
                type="text" 
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter company name, products, etc."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <input 
                type="text" 
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location or address"
              />
            </div>
            
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Industry Type</label>
              <div className={styles.industrySelector}>
                <div className={styles.checkboxGroup}>
                  {industries.map((industry, index) => (
                    <div key={index} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        id={`industry-${index}`}
                        checked={selectedIndustries.includes(industry)}
                        onChange={() => toggleIndustry(industry)}
                      />
                      <label htmlFor={`industry-${index}`}>{industry}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.btnGroup}>
            <button onClick={handleSearch} className={`${styles.btn} ${styles.btnPrimary}`}>
              Search
            </button>
            <button onClick={handleReset} className={`${styles.btn} ${styles.btnSecondary}`}>
              Reset
            </button>
          </div>
        </div>
        
        <div className={styles.resultsPanel}>
          <div className={styles.resultsTitle}>
            <span>Search Results</span>
            <span className={styles.resultCount}>
              {filteredProducts.length} results
            </span>
          </div>
          
          {loading ? (
            <div className={styles.loading}>Loading results...</div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.noResults}>No matching companies found.</div>
          ) : (
            filteredProducts.map((product, index) => (
              <div key={index} className={styles.resultItem}>
                <div className={styles.companyInfo}>
                  <h3>{product.name}</h3>
                  <div className={styles.companyMeta}>
                    <span className={styles.companyTag}>{product.industry}</span>
                    {product.companyDetails?.year && (
                      <span className={styles.companyTag}>Est. {product.companyDetails.year}</span>
                    )}
                  </div>
                  
                  <p className={styles.companyDescription}>{product.description}</p>
                  
                  {product.products && (
                    <div className={styles.productsSection}>
                      <strong>Products:</strong> {product.products}
                    </div>
                  )}
                  
                  <div className={styles.contactRow}>
                    {product.companyDetails?.email && (
                      <div className={styles.contactItem}>
                        <strong>Email:</strong> {product.companyDetails.email}
                      </div>
                    )}
                    {product.companyDetails?.phone && (
                      <div className={styles.contactItem}>
                        <strong>Phone:</strong> {product.companyDetails.phone}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.addressSection}>
                    <strong>Address:</strong> {product.location}
                  </div>
                  
                  <div className={styles.actionRow}>
                    {product.website && (
                      <a 
                        href={product.website}
                        className={styles.companyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Website
                      </a>
                    )}
                    <button 
                      className={styles.detailsToggle}
                      onClick={() => toggleCompanyDetails(index)}
                    >
                      {expandedCompany === index ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                  
                  {expandedCompany === index && (
                    <div className={styles.expandedDetails}>
                      <h4>Company Details</h4>
                      <div className={styles.detailsGrid}>
                        {product.companyDetails?.contactPerson && (
                          <div className={styles.detailItem}>
                            <strong>Contact Person:</strong> {product.companyDetails.contactPerson}
                          </div>
                        )}
                        {product.companyDetails?.contactNumber && (
                          <div className={styles.detailItem}>
                            <strong>Contact Number:</strong> {product.companyDetails.contactNumber}
                          </div>
                        )}
                        {product.companyDetails?.fax && (
                          <div className={styles.detailItem}>
                            <strong>Fax:</strong> {product.companyDetails.fax}
                          </div>
                        )}
                        {product.companyDetails?.employees && (
                          <div className={styles.detailItem}>
                            <strong>Employees:</strong> {product.companyDetails.employees}
                          </div>
                        )}
                        {product.companyDetails?.annualProduction && (
                          <div className={styles.detailItem}>
                            <strong>Annual Production:</strong> {product.companyDetails.annualProduction}
                          </div>
                        )}
                        {product.companyDetails?.consumption && (
                          <div className={styles.detailItem}>
                            <strong>Consumption:</strong> {product.companyDetails.consumption}
                          </div>
                        )}
                      </div>
                      
                      {product.companyDetails?.plantAddress && (
                        <div className={styles.plantSection}>
                          <h4>Plant Information</h4>
                          <div><strong>Address:</strong> {product.companyDetails.plantAddress}</div>
                          {product.companyDetails?.plantPhone && (
                            <div><strong>Phone:</strong> {product.companyDetails.plantPhone}</div>
                          )}
                          {product.companyDetails?.plantEmail && (
                            <div><strong>Email:</strong> {product.companyDetails.plantEmail}</div>
                          )}
                        </div>
                      )}
                      
                      {product.companyDetails?.services && (
                        <div className={styles.servicesSection}>
                          <h4>Services</h4>
                          <div>{product.companyDetails.services}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

// Industry list - This can be customized
const industries = [
  "Agriculture & Forestry",
  "Food Manufacturing",
  "Textiles & Apparel",
  "Wood & Paper Products",
  "Chemicals & Materials",
  "Pharmaceuticals",
  "Petroleum & Coal Products",
  "Rubber & Plastic Products",
  "Ceramics & Glass",
  "Steel & Metal Products",
  "Machinery & Equipment",
  "Electronics & Components",
  "Transportation Equipment",
  "Precision Instruments",
  "Other Manufacturing",
  "Information Technology",
  "Biotechnology",
  "Environmental Technology",
  "Energy & Resources",
  "Construction & Real Estate"
];

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Keyword filter
      const keywordMatch = !keyword || 
        product.name.toLowerCase().includes(keyword.toLowerCase()) || 
        product.description.toLowerCase().includes(keyword.toLowerCase()) ||
        (product.products && product.products.toLowerCase().includes(keyword.toLowerCase()));
      
      // Location filter
      const locationMatch = !location || product.location === location;
      
      // Industry filter
      const industryMatch = selectedIndustries.length === 0 || 
        selectedIndustries.some(industry => product.industry.includes(industry));
      
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
              <select 
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="Tokyo">Tokyo</option>
                <option value="Osaka">Osaka</option>
                <option value="Fukuoka">Fukuoka</option>
                <option value="Hokkaido">Hokkaido</option>
                <option value="Kyoto">Kyoto</option>
              </select>
            </div>
            
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Industry</label>
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
                <div className={styles.companyLogo}>
                  {product.logo ? (
                    <img 
                      src={product.logo} 
                      alt={`${product.name} logo`}
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  ) : (
                    product.name.charAt(0)
                  )}
                </div>
                <div className={styles.companyInfo}>
                  <h3>{product.name}</h3>
                  <div className={styles.companyMeta}>
                    <span className={styles.companyTag}>{product.location}</span>
                    <span className={styles.companyTag}>{product.industry}</span>
                  </div>
                  <p className={styles.companyDescription}>{product.description}</p>
                  {product.website && (
                    <a 
                      href={product.website}
                      className={styles.companyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Details →
                    </a>
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

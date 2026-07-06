import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../components/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const { addToCart } = useCart();
    const [addedId, setAddedId] = useState(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    const handleAddToCart = (product) => {
        const userStr = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert("Please login to add items to your cart.");
            navigate('/login');
            return;
        }
        addToCart(product);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/products');
                setProducts(response.data);
                applyFilters(response.data, selectedCategories, searchQuery);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please ensure the backend is running.");
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Re-filter and scroll when products, categories, or search query changes
    useEffect(() => {
        if (products.length > 0) {
            applyFilters(products, selectedCategories, searchQuery);
            
            // If there's a search query, scroll to products section
            if (searchQuery) {
                const productsSection = document.getElementById('products-section');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }, [selectedCategories, searchQuery, products]);

    const applyFilters = (allProducts, categories, query) => {
        let filtered = [...allProducts];
        
        // Category Filter
        if (categories && categories.length > 0) {
            filtered = filtered.filter(p => p.category && categories.includes(p.category.toLowerCase()));
        }
        
        // Search Filter (Improved with multi-word support)
        if (query) {
            const searchWords = query.toLowerCase().trim().split(/\s+/);
            filtered = filtered.filter(p => {
                const searchableText = [
                    p.name,
                    p.brand,
                    p.description,
                    p.category
                ].filter(Boolean).join(' ').toLowerCase();

                // All words in the search query must be present in the searchable text
                return searchWords.every(word => searchableText.includes(word));
            });
        }
        
        setFilteredProducts(filtered);
    };

    const handleCategoryChange = (category) => {
        let updatedCategories = [...selectedCategories];
        if (category === 'all') {
            updatedCategories = [];
        } else if (updatedCategories.includes(category)) {
            updatedCategories = updatedCategories.filter(c => c !== category);
        } else {
            updatedCategories.push(category);
        }
        setSelectedCategories(updatedCategories);
    };

    const isLoggedIn = !!sessionStorage.getItem('token');

    const handleShopNow = () => {
        if (!isLoggedIn) {
            navigate('/login');
        } else {
            const productsSection = document.getElementById('products-section');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <>
           <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <span className="hero-badge">New Collection 2026</span>
                        <h1>Discover Your <br/><span style={{color: "var(--secondary-color)"}}>Perfect Style</span></h1>
                        <p>Explore our curated collection of premium products. Quality meets affordability in every piece we offer.</p>
                        <div className="hero-buttons">
                            <button className="cta-btn primary" onClick={handleShopNow}>
                                Shop Now <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                        {isLoggedIn && (
                            <div className="hero-stats">
                                <div className="stat-item">
                                    <span className="stat-number">50K+</span>
                                    <span className="stat-label">Happy Customers</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{products.length > 0 ? products.length : '10K'}+</span>
                                    <span className="stat-label">Products</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">4.9</span>
                                    <span className="stat-label">Rating</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="hero-image">
                        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=600&fit=crop&q=80" alt="Fashion Collection" className="hero-img-main" />
                        <div className="floating-card floating-card-1">
                            <i className="fas fa-truck"></i>
                            <span>Free Shipping</span>
                        </div>
                        <div className="floating-card floating-card-2">
                            <i className="fas fa-shield-alt"></i>
                            <span>Secure Payment</span>
                        </div>
                    </div>
                </div>
           </section>

           {isLoggedIn && (
               <>
                   <section id="feature" className="section-p1">
                        <div className="fe-box">
                            <i className="fas fa-truck"></i>
                            <h6>Free Shipping</h6>
                        </div>
                        <div className="fe-box">
                            <i className="fas fa-shopping-cart"></i>
                            <h6>Online Order</h6>
                        </div>
                        <div className="fe-box">
                            <i className="fas fa-piggy-bank"></i>
                            <h6>Save Money</h6>
                        </div>
                        <div className="fe-box">
                            <i className="fas fa-tags"></i>
                            <h6>Promotion</h6>
                        </div>
                        <div className="fe-box">
                            <i className="fas fa-smile"></i>
                            <h6>Happy Sell</h6>
                        </div>
                        <div className="fe-box">
                            <i className="fas fa-headset"></i>
                            <h6>24/7 Support</h6>
                        </div>
                   </section>

                   <section className="products-section" id="products-section">
                        <div className="container">
                            <div className="section-header">
                                <h2>Featured Products</h2>
                                {searchQuery ? (
                                    <div className="search-meta">
                                        <p>Showing results for: <strong>"{searchQuery}"</strong></p>
                                        <button className="clear-search-btn" onClick={() => navigate('/')}>
                                            <i className="fas fa-times"></i> Clear Search
                                        </button>
                                    </div>
                                ) : (
                                    <p>Explore our latest arrivals</p>
                                )}
                            </div>
                            
                            <div className="products-layout">
                                <aside className="sidebar">
                                    <div className="filter-group">
                                        <h3>Categories</h3>
                                        <div className="filter-options">
                                            <label className="filter-option">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedCategories.length === 0} 
                                                    onChange={() => handleCategoryChange('all')}
                                                />
                                                <span>All Categories</span>
                                            </label>
                                            <label className="filter-option">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedCategories.includes('clothing')} 
                                                    onChange={() => handleCategoryChange('clothing')}
                                                />
                                                <span>Clothing</span>
                                            </label>
                                            <label className="filter-option">
                                                 <input 
                                                     type="checkbox" 
                                                     checked={selectedCategories.includes('electronics')} 
                                                     onChange={() => handleCategoryChange('electronics')}
                                                 />
                                                 <span>Electronics</span>
                                             </label>
                                             <label className="filter-option">
                                                 <input 
                                                     type="checkbox" 
                                                     checked={selectedCategories.includes('footwear')} 
                                                     onChange={() => handleCategoryChange('footwear')}
                                                 />
                                                 <span>Footwear</span>
                                             </label>
                                        </div>
                                    </div>
                                </aside>
                                
                                <div className="product-grid-container">
                                    {loading ? (
                                        <div className="loading-container">
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <p>Loading products...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="error-container">
                                            <p>{error}</p>
                                        </div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="no-products">
                                            <p>No products found in this category.</p>
                                        </div>
                                    ) : (
                                        <div className="product-grid">
                                            {filteredProducts.map(product => (
                                                <div className="product-card" key={product.id}>
                                                    <div className="product-image">
                                                        <img 
                                                            src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&q=80"} 
                                                            alt={product.name}
                                                        />
                                                        <div className="quick-view">Quick View</div>
                                                    </div>
                                                    <div className="product-info">
                                                        <div className="product-brand">{product.brand}</div>
                                                        <div className="product-name">{product.name}</div>
                                                        <div className="product-rating">
                                                            {[0, 1, 2, 3, 4].map((i) => (
                                                                <i key={i} className={i < (product.rating || 0) ? "fas fa-star" : "far fa-star"}></i>
                                                            ))}
                                                        </div>
                                                        <div className="product-price">₹{product.price}</div>
                                                        <div className="product-actions">
                                                            <button 
                                                                className={`btn ${addedId === product.id ? 'btn-success' : 'btn-primary'}`}
                                                                onClick={() => handleAddToCart(product)}
                                                            >
                                                                <i className={addedId === product.id ? "fas fa-check" : "fas fa-shopping-cart"}></i>
                                                                {addedId === product.id ? ' Added' : ' Add to Cart'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                   </section>

                   <section className="newsletter">
                        <div className="container">
                            <div className="newsletter-content">
                                <h3>Subscribe to our Newsletter</h3>
                                <p>Get updates on new arrivals and exclusive offers</p>
                                <div className="newsletter-form">
                                    <input type="email" placeholder="Enter your email" />
                                    <button>Subscribe</button>
                                </div>
                            </div>
                        </div>
                   </section>
               </>
           )}
        </>
    );
};

export default Home;

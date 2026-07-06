import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';

const Header = () => {
    const [user, setUser] = useState(null);
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
        window.location.reload();
    };

    // Show elements only if user is logged in
    const isLoggedIn = !!user;

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/');
        }
    };

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="logo">
                    <i className="fas fa-shopping-bag"></i>
                    <span>ShopHub</span>
                </Link>
                
                {isLoggedIn && (
                    <form className="search-bar" onSubmit={handleSearch}>
                        <input 
                            type="text" 
                            id="search-input" 
                            placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="search-btn"><i className="fas fa-search"></i></button>
                    </form>
                )}
                
                <nav className="nav">
                    <ul className="nav-menu">
                        {isLoggedIn && <li><Link to="/">Home</Link></li>}
                        {isLoggedIn && user.role === 'ROLE_ADMIN' && (
                            <li><Link to="/admin" className="admin-link">
                                <i className="fas fa-user-shield"></i> Admin
                            </Link></li>
                        )}
                        <li><Link to="/tracking" className="track-link">
                            <i className="fas fa-truck"></i> Track
                        </Link></li>
                        {isLoggedIn && (
                            <li><Link to="/cart" className="cart-link">
                                <i className="fas fa-shopping-cart"></i>
                                <span className="cart-count" id="cart-count">{cartCount}</span>
                            </Link></li>
                        )}
                        {isLoggedIn ? (
                            <>
                                <li><Link to="/orders">My Orders</Link></li>
                                <li><a href="#!" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout-btn">Logout</a></li>
                            </>
                        ) : (
                            <li><Link to="/login" id="login-link">Login / Sign Up</Link></li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;

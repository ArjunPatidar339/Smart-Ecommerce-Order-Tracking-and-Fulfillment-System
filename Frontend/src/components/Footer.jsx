import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-section">
                    <div className="footer-logo">
                        <i className="fas fa-shopping-bag"></i>
                        <span>ShopHub</span>
                    </div>
                    <p>Your one-stop destination for quality products at great prices.</p>
                    <div className="social-links">
                        <a href="#"><i className="fab fa-facebook"></i></a>
                        <a href="#"><i className="fab fa-twitter"></i></a>
                        <a href="#"><i className="fab fa-instagram"></i></a>
                        <a href="#"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>
                
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <Link to="/">Home</Link>
                    {sessionStorage.getItem('token') && <Link to="/cart">Cart</Link>}
                    <Link to="/tracking">Track Order</Link>
                    {!sessionStorage.getItem('token') && <Link to="/login">Login / Sign Up</Link>}
                </div>
                
                <div className="footer-section">
                    <h4>Customer Service</h4>
                    <a href="#">Contact Us</a>
                    <a href="#">Shipping Policy</a>
                    <a href="#">Returns & Exchanges</a>
                    <a href="#">FAQ</a>
                </div>
                
                <div className="footer-section">
                    <h4>Contact Info</h4>
                    <p><i className="fas fa-map-marker-alt"></i> 106, Indrapuri Colony, Bhanwarkua, Indore, Madhya Pradesh, India</p>
                    <p><i className="fas fa-phone"></i> +1 234 567 890</p>
                    <p><i className="fas fa-envelope"></i> info@shophub.com</p>
                </div>
            </div>
            <div className="copyright">
                <p>&copy; 2024 ShopHub. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

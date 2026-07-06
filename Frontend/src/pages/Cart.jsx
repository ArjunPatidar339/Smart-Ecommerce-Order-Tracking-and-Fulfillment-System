import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (cart.length === 0) return;
        navigate('/checkout');
    };

    if (cart.length === 0) {
        return (
            <div className="empty-cart-container container section-p1">
                <div className="empty-cart-content">
                    <div className="empty-cart-icon">
                        <i className="fas fa-shopping-basket"></i>
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything to your cart yet. Explore our collection and find something you love!</p>
                    <Link to="/" className="cta-btn primary">
                        <i className="fas fa-arrow-left"></i> Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <section className="cart-page section-p1">
            <div className="container">
                <div className="section-header">
                    <h2>Your Shopping Cart</h2>
                    <p>Review your items before proceeding to checkout</p>
                </div>

                <div className="cart-layout">
                    <div className="cart-items-container">
                        <table className="cart-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(item => (
                                    <tr key={item.id} className="cart-item-row">
                                        <td>
                                            <div className="cart-product-info">
                                                <img src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop&q=80"} alt={item.name} />
                                                <div>
                                                    <h4>{item.name}</h4>
                                                    <p>{item.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>₹{item.price}</td>
                                        <td>
                                            <div className="quantity-control">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                    <i className="fas fa-minus"></i>
                                                </button>
                                                <input type="number" value={item.quantity} readOnly />
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td>₹{item.price * item.quantity}</td>
                                        <td>
                                            <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="cart-actions">
                            <Link to="/" className="continue-shopping">
                                <i className="fas fa-long-arrow-alt-left"></i> Continue Shopping
                            </Link>
                        </div>
                    </div>

                    <aside className="cart-summary-sidebar">
                        <div className="summary-card">
                            <h3>Order Summary</h3>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span className="free-shipping">Free</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax</span>
                                    <span>₹0</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                            </div>
                            <button className="checkout-btn" onClick={handleCheckout}>
                                Proceed to Checkout <i className="fas fa-arrow-right"></i>
                            </button>
                            <div className="secure-payment-info">
                                <i className="fas fa-lock"></i> Secure Payment Guaranteed
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default Cart;

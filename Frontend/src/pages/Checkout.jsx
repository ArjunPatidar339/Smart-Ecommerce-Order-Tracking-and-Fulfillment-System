import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../components/CartContext';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [shippingDetails, setShippingDetails] = useState({
        street: '',
        city: '',
        pincode: '',
        phone: ''
    });

    // Fix: Redirect in useEffect, NOT during render
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    const handleInputChange = (e) => {
        setShippingDetails({
            ...shippingDetails,
            [e.target.name]: e.target.value
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        const userStr = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        
        if (!userStr || !token) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStr);
        setLoading(true);
        setError(null);

        try {
            // 1. Prepare order payload
            const orderPayload = {
                userId: user.userId,
                shippingAddress: `${shippingDetails.street}, ${shippingDetails.city} - ${shippingDetails.pincode}`,
                shippingPhone: shippingDetails.phone,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            // 2. Call backend to place order
            const response = await axios.post('http://localhost:8080/api/orders', orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3. Clear cart and redirect to success or order history
            clearCart();
            alert('Order placed successfully! Order ID: ' + response.data.id);
            navigate('/orders');
        } catch (err) {
            console.error("Order placement failed:", err);
            setError(err.response?.data?.message || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) return null;

    return (
        <section className="checkout-section">
            <div className="container">
                <h1>Checkout</h1>
                <form className="checkout-form" onSubmit={handlePlaceOrder}>
                    <div className="checkout-layout">
                        <div className="shipping-info">
                            <h3>Shipping Information</h3>
                            {error && <div className="error-message">{error}</div>}
                            <div className="form-group">
                                <label>Street Address</label>
                                <input type="text" name="street" required value={shippingDetails.street} onChange={handleInputChange} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" name="city" required value={shippingDetails.city} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Pincode</label>
                                    <input type="text" name="pincode" required value={shippingDetails.pincode} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" required value={shippingDetails.phone} onChange={handleInputChange} />
                            </div>
                            
                            <div className="payment-info">
                                <h3>Payment Method</h3>
                                <div className="payment-option selected">
                                    <input type="radio" checked readOnly />
                                    <span>Cash on Delivery (COD)</span>
                                </div>
                            </div>
                        </div>

                        <aside className="order-summary">
                            <h3>Your Order</h3>
                            <div className="summary-items">
                                {cart.map(item => (
                                    <div className="summary-item" key={item.id}>
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="summary-total">
                                <span>Total to Pay</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <button type="submit" className="place-order-btn" disabled={loading}>
                                {loading ? 'Placing Order...' : 'Confirm Order'}
                            </button>
                        </aside>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Checkout;

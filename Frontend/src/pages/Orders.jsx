import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import usePolling from '../hooks/usePolling';

const STATUS_META = {
    PENDING:          { label: 'Processing',       color: '#6366f1', icon: 'fas fa-clock', bg: '#eef2ff' },
    CONFIRMED:        { label: 'Confirmed',         color: '#0ea5e9', icon: 'fas fa-check-circle', bg: '#e0f2fe' },
    PACKED:           { label: 'Packed',            color: '#8b5cf6', icon: 'fas fa-box', bg: '#f3e8ff' },
    SHIPPED:          { label: 'Shipped',           color: '#f59e0b', icon: 'fas fa-shipping-fast', bg: '#fef3c7' },
    IN_TRANSIT:       { label: 'In Transit',        color: '#f59e0b', icon: 'fas fa-truck-moving', bg: '#fef3c7' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery',  color: '#10b981', icon: 'fas fa-truck', bg: '#d1fae5' },
    DELIVERED:        { label: 'Delivered',         color: '#22c55e', icon: 'fas fa-check-circle', bg: '#dcfce7' },
    CANCELLED:        { label: 'Cancelled',         color: '#ef4444', icon: 'fas fa-ban', bg: '#fee2e2' },
    RETURNED:         { label: 'Returned',          color: '#f97316', icon: 'fas fa-undo-alt', bg: '#ffedd5' },
};

const getProgress = (status) => {
    const map = {
        PENDING: 10, CONFIRMED: 10, PACKED: 28, SHIPPED: 50,
        IN_TRANSIT: 65, OUT_FOR_DELIVERY: 82, DELIVERED: 100,
        CANCELLED: 0, RETURNED: 0,
    };
    return map[status] ?? 10;
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        const userStr = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        if (!userStr || !token) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);
        try {
            const response = await axios.get(
                `http://localhost:8080/api/orders/user?userId=${user.userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(response.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Unable to load your orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    usePolling(fetchOrders, 5000, []);

    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <div className="orders-loading-spinner">
                    <i className="fas fa-circle-notch fa-spin"></i>
                </div>
                <p>Loading your orders…</p>
            </div>
        );
    }

    return (
        <section className="my-orders-page">
            <div className="container">
                {/* Page Header */}
                <div className="mo-page-header">
                    <div className="mo-header-left">
                        <h1><i className="fas fa-shopping-bag"></i> My Orders</h1>
                        <p>Track and manage all your orders in one place</p>
                    </div>
                    {orders.length > 0 && (
                        <div className="mo-summary-chips">
                            <div className="mo-chip">
                                <span>{orders.length}</span> Total
                            </div>
                            <div className="mo-chip delivered">
                                <span>{orders.filter(o => o.status === 'DELIVERED').length}</span> Delivered
                            </div>
                            <div className="mo-chip active">
                                <span>{orders.filter(o => !['DELIVERED','CANCELLED','RETURNED'].includes(o.status)).length}</span> Active
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mo-error">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}

                {orders.length === 0 && !error ? (
                    <div className="mo-empty">
                        <div className="mo-empty-icon">
                            <i className="fas fa-box-open"></i>
                        </div>
                        <h2>No orders yet</h2>
                        <p>Looks like you haven't placed any orders. Start shopping now!</p>
                        <Link to="/" className="btn btn-primary">
                            <i className="fas fa-shopping-cart"></i> Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="mo-orders-list">
                        {orders.map((order) => {
                            const meta = STATUS_META[order.status] || STATUS_META['PENDING'];
                            const progress = getProgress(order.status);
                            const isExpanded = expandedId === order.id;
                            const isDelivered = order.status === 'DELIVERED';
                            const isCancelled = ['CANCELLED', 'RETURNED'].includes(order.status);

                            return (
                                <div
                                    key={order.id}
                                    className={`mo-order-card ${isExpanded ? 'expanded' : ''} ${isDelivered ? 'delivered' : ''} ${isCancelled ? 'cancelled' : ''}`}
                                >
                                    {/* Card Header Row */}
                                    <div className="mo-card-header" onClick={() => toggleExpand(order.id)}>
                                        <div className="mo-card-left">
                                            <div className="mo-order-id">
                                                <i className="fas fa-receipt"></i>
                                                Order <strong>#{order.id}</strong>
                                            </div>
                                            <div className="mo-order-date">
                                                <i className="far fa-calendar-alt"></i>
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </div>

                                        <div className="mo-card-center">
                                            {!isCancelled && (
                                                <div className="mo-mini-progress">
                                                    <div
                                                        className="mo-mini-fill"
                                                        style={{ width: `${progress}%`, background: meta.color }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mo-card-right">
                                            <div
                                                className="mo-status-badge"
                                                style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.color}33` }}
                                            >
                                                <i className={meta.icon}></i>
                                                {meta.label}
                                            </div>
                                            <div className="mo-amount">₹{Number(order.totalAmount).toLocaleString('en-IN')}</div>
                                            <button className="mo-expand-btn">
                                                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="mo-card-body">
                                            {/* Address */}
                                            <div className="mo-address-row">
                                                <div className="mo-address-block">
                                                    <i className="fas fa-map-marker-alt" style={{ color: meta.color }}></i>
                                                    <div>
                                                        <span>{isDelivered ? '✅ Delivered To' : 'Shipping To'}</span>
                                                        <strong>{order.shippingAddress}</strong>
                                                        {order.shippingPhone && (
                                                            <small><i className="fas fa-phone-alt"></i> {order.shippingPhone}</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div className="mo-items-section">
                                                <h4><i className="fas fa-boxes"></i> Items Ordered</h4>
                                                <div className="mo-items-list">
                                                    {order.items && order.items.map((item, idx) => (
                                                        <div className="mo-item-row" key={idx}>
                                                            <div className="mo-item-icon">
                                                                <i className="fas fa-cube"></i>
                                                            </div>
                                                            <div className="mo-item-name">{item.productName}</div>
                                                            <div className="mo-item-qty">Qty: <strong>{item.quantity}</strong></div>
                                                            <div className="mo-item-price">₹{Number(item.priceAtPurchase).toLocaleString('en-IN')}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mo-order-total-row">
                                                    <span>Order Total</span>
                                                    <strong>₹{Number(order.totalAmount).toLocaleString('en-IN')}</strong>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mo-actions">
                                                {!isCancelled && (
                                                    <Link
                                                        to={`/tracking?orderId=${order.id}&phone=${order.shippingPhone}`}
                                                        className="mo-action-btn primary"
                                                    >
                                                        <i className="fas fa-satellite-dish"></i> Track Shipment
                                                    </Link>
                                                )}
                                                <button className="mo-action-btn secondary" onClick={() => toggleExpand(order.id)}>
                                                    <i className="fas fa-chevron-up"></i> Collapse
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Orders;

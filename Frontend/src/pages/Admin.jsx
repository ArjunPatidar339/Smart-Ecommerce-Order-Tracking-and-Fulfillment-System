import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import usePolling from '../hooks/usePolling';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats]         = useState(null);
    const [orders, setOrders]       = useState([]);
    const [products, setProducts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    // stockEdits: { [productId]: newQty }
    const [stockEdits, setStockEdits] = useState({});
    const [stockSaving, setStockSaving] = useState({});
    const [stockMsg, setStockMsg]     = useState({});
    const navigate    = useNavigate();
    const isFirstLoad = useRef(true);

    // ── Auth guard ──
    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        const token   = sessionStorage.getItem('token');
        if (!userStr || !token) { navigate('/login'); return; }
        const user = JSON.parse(userStr);
        if (user.role !== 'ROLE_ADMIN') { navigate('/'); return; }
    }, [navigate]);

    // Reset first-load flag when tab changes
    useEffect(() => {
        isFirstLoad.current = true;
        setLoading(true);
    }, [activeTab]);

    // ── Stable fetch (useCallback keeps reference stable across renders) ──
    const fetchData = useCallback(async () => {
        const token = sessionStorage.getItem('token');
        if (isFirstLoad.current) setLoading(true);

        try {
            if (activeTab === 'dashboard') {
                const res = await axios.get('http://localhost:8080/api/admin/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);

            } else if (activeTab === 'orders') {
                const res = await axios.get('http://localhost:8080/api/admin/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);

            } else if (activeTab === 'products') {
                // GET /api/products is public — no auth header needed
                const res = await axios.get('http://localhost:8080/api/products');
                setProducts(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
            isFirstLoad.current = false;
        }
    }, [activeTab]);

    // Silent background poll every 10 s
    usePolling(fetchData, 10000, [fetchData]);

    // ── Order status update ──
    const handleUpdateStatus = async (orderId, newStatus) => {
        const token = sessionStorage.getItem('token');
        try {
            await axios.put(
                `http://localhost:8080/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    // ── Stock update ──
    const handleStockChange = (productId, value) => {
        setStockEdits(prev => ({ ...prev, [productId]: value }));
    };

    const handleSaveStock = async (productId) => {
        const token    = sessionStorage.getItem('token');
        const newQty   = parseInt(stockEdits[productId], 10);
        if (isNaN(newQty) || newQty < 0) {
            setStockMsg(prev => ({ ...prev, [productId]: { type: 'error', text: 'Invalid quantity' } }));
            return;
        }
        setStockSaving(prev => ({ ...prev, [productId]: true }));
        try {
            await axios.put(
                'http://localhost:8080/api/inventory/update',
                { productId, quantity: newQty },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Optimistically update the local product list
            setProducts(prev =>
                prev.map(p => p.id === productId ? { ...p, stock: newQty } : p)
            );
            setStockMsg(prev => ({ ...prev, [productId]: { type: 'success', text: 'Saved!' } }));
            setStockEdits(prev => { const c = { ...prev }; delete c[productId]; return c; });
            setTimeout(() =>
                setStockMsg(prev => { const c = { ...prev }; delete c[productId]; return c; })
            , 2000);
        } catch (err) {
            setStockMsg(prev => ({ ...prev, [productId]: { type: 'error', text: 'Update failed' } }));
        } finally {
            setStockSaving(prev => ({ ...prev, [productId]: false }));
        }
    };

    const getStockLevel = (stock) => {
        if (stock === 0)   return { label: 'Out of Stock', cls: 'stock-out' };
        if (stock <= 5)    return { label: 'Low Stock',    cls: 'stock-low' };
        if (stock <= 20)   return { label: 'Moderate',     cls: 'stock-mid' };
        return               { label: 'In Stock',          cls: 'stock-ok' };
    };

    return (
        <section className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <h1><i className="fas fa-user-shield"></i> Admin Dashboard</h1>
                </div>

                <div className="admin-tabs">
                    <button
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <i className="fas fa-chart-bar"></i> Overview
                    </button>
                    <button
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        <i className="fas fa-receipt"></i> Manage Orders
                    </button>
                    <button
                        className={activeTab === 'products' ? 'active' : ''}
                        onClick={() => setActiveTab('products')}
                    >
                        <i className="fas fa-boxes"></i> Products &amp; Stock
                    </button>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <i className="fas fa-circle-notch fa-spin"></i>
                        <p>Loading…</p>
                    </div>
                ) : (
                    <div className="admin-content">

                        {/* ─── DASHBOARD ─── */}
                        {activeTab === 'dashboard' && stats && (
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: '#dbeafe' }}>
                                        <i className="fas fa-rupee-sign" style={{ color: '#2563eb' }}></i>
                                    </div>
                                    <span className="label">Total Revenue</span>
                                    <span className="value">₹{Number(stats.totalRevenue).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: '#dcfce7' }}>
                                        <i className="fas fa-shopping-bag" style={{ color: '#16a34a' }}></i>
                                    </div>
                                    <span className="label">Total Orders</span>
                                    <span className="value">{stats.totalOrders}</span>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: '#fef3c7' }}>
                                        <i className="fas fa-clock" style={{ color: '#d97706' }}></i>
                                    </div>
                                    <span className="label">Pending Orders</span>
                                    <span className="value">{stats.pendingOrders}</span>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: '#fee2e2' }}>
                                        <i className="fas fa-exclamation-triangle" style={{ color: '#dc2626' }}></i>
                                    </div>
                                    <span className="label">Low Stock Items</span>
                                    <span className="value danger">{stats.lowStockProducts}</span>
                                </div>
                            </div>
                        )}

                        {/* ─── ORDERS ─── */}
                        {activeTab === 'orders' && (
                            <div className="admin-table-container">
                                {orders.length === 0 ? (
                                    <div className="admin-empty">
                                        <i className="fas fa-inbox"></i>
                                        <p>No orders found</p>
                                    </div>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Customer</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Update Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id}>
                                                    <td><strong>#{order.id}</strong></td>
                                                    <td>
                                                        <div className="admin-customer-info">
                                                            <strong>User #{order.userId}</strong>
                                                            <span><i className="fas fa-map-marker-alt"></i> {order.shippingAddress}</span>
                                                            <span><i className="fas fa-phone-alt"></i> {order.shippingPhone}</span>
                                                        </div>
                                                    </td>
                                                    <td><strong>₹{Number(order.totalAmount).toLocaleString('en-IN')}</strong></td>
                                                    <td>
                                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                            className="admin-status-select"
                                                        >
                                                            <option value="PENDING">PENDING</option>
                                                            <option value="CONFIRMED">CONFIRMED</option>
                                                            <option value="PACKED">PACKED</option>
                                                            <option value="SHIPPED">SHIPPED</option>
                                                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                                            <option value="DELIVERED">DELIVERED</option>
                                                            <option value="CANCELLED">CANCELLED</option>
                                                            <option value="RETURNED">RETURNED</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* ─── PRODUCTS & STOCK ─── */}
                        {activeTab === 'products' && (
                            <div className="admin-table-container">
                                <div className="admin-section-header">
                                    <h3><i className="fas fa-boxes"></i> All Products &amp; Stock Levels</h3>
                                    <span className="admin-count">{products.length} products</span>
                                </div>

                                {products.length === 0 ? (
                                    <div className="admin-empty">
                                        <i className="fas fa-box-open"></i>
                                        <p>No products found in the database</p>
                                    </div>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Current Stock</th>
                                                <th>Stock Level</th>
                                                <th>Update Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => {
                                                const level     = getStockLevel(product.stock);
                                                const editVal   = stockEdits[product.id];
                                                const isSaving  = stockSaving[product.id];
                                                const msg       = stockMsg[product.id];
                                                const isDirty   = editVal !== undefined;

                                                return (
                                                    <tr key={product.id}>
                                                        <td>
                                                            <div className="admin-product-cell">
                                                                {product.image && (
                                                                    <img
                                                                        src={product.image}
                                                                        alt={product.name}
                                                                        className="admin-product-thumb"
                                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                                    />
                                                                )}
                                                                <div>
                                                                    <strong>{product.name}</strong>
                                                                    <small>{product.brand}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="admin-category-badge">
                                                                {product.category || '—'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="admin-price-cell">
                                                                <strong>₹{Number(product.price).toLocaleString('en-IN')}</strong>
                                                                {product.originalPrice && product.originalPrice > product.price && (
                                                                    <small style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                                                                        ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <strong style={{ fontSize: '18px' }}>{product.stock}</strong>
                                                            <small> units</small>
                                                        </td>
                                                        <td>
                                                            <span className={`stock-level-badge ${level.cls}`}>
                                                                {level.label}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="stock-edit-cell">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className="stock-qty-input"
                                                                    placeholder={product.stock}
                                                                    value={editVal ?? ''}
                                                                    onChange={(e) => handleStockChange(product.id, e.target.value)}
                                                                />
                                                                <button
                                                                    className={`stock-save-btn ${isDirty ? 'ready' : ''}`}
                                                                    onClick={() => handleSaveStock(product.id)}
                                                                    disabled={!isDirty || isSaving}
                                                                >
                                                                    {isSaving
                                                                        ? <i className="fas fa-circle-notch fa-spin"></i>
                                                                        : <i className="fas fa-check"></i>}
                                                                </button>
                                                                {msg && (
                                                                    <span className={`stock-msg ${msg.type}`}>
                                                                        {msg.text}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </section>
    );
};

export default Admin;

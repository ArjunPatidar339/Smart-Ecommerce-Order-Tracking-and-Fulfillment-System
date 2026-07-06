import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import usePolling from '../hooks/usePolling';

const STAGES = [
    {
        key: 'PROCESSING',
        label: 'Processing',
        description: 'Your order has been received and is being processed',
        icon: 'fas fa-clipboard-check',
        color: '#6366f1',
    },
    {
        key: 'PACKED',
        label: 'Packed',
        description: 'Your items have been carefully packed and are ready to ship',
        icon: 'fas fa-box',
        color: '#8b5cf6',
    },
    {
        key: 'SHIPPED',
        label: 'Shipped',
        description: 'Your package has left our warehouse',
        icon: 'fas fa-shipping-fast',
        color: '#0ea5e9',
    },
    {
        key: 'IN_TRANSIT',
        label: 'In Transit',
        description: 'Your package is on its way to your city',
        icon: 'fas fa-truck-moving',
        color: '#f59e0b',
    },
    {
        key: 'OUT_FOR_DELIVERY',
        label: 'Out for Delivery',
        description: 'Your package is with the delivery agent',
        icon: 'fas fa-truck',
        color: '#10b981',
    },
    {
        key: 'DELIVERED',
        label: 'Delivered',
        description: 'Package delivered successfully',
        icon: 'fas fa-check-circle',
        color: '#22c55e',
    },
];

// Map order/shipment status → stage index
const STATUS_TO_INDEX = {
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    PACKED: 1,
    SHIPPED: 2,
    IN_TRANSIT: 3,
    OUT_FOR_DELIVERY: 4,
    DELIVERED: 5,
};

const Tracking = () => {
    const [searchParams] = useSearchParams();
    const [input, setInput] = useState('');
    const [phoneInput, setPhoneInput] = useState('');
    const [orderId, setOrderId] = useState(null);
    const [phone, setPhone] = useState(null);
    const [trackingData, setTrackingData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    // Pre-fill from URL params (e.g. from My Orders page)
    useEffect(() => {
        const paramId = searchParams.get('orderId');
        const paramPhone = searchParams.get('phone');
        if (paramId && paramPhone) {
            setInput(paramId);
            setPhoneInput(paramPhone);
            setOrderId(paramId);
            setPhone(paramPhone);
            setLoading(true);
        }
    }, []);

    const fetchTracking = async () => {
        if (!orderId || !phone) return;
        try {
            const response = await axios.get(`http://localhost:8080/api/shipment/${orderId}?phone=${phone}`);
            setTrackingData(response.data);
            setError(null);
            setAnimateIn(false);
            setTimeout(() => setAnimateIn(true), 50);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No shipment found matching the provided Order ID and Phone Number. Please verify your details.');
            setTrackingData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = (e) => {
        e.preventDefault();
        if (!input.trim() || !phoneInput.trim()) {
            setError('Please enter both Order ID and Phone Number.');
            return;
        }
        setLoading(true);
        setTrackingData(null);
        setError(null);
        setOrderId(input.trim());
        setPhone(phoneInput.trim());
    };

    // Auto-poll every 5 seconds when tracking data is visible
    usePolling(orderId && phone ? fetchTracking : null, 5000, [orderId, phone]);

    // Resolve which status string to use (orderStatus from backend takes priority)
    const getRawStatus = () => {
        if (!trackingData) return null;
        return trackingData.orderStatus || trackingData.status || 'PROCESSING';
    };

    const isCancelledOrReturned = () => {
        const s = getRawStatus();
        return s === 'CANCELLED' || s === 'RETURNED';
    };

    const getCurrentStageIndex = () => {
        const s = getRawStatus();
        return STATUS_TO_INDEX[s] ?? 0;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'To be determined';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const currentIndex = trackingData ? getCurrentStageIndex() : -1;
    const cancelled = trackingData ? isCancelledOrReturned() : false;
    const rawStatus = getRawStatus();
    const isDelivered = rawStatus === 'DELIVERED';

    return (
        <section className="tracking-page">
            {/* Hero Banner */}
            <div className="tracking-hero">
                <div className="tracking-hero-bg"></div>
                <div className="container">
                    <div className="tracking-hero-content">
                        <div className="tracking-hero-badge">
                            <i className="fas fa-satellite-dish"></i> Real-Time Tracking
                        </div>
                        <h1>Track Your Package</h1>
                        <p>Enter your details for live, step-by-step delivery updates</p>

                        <form className="tracking-search-form" onSubmit={handleTrack}>
                            <div className="tracking-search-container">
                                <div className="tracking-input-group">
                                    <label htmlFor="tracking-order-input">Order ID</label>
                                    <div className="tracking-input-wrapper">
                                        <i className="fas fa-hashtag"></i>
                                        <input
                                            id="tracking-order-input"
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="e.g. 1"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="tracking-input-group">
                                    <label htmlFor="tracking-phone-input">Phone Number</label>
                                    <div className="tracking-input-wrapper">
                                        <i className="fas fa-phone-alt"></i>
                                        <input
                                            id="tracking-phone-input"
                                            type="tel"
                                            value={phoneInput}
                                            onChange={(e) => setPhoneInput(e.target.value)}
                                            placeholder="Your phone number"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    id="tracking-submit-btn"
                                    type="submit"
                                    className="tracking-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><i className="fas fa-circle-notch fa-spin"></i> Tracking...</>
                                    ) : (
                                        <><i className="fas fa-search"></i> Track Now</>
                                    )}
                                </button>
                            </div>
                        </form>
                        <p className="tracking-note">
                            <i className="fas fa-shield-alt"></i> Enhanced Privacy — track with Order ID + Registered Phone Number
                        </p>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div className="container tracking-results-container">

                {/* Error State */}
                {error && (
                    <div className="tracking-error-card">
                        <div className="error-icon-wrap">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <div>
                            <h3>Order Not Found</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* Main Tracking Card */}
                {trackingData && (
                    <div className={`tracking-main-card ${animateIn ? 'slide-in' : ''}`}>

                        {/* Card Top Header */}
                        <div className="tmc-header">
                            <div className="tmc-order-info">
                                <div className="tmc-info-chip">
                                    <i className="fas fa-receipt"></i>
                                    <span>Order</span>
                                    <strong>#{trackingData.orderId}</strong>
                                </div>
                                {trackingData.trackingNumber && (
                                    <div className="tmc-info-chip">
                                        <i className="fas fa-barcode"></i>
                                        <span>Tracking</span>
                                        <strong>{trackingData.trackingNumber}</strong>
                                    </div>
                                )}
                                {trackingData.carrier && (
                                    <div className="tmc-info-chip">
                                        <i className="fas fa-truck"></i>
                                        <span>Carrier</span>
                                        <strong>{trackingData.carrier}</strong>
                                    </div>
                                )}
                            </div>
                            <div className={`tmc-status-pill ${cancelled ? 'cancelled' : rawStatus?.toLowerCase()}`}>
                                <i className={cancelled ? 'fas fa-ban' : isDelivered ? 'fas fa-check-circle' : 'fas fa-circle-dot'}></i>
                                {cancelled ? rawStatus : rawStatus?.replace(/_/g, ' ')}
                            </div>
                        </div>

                        {/* Cancelled / Returned State */}
                        {cancelled ? (
                            <div className="cancelled-banner">
                                <div className="cancelled-icon">
                                    <i className={rawStatus === 'RETURNED' ? 'fas fa-undo-alt' : 'fas fa-times-circle'}></i>
                                </div>
                                <div>
                                    <h2>{rawStatus === 'RETURNED' ? 'Order Returned' : 'Order Cancelled'}</h2>
                                    <p>
                                        {rawStatus === 'RETURNED'
                                            ? 'This order has been returned. A refund will be processed within 5–7 business days.'
                                            : 'This order has been cancelled. If payment was made, a refund will be issued within 5–7 business days.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* ─── Progress Timeline ─── */}
                                <div className="progress-timeline-wrap">
                                    <div className="pt-track">
                                        <div
                                            className="pt-fill"
                                            style={{
                                                width: `${(currentIndex / (STAGES.length - 1)) * 100}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <div className="pt-steps">
                                        {STAGES.map((stage, idx) => {
                                            const isDone = idx < currentIndex;
                                            const isCurrent = idx === currentIndex;
                                            return (
                                                <div
                                                    key={stage.key}
                                                    className={`pt-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                                                >
                                                    <div
                                                        className="pt-step-node"
                                                        style={
                                                            isDone || isCurrent
                                                                ? { background: stage.color, borderColor: stage.color }
                                                                : {}
                                                        }
                                                    >
                                                        {isDone ? (
                                                            <i className="fas fa-check"></i>
                                                        ) : (
                                                            <i className={stage.icon}></i>
                                                        )}
                                                        {isCurrent && <span className="pt-pulse-ring"></span>}
                                                    </div>
                                                    <div className="pt-step-label">
                                                        <span className="pt-step-name">{stage.label}</span>
                                                        {isCurrent && (
                                                            <span className="pt-step-desc">{stage.description}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ─── Active Stage Detail Banner ─── */}
                                <div
                                    className="active-stage-banner"
                                    style={{ borderColor: STAGES[currentIndex]?.color }}
                                >
                                    <div
                                        className="asb-icon"
                                        style={{ background: STAGES[currentIndex]?.color }}
                                    >
                                        <i className={STAGES[currentIndex]?.icon}></i>
                                    </div>
                                    <div className="asb-text">
                                        <h3>{STAGES[currentIndex]?.label}</h3>
                                        <p>{STAGES[currentIndex]?.description}</p>
                                    </div>
                                    {isDelivered && (
                                        <div className="asb-delivered-badge">
                                            <i className="fas fa-award"></i> Successfully Delivered
                                        </div>
                                    )}
                                </div>

                                {/* ─── Delivery / Date Info Row ─── */}
                                <div className="tracking-info-row">
                                    {/* Estimated / Actual Delivery */}
                                    <div className="ti-card">
                                        <div className="ti-icon" style={{ color: '#0ea5e9' }}>
                                            <i className={isDelivered ? 'fas fa-calendar-check' : 'far fa-calendar-alt'}></i>
                                        </div>
                                        <div>
                                            <span>{isDelivered ? 'Delivered On' : 'Estimated Delivery'}</span>
                                            <strong>
                                                {formatDate(trackingData.estimatedDelivery)}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    {trackingData.shippingAddress && (
                                        <div className={`ti-card ${isDelivered ? 'ti-card-delivered' : ''}`}>
                                            <div className="ti-icon" style={{ color: isDelivered ? '#22c55e' : '#6366f1' }}>
                                                <i className={isDelivered ? 'fas fa-map-marker-check' : 'fas fa-map-marker-alt'}></i>
                                            </div>
                                            <div>
                                                <span>
                                                    {isDelivered ? '✅ Delivered To' : 'Shipping To'}
                                                </span>
                                                <strong>{trackingData.shippingAddress}</strong>
                                                {trackingData.shippingPhone && (
                                                    <small>
                                                        <i className="fas fa-phone-alt"></i> {trackingData.shippingPhone}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ─── All Stages Checklist ─── */}
                                <div className="stages-checklist">
                                    <h4><i className="fas fa-list-check"></i> Delivery Journey</h4>
                                    <div className="stages-list">
                                        {STAGES.map((stage, idx) => {
                                            const isDone = idx <= currentIndex;
                                            return (
                                                <div key={stage.key} className={`sc-item ${isDone ? 'done' : 'pending'}`}>
                                                    <div
                                                        className="sc-dot"
                                                        style={isDone ? { background: stage.color } : {}}
                                                    >
                                                        {isDone
                                                            ? <i className="fas fa-check"></i>
                                                            : <i className="far fa-circle"></i>}
                                                    </div>
                                                    <div className="sc-info">
                                                        <span className="sc-label">{stage.label}</span>
                                                        <span className="sc-desc">{stage.description}</span>
                                                    </div>
                                                    {idx === currentIndex && (
                                                        <span className="sc-current-tag">Current</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Empty state shown before any search */}
                {!trackingData && !error && !loading && (
                    <div className="tracking-empty-state">
                        <div className="tes-icon">
                            <i className="fas fa-box-open"></i>
                        </div>
                        <h3>Enter an Order ID to Start Tracking</h3>
                        <p>Get real-time updates on your package — no login needed</p>
                        <div className="tes-features">
                            {[
                                { icon: 'fas fa-shield-alt', text: 'Secure & Private' },
                                { icon: 'fas fa-bolt', text: 'Real-Time Updates' },
                                { icon: 'fas fa-globe', text: 'Open Access' },
                            ].map((f) => (
                                <div className="tes-feat" key={f.text}>
                                    <i className={f.icon}></i>
                                    <span>{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Tracking;

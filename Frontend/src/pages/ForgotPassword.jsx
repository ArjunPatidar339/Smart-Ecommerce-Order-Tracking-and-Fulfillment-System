import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            setMessage({ text: 'OTP sent to your email successfully!', type: 'success' });
            setTimeout(() => {
                setStep(2);
                setMessage({ text: '', type: '' });
            }, 1500);
        } catch (err) {
            setMessage({ 
                text: err.response?.data || 'Failed to send OTP. Please check your email.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setMessage({ text: "Passwords do not match", type: "error" });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', { 
                email, 
                otp, 
                newPassword 
            });
            setMessage({ text: 'Password reset successfully! Redirecting to login...', type: 'success' });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setMessage({ 
                text: err.response?.data || 'Invalid OTP or failed to reset password.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Reset Password</h2>
                        <p>{step === 1 ? 'Enter your email to receive an OTP' : 'Enter OTP and your new password'}</p>
                    </div>

                    {message.text && (
                        <div className={`auth-msg ${message.type}`}>
                            {message.type === 'error' ? <i className="fas fa-exclamation-circle"></i> : <i className="fas fa-check-circle"></i>}
                            {message.text}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="auth-form active">
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <i className="fas fa-envelope"></i>
                                    <input 
                                        type="email" 
                                        placeholder="Enter your registered email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="auth-form active">
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <i className="fas fa-envelope"></i>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                        readOnly
                                        style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                                    />
                                </div>
                                <small className="change-email-link" onClick={() => setStep(1)} style={{ cursor: 'pointer', color: '#0f766e', fontSize: '12px', marginTop: '5px', display: 'inline-block' }}>
                                    <i className="fas fa-arrow-left"></i> Change Email
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Enter OTP</label>
                                <div className="input-with-icon">
                                    <i className="fas fa-key"></i>
                                    <input 
                                        type="text" 
                                        placeholder="6-digit OTP" 
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <div className="input-with-icon">
                                    <i className="fas fa-lock"></i>
                                    <input 
                                        type="password" 
                                        placeholder="Enter new password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <div className="input-with-icon">
                                    <i className="fas fa-lock"></i>
                                    <input 
                                        type="password" 
                                        placeholder="Confirm new password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <div className="auth-footer">
                        <p>Remember your password? <Link to="/login">Login here</Link></p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForgotPassword;

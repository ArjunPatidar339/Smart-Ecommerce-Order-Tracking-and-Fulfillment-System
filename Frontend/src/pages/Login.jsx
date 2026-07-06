import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [isLoginActive, setIsLoginActive] = useState(true);
    const navigate = useNavigate();

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Signup Form State
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupError, setSignupError] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email: loginEmail,
                password: loginPassword
            });
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data));
            navigate('/');
            // Reload to update header state if needed
            window.location.reload();
        } catch (err) {
            setLoginError('Invalid email or password. Please try again.');
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setSignupError('');
        
        if (signupPassword !== signupConfirmPassword) {
            setSignupError("Passwords don't match");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', {
                name: signupName,
                email: signupEmail,
                password: signupPassword,
                phone: '', // Can be added later
                address: ''
            });
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data));
            navigate('/');
            window.location.reload();
        } catch (err) {
            setSignupError('Registration failed. Email might already be in use.');
        }
    };

    return (
        <section id="auth-section">
            <div className="auth-container">
                <div className="auth-toggle">
                    <button 
                        className={`toggle-btn ${isLoginActive ? 'active' : ''}`} 
                        onClick={() => setIsLoginActive(true)}
                    >
                        Login
                    </button>
                    <button 
                        className={`toggle-btn ${!isLoginActive ? 'active' : ''}`} 
                        onClick={() => setIsLoginActive(false)}
                    >
                        Sign Up
                    </button>
                </div>

                {isLoginActive ? (
                    <div className="auth-form active" id="login-form">
                        <h2>Welcome Back</h2>
                        <p>Login to your account</p>
                        {loginError && <p style={{color: 'red', fontSize: '14px', marginBottom: '10px'}}>{loginError}</p>}
                        <form onSubmit={handleLoginSubmit}>
                            <div className="form-group">
                                <label htmlFor="login-email">Email Address</label>
                                <input 
                                    type="email" 
                                    id="login-email" 
                                    placeholder="Enter your email" 
                                    required 
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="login-password">Password</label>
                                <input 
                                    type="password" 
                                    id="login-password" 
                                    placeholder="Enter your password" 
                                    required 
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" id="remember" />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
                            </div>
                            <button type="submit" className="auth-btn">Login</button>
                        </form>
                        <p className="auth-switch">
                            Don't have an account? <a href="#!" onClick={() => setIsLoginActive(false)}>Sign Up</a>
                        </p>
                    </div>
                ) : (
                    <div className="auth-form active" id="signup-form">
                        <h2>Create Account</h2>
                        <p>Join us today</p>
                        {signupError && <p style={{color: 'red', fontSize: '14px', marginBottom: '10px'}}>{signupError}</p>}
                        <form onSubmit={handleSignupSubmit}>
                            <div className="form-group">
                                <label htmlFor="signup-name">Full Name</label>
                                <input 
                                    type="text" 
                                    id="signup-name" 
                                    placeholder="Enter your full name" 
                                    required 
                                    value={signupName}
                                    onChange={(e) => setSignupName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-email">Email Address</label>
                                <input 
                                    type="email" 
                                    id="signup-email" 
                                    placeholder="Enter your email" 
                                    required 
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-password">Password</label>
                                <input 
                                    type="password" 
                                    id="signup-password" 
                                    placeholder="Create a password" 
                                    required 
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-confirm-password">Confirm Password</label>
                                <input 
                                    type="password" 
                                    id="signup-confirm-password" 
                                    placeholder="Confirm your password" 
                                    required 
                                    value={signupConfirmPassword}
                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" id="terms" required />
                                    <span>I agree to the <a href="#" className="terms-link">Terms & Conditions</a></span>
                                </label>
                            </div>
                            <button type="submit" className="auth-btn">Sign Up</button>
                        </form>
                        <p className="auth-switch">
                            Already have an account? <a href="#!" onClick={() => setIsLoginActive(true)}>Login</a>
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Login;

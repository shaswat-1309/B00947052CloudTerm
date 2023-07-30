import React, { useState } from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import axios from 'axios';
import './App.css';

/**
 * LoginForm component for user login functionality.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.setActiveTab - Function to set the active tab
 * @returns {JSX.Element} Login form component
 */
const LoginForm = ({ setActiveTab }) => {
    /**
     * State variable to store the user's email.
     *
     * @type {string}
     */
    const [email, setEmail] = useState('');

    /**
     * State variable to store the user's password.
     *
     * @type {string}
     */
    const [password, setPassword] = useState('');

    /**
     * State variable to store the error message.
     *
     * @type {string}
     */
    const [errorMessage, setErrorMessage] = useState('');

    /**
     * React Router navigate hook to navigate to different routes.
     *
     * @type {Function}
     */
    const navigate = useNavigate();

    /**
     * Function to handle login submission.
     *
     * @param {Object} e - Form submit event
     */
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setErrorMessage('Email and password are required');
            return;
        }

        try {
            // Make an API call to check email and password validation
            const response = await axios.post( process.env.REACT_APP_API_URL + '/Login', {
                email,
                password,
            });
            if (response.status === 402) {
                setErrorMessage('Invalid email or password');
            } else if (response.status === 401) {
                setErrorMessage('User not found');
            } else if (response.status === 200) {
                const { name } = response.data;
                localStorage.setItem('AccessToken', response.data.AccessToken);
                localStorage.setItem('email', email);
                // Login successful
                // Save the token in local storage
                console.log(response.data.AccessToken);
                console.log("Navigating...");
                navigate('/dashboard', { state: { name: name } });
            }
        } catch (error) {
                console.error('Error during login:', error);
                // Handle other error cases or display a message to the user
                setErrorMessage('An error occurred during login');

        }
    };
    return (
        <div className="auth-container">
            <div className="form-content">
                <h2 className="form-heading">Login</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                    />
                    <center>
                        <button type="submit">Login</button>
                    </center>
                </form>
                <NavLink to={'/'}>Don't have an account? Register here</NavLink>
            </div>
        </div>
    );
};

export default LoginForm;

/**
 * References:
 * [1] “Getting started,” React, [Online]. Available: https://legacy.reactjs.org/docs/getting-started.html [Accessed Jul. 4, 2023]
 */

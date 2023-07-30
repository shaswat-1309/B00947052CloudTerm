import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const RegistrationForm = ({ setActiveTab }) => {
    const [given_name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setage] = useState('');
    const [verification_code, setVerificationCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form fields
        if (
            given_name.trim() === '' ||
            email.trim() === '' ||
            password.trim() === '' ||
            age.trim() === ''
        ) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        if (/\d/.test(given_name)) {
            setErrorMessage('Name and age should not contain numbers');
            return;
        }
        if (password.length < 8) {
            setErrorMessage('Password should be at least 8 characters');
            return;
        }
        // if (email.endsWith('@gmail.com') === false) {
        //     setErrorMessage('Email should end with @gmail.com');
        //     return;
        // }
        console.log(process.env.REACT_APP_API_URL + '/Registration');
        try {
            const requestBody = {
                given_name,
                email,
                age,
                password,

            };

            const response = await axios.post(
                process.env.REACT_APP_API_URL + '/Registration',
                requestBody
            );

            if (response.data.status === 200) {
                console.log('Registration successful');
                // Show verification code pop-up
                setShowVerificationPopup(true);
            }
            else if (response.data.status === 401) {
                setErrorMessage('Email already exists');
            }
            else {
                console.error('Registration failed');
                // Handle error response
                setErrorMessage('Registration failed');
            }
        } catch (error) {
                console.error('Error during registration:', error);
                // Handle error
                setErrorMessage('Error during registration');
        }
    };

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();

        try {
            const requestBody = {
                given_name,
                email,
                age,
                password,
                verification_code,

            };

            const response = await axios.post(
                process.env.REACT_APP_API_URL + 'VerifyRegisterCode',
                requestBody
            );

            if (response.data.status === 200) {
                console.log('Verification successful');
                // Handle success response after verification
                navigate('/login', { state: { email: email } });
            } else {
                console.error('Verification failed');
                // Handle error response
                setErrorMessage('Wrong Verification code');
            }
        } catch (error) {
            console.error('Error during verification:', error);
            // Handle error
            setErrorMessage('Error during verification');
        }
    };

    return (
        <div className="auth-container">
            <form className="form-content" onSubmit={showVerificationPopup ? handleVerificationSubmit : handleSubmit}>
                <h2 className="form-heading">Registration</h2>
                <input
                    className="form-input"
                    type="text"
                    placeholder="given_name"
                    value={given_name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    className="form-input"
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="form-input"
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    className="form-input"
                    type="number"
                    placeholder="age"
                    value={age}
                    onChange={(e) => setage(e.target.value)}
                />
                {showVerificationPopup ? (
                    <input
                        className="form-input"
                        type="number"
                        placeholder="Verification Code"
                        value={verification_code}
                        onChange={(e) => setVerificationCode(e.target.value)}
                    />
                ) : null}
                <button type="submit">
                    {showVerificationPopup ? 'Submit Verification Code' : 'Register'}
                </button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <NavLink to={'/login'}>Already have an account? Login here</NavLink>
            </form>
        </div>
    );
};

export default RegistrationForm;

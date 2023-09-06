import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import axios from "axios";

const Dashboard = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [username, setUsername] = useState('');
    const [uploading, setUploading] = useState(false); // New state to track if uploading is in progress
    const [uploadResponse, setUploadResponse] = useState(null); // New state to store API response
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    const navigate = useNavigate();
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setUploadedFile(file);

        // Read the image as a data URL and set the imageURL state
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageURL(reader.result);
        };
        reader.readAsDataURL(file);
    };
    const verifyToken = async () => {
        const accessToken = localStorage.getItem('AccessToken');

        if (!accessToken) {
            // Token not found, navigate to login page
            navigate('/login');
        } else {
            try {
                const requestBody = {
                    AccessToken: accessToken,
                };
                // Replace this API call with your actual API call to verify the token
                const response = await axios.post( process.env.REACT_APP_API_URL + '/VerifyLoginToken',
                    requestBody
                );


                if (response.data.status === 200) {
                    // Token is valid, continue with Dashboard
                    setUsername(response.data.given_name);
                    console.log('Token is valid');
                } else {
                    // Token is invalid, navigate to login page
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error during token verification:', error);
                // Handle error, navigate to login page
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        verifyToken().then(r => console.log('Verified token'));
    }, []);

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);

        const file = event.dataTransfer.files[0];
        setUploadedFile(file);
    };

    const handleChooseFile = () => {
        document.getElementById('file-upload').click();
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setUploadResponse(null);
        setOrderPlaced(false); // Reset orderPlaced state to false

        // Reset the input element's value to allow selecting the same file again
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleLogout = async () => {
        try {
            const accessToken = localStorage.getItem('AccessToken');
            if (!accessToken) {
                // Token not found, navigate to login page
                navigate('/login');
                return;
            }

            // Call the API to remove the access token
            const response = await axios.post( process.env.REACT_APP_API_URL + '/Logout', {
                AccessToken: accessToken,
            });

            if (response.data.status === 200) {
                // Token removal successful, navigate to login page
                localStorage.removeItem('AccessToken');
                navigate('/login');
            } else {
                console.error('Error during logout:', response.data.message);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };
    const handleConvert = async () => {
        try {
            if (!uploadedFile) {
                console.error('No file uploaded');
                alert('No file uploaded. Please choose a file to upload.');
                return;
            }

            const reader = new FileReader();

            reader.onloadend = async () => {
                try {
                    const image_data = reader.result.split(',')[1];
                    const image_name = uploadedFile.name;

                    const requestBody = {
                        image_data,
                        image_name,
                    };
                    setUploading(true);
                    const response = await axios.post(
                        process.env.REACT_APP_API_URL + '/UploadToS3',
                        requestBody
                    );

                    console.log('Image upload response:', response);

                    if (Array.isArray(response.data) && response.data.length === 0) {
                        // Response is an empty array, display the alert and clear the response state
                        alert('Prescription not uploaded. Please try again or choose another file.');
                        setUploadResponse(null);
                    } else {
                        // Response contains data, set the upload response state
                        setUploadResponse(response);
                    }

                    setUploading(false);
                } catch (error) {
                    console.error('Error during image upload:', error);
                    setUploading(false);
                }
            };

            reader.readAsDataURL(uploadedFile);
        } catch (error) {
            console.error('Error during image upload:', error);
        }
    };
    const handlePlaceOrder = async () => {
        try {
            if (!uploadResponse) {
                console.error('No upload response available');
                return;
            }

            console.log(uploadResponse);
            console.log(uploadResponse.data);

            const email = localStorage.getItem('email');

            const requestBody = {
                email: email,
                data: uploadResponse.data, // Use the uploadResponse.data as the data field in the request body
            };

            console.log('requestBody:', requestBody);

            // Show "Placing Order" message and disable the button while API call is in progress
            setPlacingOrder(true); // Set the state to true when the button is clicked
            const response = await axios.post(
                process.env.REACT_APP_API_URL + '/UpdateInventory',
                requestBody
            );

            console.log('Order placed successfully:', response.data);
            setOrderPlaced(true);
            alert(response.data)
        } catch (error) {
            console.error('Error during order placement:', error);
        } finally {
            setPlacingOrder(false); // Reset the state after API call is completed (regardless of success or error)
        }
    };

    return (
        <div className="dashboard">
            <div className="navbar">
            <div className="navbar-left">
                <h1>QikEzy</h1>
            </div>
            <div className="navbar-right">
                <div className="profile">
                    <span className="username">{username}</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
            <div className={`upload-section ${dragging ? 'dragging' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <div className="upload-content">
                    <label htmlFor="file-upload" className="upload-label">
                        {uploadedFile ? '1 file chosen' : 'Drag and drop a pdf/image or click to upload'}
                    </label>
                    <div className="choose-file-btn" onClick={handleChooseFile}>
                        Choose File
                    </div>
                    <input id="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
                </div>
                {uploadedFile && (
                    <>
                        <p className="file-name">
                            Chosen File: {uploadedFile.name}
                            <button className="remove-file-btn" onClick={handleRemoveFile}>
                                X
                            </button>
                        </p>
                        {/* Display the uploaded image */}
                        {imageURL && <img src={imageURL} alt="Uploaded" className="uploaded-image" />}
                    </>
                )}
                {uploadResponse && (
                    <button className="convert-btn" onClick={handlePlaceOrder} disabled={orderPlaced || placingOrder}>
                        {placingOrder ? 'Placing your order...' : (orderPlaced ? 'Order Placed' : 'Place Order')}
                    </button>
                )}
                {/* Show the "Upload" button if no file is uploaded and not in the middle of uploading */}
                {!uploading && !uploadResponse && (
                    <button className="upload-btn" onClick={handleConvert}>
                        Upload
                    </button>
                )}
                {/* Show "Uploading..." message if in the middle of uploading */}
                {uploading && <span className="uploading-msg">Uploading...</span>}
            </div>
        </div>
    );
};

export default Dashboard;
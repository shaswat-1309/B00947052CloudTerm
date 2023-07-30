import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Registration from './Registration';
import Dashboard from './Dashboard';
const App = () => {

    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/" element={<Registration />} />
                </Routes>
            </Router>
        </div>
    );
};

export default App;

/**
 * References:
 * [1] “Getting started,” React, Online. Available: https://legacy.reactjs.org/docs/getting-started.html [Accessed Jul. 4, 2023]
 */

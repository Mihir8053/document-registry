import React, { useState } from 'react';
import AuthenticationForm from '../components/AuthenticationForm';
import 'semantic-ui-css/semantic.min.css';
import Layout from '../components/Layout';

const admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleAuthentication = (authenticated) => {
        setIsAuthenticated(authenticated);
    };

    return (
        <Layout>
            {!isAuthenticated ? (
                <AuthenticationForm onAuthenticate={handleAuthentication} />
            ) : (
                <ExporterManagement />
            )}
        </Layout>
    );
};

export default admin;
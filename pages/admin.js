import React, { useState } from 'react';
import AuthenticationForm from '../components/AuthenticationForm';
import 'semantic-ui-css/semantic.min.css';
import Layout from '../components/Layout';

const Admin = () => {
    return (
        <Layout>
            <AuthenticationForm />
        </Layout>
    );
};

export default Admin;
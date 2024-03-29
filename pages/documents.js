import React from 'react';
import DocumentTablePage from '../components/DocumentTablePage';

const DocumentsPage = ({ exporterAddress }) => {
    return <DocumentTablePage exporterAddress={exporterAddress} />;
};

export async function getServerSideProps(context) {
    const { query } = context;
    const { exporterAddress } = query;

    return {
        props: { exporterAddress },
    };
}

export default DocumentsPage;
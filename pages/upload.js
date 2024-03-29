import React, { useState } from 'react';
import factory from "../ethereum/factory";
import 'semantic-ui-css/semantic.min.css'
import { Form, Button, Input, Message } from 'semantic-ui-react';
import UploadComponent from '../components/UploadComponent';
import Layout from '../components/Layout';
import { useRouter } from 'next/router'; // Import useRouter hook from Next.js

const UploadPage = () => {
    const router = useRouter(); // Initialize the router
    const [exporterAddress, setExporterAddress] = useState('');
    const [exporterInfo, setExporterInfo] = useState("");
    const [isApproved, setIsApproved] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const approvedExporters = await factory.methods.getApprovedExporters().call();
            const exporterInformation = await factory.methods.getExporterInfo(exporterAddress).call();
            const isExporterApproved = approvedExporters.includes(exporterAddress);
            if (!isExporterApproved) {
                setError("Error!! The exporter is not added by the admin");
                setIsApproved(false);
                setExporterInfo("");
            } else {
                setIsApproved(true);
                setExporterInfo(exporterInformation);
                setError("");
            }
        } catch (error) {
            console.log("Error verifying exporter address:", error);
            setError("Error!! The exporter is not added by the admin");
        }
    };

    const handleViewUploads = () => {
        router.push({
            pathname: '/documents',
            query: { exporterAddress },
        });
    };

    return (
        <Layout>
            <div>
                <h1>Upload Documents</h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Field>
                        <label>Exporter Address</label>
                        <Input
                            value={exporterAddress}
                            onChange={(e) => setExporterAddress(e.target.value)}
                            placeholder="Enter your exporter address"
                        />
                    </Form.Field>
                    <Button primary type="submit">Verify</Button>
                </Form>
                {isApproved && (
                    <div>
                        <UploadComponent exporterAddress={exporterAddress} exporterInfo={exporterInfo} />
                        <Button primary basic onClick={handleViewUploads} style={{ marginTop: "10px" }}>View Uploads</Button>
                    </div>
                )}
                {error && <Message error header="Error" content={error} />}
            </div>
        </Layout>
    );
};

export default UploadPage;
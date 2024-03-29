import React, { useState } from 'react';
import Layout from '../components/Layout';
import 'semantic-ui-css/semantic.min.css';
import { Form, Button, Input, Message, Table } from 'semantic-ui-react';
import factory from "../ethereum/factory";

const student = () => {
    const [studentAddress, setStudentAddress] = useState("");
    const [certificate, setCertificate] = useState(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        try {
            const certificate = await factory.methods.getStudentCertificate(studentAddress).call();
            const ipfsHash = certificate['2'];
            if (ipfsHash.length == 0) {
                setError("No documents issued yet.")
            }
            else {
                setCertificate(certificate);
                console.log(certificate);
                setError("");
            }
        } catch (err) {
            setError("Error retrieving certificate details." + err.message);
            console.error(err);
        }
    };

    return (
        <Layout>
            <Form onSubmit={handleSubmit}>
                <Form.Field>
                    <label>Student Address</label>
                    <Input
                        value={studentAddress}
                        onChange={(e) => setStudentAddress(e.target.value)}
                        placeholder="Enter your address here"
                    />
                </Form.Field>
                <Button primary type="submit">
                    Get Documents
                </Button>
            </Form>
            {error && <Message negative>{error}</Message>}
            {certificate && (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>IPFS Hash</Table.HeaderCell>
                            <Table.HeaderCell>Student Name</Table.HeaderCell>
                            <Table.HeaderCell>Certificate Details</Table.HeaderCell>
                            <Table.HeaderCell>Issued At</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row><Table.Cell>
                            <a href={`https://gateway.ipfs.io/ipfs/${certificate.ipfs_hash}`} target="_blank" rel="noopener noreferrer">
                                View Document
                            </a>
                        </Table.Cell>
                            <Table.Cell>{certificate.studentName}</Table.Cell>
                            <Table.Cell>{certificate.certificateDetails}</Table.Cell>
                            <Table.Cell>{new Date(Number(certificate.issuedAt.toString()) * 1000).toLocaleString()}</Table.Cell>                        </Table.Row>
                    </Table.Body>
                </Table>
            )}
        </Layout>
    );
};

export default student;
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import 'semantic-ui-css/semantic.min.css'
import web3 from '../ethereum/web3';
import axios from 'axios';

const verify = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [documentDetails, setDocumentDetails] = useState(null);
    const [ipfsHash, setIpfsHash] = useState('');
    const [url, setURL] = useState('');
    const [processMessage, setProcessMessage] = useState('');

    const captureFile = async (event) => {
        event.preventDefault();
        const data = event.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(data);
        reader.onloadend = () => {
            const arrayBuffer = reader.result;
            const fileBuffer = new File([arrayBuffer], data.name, { type: data.type });
            setFile(fileBuffer);
            setFileName(data.name);
        };
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setDocumentDetails(null);
        setIpfsHash('');
        setURL('');
        setProcessMessage('Uploading document to IPFS...');

        if (file) {
            try {
                // Storing file on IPFS
                const formData = new FormData();
                formData.append('file', file);
                const pinata_api_key = process.env.NEXT_PUBLIC_PINATA_API_KEY;
                const pinata_secret_api_key = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
                const resFile = await axios({
                    method: 'post',
                    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
                    data: formData,
                    headers: {
                        pinata_api_key: pinata_api_key,
                        pinata_secret_api_key: pinata_secret_api_key,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                const ipfsHash = resFile.data.IpfsHash;
                setIpfsHash(ipfsHash);
                setProcessMessage('Verifying document hash on the blockchain...');

                // Verify the document hash
                const result = await factory.methods.findDocHash(ipfsHash).call();

                const resultKeys = Object.keys(result);
                if (resultKeys.length === 0) {
                    setError('Invalid document hash');
                } else {
                    const documentDetails = {
                        blockNumber: result['0'],
                        timestamp: result['1'],
                        info: result['2'],
                        ipfsHash: result['3']
                    };
                    if (documentDetails.ipfsHash.length == 0) {
                        setError('Invalid Document');
                        setProcessMessage('');
                    }
                    else {
                        setDocumentDetails(documentDetails);
                        setSuccess('Document verified successfully');
                        const ImgURL = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
                        setURL(ImgURL);
                        setProcessMessage('');
                    }
                }
            } catch (err) {
                setError(`Error verifying document+${err.message}`);
                setProcessMessage('');
                console.error(err);
            }
        } else {
            setError('Please upload a file');
            setProcessMessage('');
        }

        setLoading(false);
    };

    const renderDocumentDetails = () => {
        if (documentDetails) {
            return (
                <div>
                    <p>Timestamp: {new Date(Number(documentDetails.timestamp) * 1000).toLocaleString()}</p>
                    <p>Exporter Info: {documentDetails.info}</p>
                    <p>IPFS Hash: {documentDetails.ipfsHash}</p>
                    {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            View Document
                        </a>
                    )}
                </div>
            );
        }
    };

    return (
        <Layout>
            <Form onSubmit={onSubmit}>
                <Form.Field>
                    <label>Upload Document</label>
                    <Input type="file" onChange={captureFile} />
                </Form.Field>
                <Button primary type="submit" loading={loading} disabled={!file}>
                    Verify Document
                </Button>
            </Form>
            {processMessage && <Message info>{processMessage}</Message>}
            {error && <Message negative>{error}</Message>}
            {success && <Message positive>{success}</Message>}
            {documentDetails && renderDocumentDetails()}
        </Layout>
    );
};

export default verify;
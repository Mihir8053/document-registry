import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Message } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import axios from "axios";
import factory from "../ethereum/factory"
import { useRouter, Router } from 'next/router';

const UploadComponent = ({ exporterAddress, exporterInfo }) => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [hash, setHash] = useState("");
    const [url, setURL] = useState("");
    const [balance, setBalance] = useState("0");
    const [studentAddress, setStudentAddress] = useState("");
    const [studentName, setStudentName] = useState("");
    const [documentInfo, setDocumentInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDocumentDeleted, setIsDocumentDeleted] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletion, setDeletion] = useState("");
    const [processMessage, setProcessMessage] = useState("");
    const [message, setMessage] = useState(null);
    const router = useRouter();

    const handleSuccessfulUpload = () => {
        router.push({
            pathname: '/documents',
            query: { exporterAddress },
        });
    };

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const amt = await web3.eth.getBalance(exporterAddress);
                const amtInEther = web3.utils.fromWei(amt, "ether");
                const balanceString = amtInEther.toString();
                setBalance(balanceString);
            } catch (error) {
                console.log("Error fetching balance:", error);
            }
        };

        fetchBalance();
    }, [exporterAddress]);

    useEffect(() => {
        if (hash) {
            setURL(`https://gateway.ipfs.io/ipfs/${hash}`);
        }
    }, [hash]);

    const captureFile = async (event) => {
        event.preventDefault();
        const data = event.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(data);
        reader.onloadend = () => {
            const arrayBuffer = reader.result;
            const fileBuffer = new File([arrayBuffer], data.name, {
                type: data.type,
            });
            setFile(fileBuffer);
            setFileName(data.name);
        };
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setProcessMessage('Uploading document to IPFS...');
        setMessage(null); // Clear any previous message

        if (file) {
            try {
                // Storing file on IPFS
                const formData = new FormData();
                formData.append("file", file);
                const pinata_api_key = process.env.NEXT_PUBLIC_PINATA_API_KEY;
                const pinata_secret_api_key = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        pinata_api_key: pinata_api_key,
                        pinata_secret_api_key: pinata_secret_api_key,
                        "Content-Type": "multipart/form-data",
                    },
                });
                const ipfsHash = resFile.data.IpfsHash;
                setHash(ipfsHash);
                setProcessMessage('Waiting for transaction confirmation...');
                const tx = await factory.methods.addDocHash(
                    ipfsHash, // IPFS hash
                    "ipfs hash",
                    studentAddress, // Student address from state
                    studentName, // Student name from state
                    documentInfo // Information from state
                ).send({ from: exporterAddress });


                // Once transaction is confirmed, update the URL and set loading to false
                const ImgURL = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
                setURL(ImgURL);
                setProcessMessage('Document uploaded and stored successfully!');
                setMessage('Document uploaded and stored successfully!'); // Set success message
                handleSuccessfulUpload();
                setTimeout(() => {
                    setProcessMessage('');
                    setMessage(null); // Clear the message after 3 seconds
                }, 3000);
            } catch (error) {
                console.error("Error:", error);
                setProcessMessage('');
                setMessage('Error occurred during the process.' + error.message); // Set error message
            }
        }
        setLoading(false);
    };


    return (
        <div>
            <Card fluid style={{ marginTop: "10px" }} >
                <Card.Content>
                    <Card.Header>Exporter Details</Card.Header>
                    <Card.Meta>Exporter Address: {exporterAddress}</Card.Meta>
                    <Card.Meta>Balance: {balance} ETH</Card.Meta>
                    <Card.Description>Exporter Info: {exporterInfo}</Card.Description>
                </Card.Content>
            </Card>
            <Form onSubmit={onSubmit}>
                <Form.Field>
                    <label>Student Address</label>
                    <input type="text" value={studentAddress} onChange={(e) => setStudentAddress(e.target.value)} />
                </Form.Field>
                <Form.Field>
                    <label>Student Name</label>
                    <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                </Form.Field>
                <Form.Field>
                    <label>Document Information</label>
                    <input
                        type="text"
                        placeholder="Enter document information"
                        value={documentInfo}
                        onChange={(e) => setDocumentInfo(e.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Upload File</label>
                    <input type="file" onChange={captureFile} />
                </Form.Field>
                <Button primary type="submit" loading={loading}>Upload & Store</Button>
            </Form>
            <Message positive={!deletion} negative={!!deletion} hidden={!deletion} style={{ marginTop: "10px" }}>
                <Message.Header>{deletion}</Message.Header>
            </Message>
            {processMessage && (
                <Message info>{processMessage}</Message>
            )}

            {message && (
                <Message
                    positive={!message.includes('Error')}
                    negative={message.includes('Error')}
                    style={{ marginTop: '10px' }}
                >
                    <Message.Header>{message}</Message.Header>
                </Message>
            )}
        </div>
    );
};

export default UploadComponent;
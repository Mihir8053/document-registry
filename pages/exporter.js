import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Message, FormField, Input } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserAlt, faUserGraduate, faUserTie } from '@fortawesome/free-solid-svg-icons';
import factory from "../ethereum/factory";
import web3 from '../ethereum/web3';
import 'semantic-ui-css/semantic.min.css';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { authenticate } from '../components/ContractUtils';
import { parseCookies } from 'nookies';

const Exporter = ({ deployerAddress }) => {
    const router = useRouter();
    const [chainNumber, setChainNumber] = useState('');
    const [userBalance, setUserBalance] = useState('');
    const [error, setError] = useState('');
    const [loadingAddExporter, setLoadingAddExporter] = useState(false);
    const [exporterAddress, setExporterAddress] = useState('');
    const [exporterName, setExporterName] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [action, setAction] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                let accounts, chainID, chainIDString, balance;

                // Check if MetaMask is available
                if (typeof window !== "undefined" && typeof window.ethereum !== 'undefined') {
                    // Use MetaMask to get accounts, chainID, and balance
                    accounts = await web3.eth.getAccounts();
                    chainID = await web3.eth.getChainId();
                    chainIDString = chainID.toString();
                    balance = await web3.eth.getBalance(accounts[0]);
                } else {
                    // Use Infura node to get chainID and balance
                    chainID = await web3.eth.getChainId();
                    chainIDString = chainID.toString();
                    balance = await web3.eth.getBalance(web3.utils.toChecksumAddress(deployerAddress));
                }

                setChainNumber(chainIDString);
                setUserBalance(web3.utils.fromWei(balance, 'ether'));

                // Set currentUser based on availability of MetaMask
                if (typeof window !== "undefined" && typeof window.ethereum !== 'undefined') {
                    setCurrentUser(accounts[0]);
                } else {
                    setCurrentUser(web3.utils.toChecksumAddress(deployerAddress));
                }
            } catch (error) {
                console.log("error: ", error);
            }
        };

        fetchData();

        // Check if MetaMask is available and subscribe to account change events
        if (typeof window !== "undefined" && typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', handleAccountsChanged);

            // Cleanup function to unsubscribe from account change events
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    const handleAccountsChanged = async (accounts) => {
        setCurrentUser(accounts[0]);
        try {
            const balance = await web3.eth.getBalance(accounts[0]);
            setUserBalance(web3.utils.fromWei(balance, 'ether'));
        } catch (error) {
            console.log("Error fetching balance:", error);
        }
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('Waiting for transaction confirmation');
        try {
            if (action == "add") {
                setMessage('Waiting for block creation');
                await factory.methods.addExporter(exporterAddress, exporterName).send({ from: deployerAddress });
                setMessage('Exporter added successfully!');
            }
            router.push("/exporterslist");
        } catch (error) {
            setError(error.message);
            setMessage('');
        }
        setLoadingAddExporter(false);
    };

    const handleAddExporter = async () => {
        setAction('add');
        setLoadingAddExporter(true);
    };

    return (
        <Layout>
            <Card fluid>
                <Card.Content>
                    <Card.Header>Details</Card.Header>
                    <Card.Description>
                        <p><FontAwesomeIcon icon={faUserAlt} /> Chain Number: {chainNumber}</p>
                        <p><FontAwesomeIcon icon={faUserGraduate} /> User Balance (ETH): {userBalance}</p>
                        <p><FontAwesomeIcon icon={faUserTie} /> Deployer Address: {deployerAddress}</p>
                        <p><FontAwesomeIcon icon={faUserTie} /> Current User: {currentUser}</p>
                    </Card.Description>
                </Card.Content>
            </Card>
            <Form onSubmit={onSubmit} error={!!error}>
                <FormField>
                    <label>Exporter Address</label>
                    <Input value={exporterAddress} onChange={(event) => setExporterAddress(event.target.value)} placeholder="Enter the exporter address" />
                </FormField>
                <FormField>
                    <label>Name of the exporter</label>
                    <Input value={exporterName} onChange={(event) => setExporterName(event.target.value)} placeholder="Enter the exporter name" />
                </FormField>
                {message && <Message info content={message} />}
                <Message error header="Oops!" content={error} />
                <Button primary loading={loadingAddExporter} onClick={handleAddExporter}>Add Exporter</Button>
            </Form>
        </Layout>
    );
};

export const getServerSideProps = async ({ req }) => {
    const cookies = parseCookies({ req });
    const adminAddress = cookies.adminAddress;

    const isAuthenticated = await authenticate(adminAddress);
    if (!isAuthenticated) {
        return {
            redirect: {
                destination: '/admin',
                permanent: false,
            },
        };
    }
    try {
        const deployerAddress = await factory.methods.owner().call();
        return { props: { deployerAddress } };
    } catch (error) {
        console.log("Error fetching data:", error);
        return { props: {} };
    }
};

export default Exporter;

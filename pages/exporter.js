import React, { useEffect, useState } from 'react';
import { Card, Icon } from 'semantic-ui-react';
import { Form, Button, Message, FormField, Input } from 'semantic-ui-react';
import { faChartLine, faUser, faUserAlt, faUserTie, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import factory from "../ethereum/factory";
import web3 from '../ethereum/web3';
import 'semantic-ui-css/semantic.min.css';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

const Exporter = () => {
    const router = useRouter();
    const [chainNumber, setChainNumber] = useState('');
    const [userBalance, setUserBalance] = useState('');
    const [deployerAddress, setDeployerAddress] = useState('');
    const [error, setError] = useState('');
    const [loadingAddExporter, setLoadingAddExporter] = useState(false);
    const [loadingEditExporter, setLoadingEditExporter] = useState(false);
    const [exporterAddress, setExporterAddress] = useState('');
    const [exporterName, setExporterName] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [action, setAction] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accounts = await web3.eth.getAccounts();
                const chainID = await web3.eth.getChainId();
                const chainIDString = chainID.toString();
                const balance = await web3.eth.getBalance(accounts[0]);
                const deployerAddress = await factory.methods.owner().call();
                setChainNumber(chainIDString);
                setUserBalance(web3.utils.fromWei(balance, 'ether'));
                setDeployerAddress(deployerAddress);
                setCurrentUser(accounts[0]);
            } catch (error) {
                console.log("error: ", error);
            }
        };

        // Check if we're running in a browser environment
        if (typeof window !== "undefined") {
            fetchData();
        }

        // Subscribe to MetaMask account change events
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        // Cleanup function to unsubscribe from account change events
        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
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
        try {
            if (action == "add") {
                await factory.methods.addExporter(exporterAddress, exporterName).send({ from: deployerAddress });
            }
            else if (action == "edit") {
                await factory.methods.alterExporter(exporterAddress, exporterName).send({ from: deployerAddress })
            }
            router.push("/exporterslist")
        } catch (error) {
            setError(error.message);
        }
        setLoadingAddExporter(false);
        setLoadingEditExporter(false);
    };

    const handleAddExporter = async () => {
        setAction('add');
        setLoadingAddExporter(true);
        setLoadingEditExporter(false);
    };
    const handleEditExporter = async () => {
        setAction('edit');
        setLoadingAddExporter(false);
        setLoadingEditExporter(true);
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
                    <Input value={exporterAddress} onChange={(event) => setExporterAddress(event.target.value)} />
                </FormField>
                <FormField>
                    <label>Name of the exporter</label>
                    <Input value={exporterName} onChange={(event) => setExporterName(event.target.value)} />
                </FormField>
                <Message error header="Oops!" content={error} />
                <Button primary loading={loadingAddExporter} onClick={handleAddExporter}>Add Exporter</Button>
                <Button primary loading={loadingEditExporter} onClick={handleEditExporter}>Edit Exporter</Button>
            </Form>
        </Layout>
    );
};

export default Exporter;

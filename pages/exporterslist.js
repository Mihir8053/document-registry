import React, { useState, useEffect } from 'react';
import factory from "../ethereum/factory";
import Layout from "../components/Layout";
import 'semantic-ui-css/semantic.min.css';
import web3 from '../ethereum/web3';
import { Table, Button, Dimmer, Loader } from 'semantic-ui-react';
import Link from 'next/link';

const ExportersList = () => {
    const [exporters, setExporters] = useState([]);
    const [deployerAddress, setDeployerAddress] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching data
            try {
                const accounts = await web3.eth.getAccounts();
                const instance = await factory.methods.getApprovedExporters().call();
                const deployerAddress = await factory.methods.owner().call();
                setDeployerAddress(deployerAddress);
                const exporterDetails = await Promise.all(
                    instance.map(async (exporter) => ({
                        address: exporter,
                        info: await factory.methods.getExporterInfo(exporter).call({ from: deployerAddress }),
                    }))
                );
                setExporters(exporterDetails);
            } catch (error) {
                console.log("Error fetching data:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching data
            }
        };
        fetchData();
    }, []);

    const handleDeleteExporter = async (address) => {
        setLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods.deleteExporter(address).send({ from: deployerAddress });
            setExporters(exporters.filter((exporter) => exporter.address !== address));
        } catch (error) {
            console.log("Error deleting exporter:", error);
        }
        setLoading(false);
    };

    return (
        <Layout>
            <div>
                <h1>Exporters List</h1>
                <Link href={"/exporter"} legacyBehavior>
                    <a>Back</a>
                </Link>
                <Dimmer active={loading} inverted>
                    <Loader size='large'>Loading</Loader>
                </Dimmer>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Address</Table.HeaderCell>
                            <Table.HeaderCell>Information</Table.HeaderCell>
                            <Table.HeaderCell>Action</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {exporters.map((exporter) => (
                            <Table.Row key={exporter.address}>
                                <Table.Cell>{exporter.address}</Table.Cell>
                                <Table.Cell>{exporter.info}</Table.Cell>
                                <Table.Cell>
                                    <Button basic color='red' onClick={() => handleDeleteExporter(exporter.address)} loading={loading}>
                                        Delete
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </Layout>
    );
};

export default ExportersList;
import React, { useState, useEffect } from 'react';
import factory from "../ethereum/factory";
import Layout from "../components/Layout";
import 'semantic-ui-css/semantic.min.css';
import web3 from '../ethereum/web3';
import { Container, Table, Button, Dimmer, Loader, Form, Input, Header, Segment } from 'semantic-ui-react';
import Link from 'next/link';

const ExportersList = ({ exporterDetails, deployerAddr }) => {
    const [exporters, setExporters] = useState([]);
    const [deployerAddress, setDeployerAddress] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingExporter, setEditingExporter] = useState(null);
    const [newExporterName, setNewExporterName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching data
            try {
                setDeployerAddress(deployerAddr);
                setExporters(exporterDetails);
            } catch (error) {
                console.log("Error fetching data:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching data
            }
        };
        fetchData();
    }, []);

    const handleEditExporter = (exporter) => {
        setEditingExporter(exporter);
        setNewExporterName(exporter.info);
    };

    const handleUpdateExporter = async (exporter) => {
        setEditLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods.alterExporter(exporter.address, newExporterName).send({ from: deployerAddress });
            setExporters(
                exporters.map((e) =>
                    e.address === exporter.address ? { ...e, info: newExporterName } : e
                )
            );
            setEditingExporter(null);
            setNewExporterName('');
        } catch (error) {
            console.log("Error updating exporter:", error.message);
        }
        setEditLoading(false);
    };

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
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {exporters.map((exporter) => (
                            <Table.Row key={exporter.address}>
                                <Table.Cell>{exporter.address}</Table.Cell>
                                <Table.Cell>
                                    {editingExporter?.address === exporter.address ? (
                                        <Form onSubmit={() => handleUpdateExporter(exporter)}>
                                            <Input
                                                value={newExporterName}
                                                onChange={(e) => setNewExporterName(e.target.value)}
                                            />
                                        </Form>
                                    ) : (
                                        exporter.info
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    {editingExporter?.address === exporter.address ? (
                                        <Button primary type="submit" onClick={() => handleUpdateExporter(exporter)} loading={editLoading}>
                                            Save
                                        </Button>
                                    ) : (
                                        <Button primary onClick={() => handleEditExporter(exporter)} loading={editLoading}>
                                            Edit
                                        </Button>
                                    )}
                                    <Button basic color="red" onClick={() => handleDeleteExporter(exporter.address)} loading={loading}>
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

ExportersList.getInitialProps = async () => {
    try {
        const instance = await factory.methods.getApprovedExporters().call();
        const deployerAddress = await factory.methods.owner().call();
        const exporterDetails = await Promise.all(
            instance.map(async (exporter) => ({
                address: exporter,
                info: await factory.methods.getExporterInfo(exporter).call({ from: deployerAddress }),
            }))
        );

        return { exporterDetails, deployerAddr: deployerAddress };
    } catch (error) {
        console.log("Error fetching data:", error);
        return { exporterDetails: [], deployerAddr: '' };
    }
};

export default ExportersList;
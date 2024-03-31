import { Table, Button } from 'semantic-ui-react';
import Layout from './Layout';
import 'semantic-ui-css/semantic.min.css'
import { useEffect } from 'react';
import factory from "../ethereum/factory"
import { useState } from 'react';

const DocumentTablePage = ({ exporterAddress }) => {
    const [documents, setDocuments] = useState([]);
    const [loadingStates, setLoadingStates] = useState({});
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await factory.methods.getExporterDocuments(exporterAddress).call();
                setDocuments(data);
            } catch (error) {
                console.log(error.message)
            }
        }
        fetchData();
    }, [exporterAddress])
    const unpinFileFromIPFS = async (ipfsHash) => {
        const pinata_api_key = process.env.NEXT_PUBLIC_PINATA_API_KEY;
        const pinata_secret_api_key = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

        try {
            const response = await axios({
                method: 'delete',
                url: `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
                headers: {
                    pinata_api_key: pinata_api_key,
                    pinata_secret_api_key: pinata_secret_api_key,
                },
            });

            console.log('File unpinned:', response.data);
        } catch (error) {
            console.error('Error unpinning file:', error);
        }
    };

    const handleDeleteHash = async (ipfsHash, studentAddress) => {
        setLoadingStates({ ...loadingStates, [ipfsHash]: true }); // Set loading state for the specific document

        try {
            // Call the deleteHash function from the smart contract
            await factory.methods.deleteHash(ipfsHash, studentAddress).send({ from: exporterAddress });

            // Unpin the file from IPFS
            await unpinFileFromIPFS(ipfsHash);

            // Update the documents state to remove the deleted document
            setDocuments(documents.filter(doc => doc.ipfsHash !== ipfsHash));
        } catch (error) {
            console.error('Error deleting hash:', error);
        }

        setLoadingStates({ ...loadingStates, [ipfsHash]: false }); // Reset loading state for the specific document
    };

    return (
        <Layout>
            <h3>List of Documents issued by: {exporterAddress}</h3>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Student Address</Table.HeaderCell>
                        <Table.HeaderCell>Student Name</Table.HeaderCell>
                        <Table.HeaderCell>Document</Table.HeaderCell>
                        <Table.HeaderCell>Action</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {documents.map((doc) => (
                        <Table.Row key={doc.ipfsHash}>
                            <Table.Cell>{doc.studentAddress}</Table.Cell>
                            <Table.Cell>{doc.studentName}</Table.Cell>
                            <Table.Cell>
                                <a href={`https://gateway.ipfs.io/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer">
                                    View Document
                                </a>
                            </Table.Cell>
                            <Table.Cell>
                                {loadingStates[doc.ipfsHash] ? (
                                    <Button basic negative loading>
                                        Delete
                                    </Button>
                                ) : (
                                    <Button basic negative onClick={() => handleDeleteHash(doc.ipfsHash, doc.studentAddress)}>
                                        Delete
                                    </Button>
                                )}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Layout>
    );
}

export default DocumentTablePage;
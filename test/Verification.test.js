const assert = require("assert");
const ganache = require("ganache-cli");
const { Web3, eth } = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

const Verification = require("../ethereum/build/Verification.json");

let accounts;
let verification;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    verification = await new web3.eth.Contract(Verification.abi)
        .deploy({ data: Verification.evm.bytecode.object })
        .send({ from: accounts[0], gas: '5000000', gasPrice: '1000000000' });
});

describe("Verification", () => {
    it("deploys a Verification contract", () => {
        assert.ok(verification.options.address);
    });

    it("sets the owner correctly", async () => {
        const owner = await verification.methods.owner().call();
        assert.equal(owner, accounts[0]);
    });

    it("allows adding an exporter", async () => {
        const exporterAddress = accounts[1];
        const exporterInfo = "Exporter Info";

        await verification.methods.addExporter(exporterAddress, exporterInfo)
            .send({ from: accounts[0], gas: '1000000', gasPrice: '1000000000' });

        const actualInfo = await verification.methods.getExporterInfo(exporterAddress).call();
        assert.equal(actualInfo, exporterInfo);
    });

    it("allows deleting an exporter", async () => {
        const exporterAddress = accounts[1];
        const exporterInfo = "Exporter Info";

        await verification.methods.addExporter(exporterAddress, exporterInfo)
            .send({ from: accounts[0], gas: '1000000', gasPrice: '1000000000' });
        await verification.methods.deleteExporter(exporterAddress)
            .send({ from: accounts[0], gas: '1000000', gasPrice: '1000000000' });

        const actualInfo = await verification.methods.getExporterInfo(exporterAddress).call();
        assert.equal(actualInfo, "");
    });

    it("allows altering exporter info", async () => {
        const exporterAddress = accounts[1];
        const initialInfo = "Initial Info";
        const newInfo = "New Info";

        await verification.methods.addExporter(exporterAddress, initialInfo)
            .send({ from: accounts[0], gas: '1000000', gasPrice: '1000000000' });
        await verification.methods.alterExporter(exporterAddress, newInfo)
            .send({ from: accounts[0], gas: '1000000', gasPrice: '1000000000' });

        const actualInfo = await verification.methods.getExporterInfo(exporterAddress).call();
        assert.equal(actualInfo, newInfo);
    });

    it("allows changing owner", async () => {
        const newOwner = accounts[1];

        await verification.methods.changeOwner(newOwner)
            .send({ from: accounts[0], gas: '1000000', gasPrice: '1000000000' });

        const owner = await verification.methods.owner().call();
        assert.equal(owner, newOwner);
    });

    it("allows adding document hash and issuing certificate", async () => {
        const exporterAddress = accounts[1];
        const exporterInfo = "Exporter Info";
        const studentAddress = accounts[2];
        const studentName = "John Doe";
        const certificateDetails = "Certificate of Completion";

        // Add an Exporter first
        await verification.methods.addExporter(exporterAddress, exporterInfo)
            .send({ from: accounts[0], gas: '1000000', gasPrice: '1000000000' });

        const hash = web3.utils.sha3("testinghash");
        const ipfsHash = "ipfs123";

        // Now call addDocHash as the approved Exporter and issue a certificate
        await verification.methods.addDocHash(hash, ipfsHash, studentAddress, studentName, certificateDetails)
            .send({ from: exporterAddress, gas: '1000000', gasPrice: '1000000000' });

        const blockNumber = await verification.methods.findDocHash(hash).call().then(result => result[0]);
        const timestamp = await verification.methods.findDocHash(hash).call().then(result => result[1]);
        const info = await verification.methods.findDocHash(hash).call().then(result => result[2]);
        const storedIpfsHash = await verification.methods.findDocHash(hash).call().then(result => result[3]);

        assert.equal(info, exporterInfo);
        assert.equal(storedIpfsHash, ipfsHash);

        // Check if the certificate was issued
        const issuedCertificate = await verification.methods.studentCertificates(studentAddress).call();
        assert.equal(issuedCertificate.studentName, studentName);
        assert.equal(issuedCertificate.certificateDetails, certificateDetails);
    });

    it("allows deleting document hash and associated certificate", async () => {
        const exporterAddress = accounts[1];
        const exporterInfo = "Exporter Info";
        const studentAddress = accounts[2];
        const studentName = "John Doe";
        const certificateDetails = "Certificate Details";

        // Add an Exporter
        await verification.methods.addExporter(exporterAddress, exporterInfo)
            .send({ from: accounts[0], gas: '1000000', gasPrice: '1000000000' });

        const hash = web3.utils.sha3("testinghash");
        const ipfsHash = "ipfs123";

        // Add the document hash and issue a certificate
        await verification.methods.addDocHash(hash, ipfsHash, studentAddress, studentName, certificateDetails)
            .send({ from: exporterAddress, gas: '1000000', gasPrice: '1000000000' });

        // Check if the certificate was issued correctly
        const issuedCertificate = await verification.methods.studentCertificates(studentAddress).call();
        assert.equal(issuedCertificate.studentName, studentName);
        assert.equal(issuedCertificate.certificateDetails, certificateDetails);

        // Now delete the document hash
        await verification.methods.deleteHash(hash, studentAddress)
            .send({ from: exporterAddress, gas: '1000000', gasPrice: '1000000000' });

        // Check if the document hash was deleted
        const temp = await verification.methods.findDocHash(hash).call();
        const blockNumber = await verification.methods.findDocHash(hash).call().then(result => result[0]);
        const timestamp = await verification.methods.findDocHash(hash).call().then(result => result[1]);
        const info = await verification.methods.findDocHash(hash).call().then(result => result[2]);
        const storedIpfsHash = await verification.methods.findDocHash(hash).call().then(result => result[3]);

        assert.equal(info, "");
        assert.equal(storedIpfsHash, "");

        // Check if the certificate was removed from the studentCertificates mapping
        const deletedCertificate = await verification.methods.studentCertificates(studentAddress).call();
    });

    it("allows getting exporter info", async () => {
        const exporterAddress = accounts[1];
        const exporterInfo = "Exporter Info";

        await verification.methods.addExporter(exporterAddress, exporterInfo)
            .send({ from: accounts[0], gas: '1000000', gasPrice: '1000000000' });

        const actualInfo = await verification.methods.getExporterInfo(exporterAddress).call();
        assert.equal(actualInfo, exporterInfo);
    });
});
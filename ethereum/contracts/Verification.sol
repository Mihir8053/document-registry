// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Verification {
    constructor() {
        owner = msg.sender;
    }

    struct Record {
        uint blockNumber;
        uint timestamp;
        string info;
        string ipfsHash;
    }

    struct ExporterRecord {
        uint blockNumber;
        string info;
    }

    struct Certificate {
        string ipfs_hash;
        string studentName;
        string certificateDetails;
        uint256 issuedAt;
    }
    struct DocumentDetails {
        string ipfsHash;
        address studentAddress;
        string studentName;
    }

    uint16 public countExporters = 0;
    address public owner;
    mapping(string => Record) private docHashes;
    mapping(address => ExporterRecord) private exporters;
    mapping(address => Certificate) public studentCertificates;
    address[] public approvedExporters;
    mapping(address => DocumentDetails[]) private exporterDocuments;
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert("Caller is not the owner");
        }
        _;
    }

    modifier validAddress(address _addr) {
        assert(_addr != address(0));
        _;
    }

    modifier authorizedExporter(string calldata _doc) {
        require(
            isExporterApproved(msg.sender),
            "Caller is not an approved Exporter"
        );
        if (
            keccak256(abi.encodePacked((exporters[msg.sender].info))) !=
            keccak256(abi.encodePacked((docHashes[_doc].info)))
        ) {
            revert("Caller is not authorized to edit this document");
        }
        _;
    }

    function isExporterApproved(address _exporter) private view returns (bool) {
        return exporters[_exporter].blockNumber != 0;
    }

    function addExporter(
        address _add,
        string calldata _info
    ) external onlyOwner {
        require(!isExporterApproved(_add), "Exporter already added");
        exporters[_add] = ExporterRecord(block.number, _info);
        approvedExporters.push(_add);
        ++countExporters;
    }

    function deleteExporter(address _add) external onlyOwner {
        require(isExporterApproved(_add), "Exporter not found");
        delete exporters[_add];
        for (uint i = 0; i < approvedExporters.length; i++) {
            if (approvedExporters[i] == _add) {
                approvedExporters[i] = approvedExporters[
                    approvedExporters.length - 1
                ];
                approvedExporters.pop();
                break;
            }
        }
        --countExporters;
    }

    function alterExporter(
        address _add,
        string calldata _newInfo
    ) public onlyOwner {
        require(isExporterApproved(_add), "Exporter not found");
        exporters[_add].info = _newInfo;
    }

    function changeOwner(
        address _newOwner
    ) public onlyOwner validAddress(_newOwner) {
        owner = _newOwner;
    }

    event AddHash(address indexed _exporter, string _ipfsHash);

    function addDocHash(
        string calldata hash,
        string calldata _ipfs,
        address _studentAddress,
        string calldata _studentName,
        string calldata _certificateDetails
    ) public {
        require(
            isExporterApproved(msg.sender),
            "Caller is not an approved Exporter"
        );
        require(
            docHashes[hash].blockNumber == 0,
            "Document hash already exists"
        );

        docHashes[hash] = Record(
            block.number,
            block.timestamp,
            exporters[msg.sender].info,
            _ipfs
        );
        emit AddHash(msg.sender, _ipfs);

        // Issue certificate
        require(_studentAddress != address(0), "Invalid student address");
        studentCertificates[_studentAddress] = Certificate(
            hash,
            _studentName,
            _certificateDetails,
            block.timestamp
        );
        exporterDocuments[msg.sender].push(
            DocumentDetails(hash, _studentAddress, _studentName)
        );
    }

    function findDocHash(
        string calldata _hash
    ) external view returns (uint, uint, string memory, string memory) {
        return (
            docHashes[_hash].blockNumber,
            docHashes[_hash].timestamp,
            docHashes[_hash].info,
            docHashes[_hash].ipfsHash
        );
    }

    function deleteHash(
        string calldata _hash,
        address _studentAddress
    ) public authorizedExporter(_hash) {
        require(docHashes[_hash].timestamp != 0, "Document hash not found");
        require(_studentAddress != address(0), "Invalid student address");
        DocumentDetails[] storage exporterDocs = exporterDocuments[msg.sender];
        for (uint i = 0; i < exporterDocs.length; i++) {
            if (
                keccak256(bytes(exporterDocs[i].ipfsHash)) ==
                keccak256(bytes(_hash))
            ) {
                exporterDocs[i] = exporterDocs[exporterDocs.length - 1];
                exporterDocs.pop();
                break;
            }
        }
        // Delete the document hash
        delete docHashes[_hash];

        // Clear the certificate associated with the student address
        delete studentCertificates[_studentAddress];
    }

    function getStudentCertificate(
        address _studentAddress
    ) external view returns (Certificate memory) {
        require(_studentAddress != address(0), "Invalid student address");
        return studentCertificates[_studentAddress];
    }

    function getExporterInfo(
        address _add
    ) external view returns (string memory) {
        return exporters[_add].info;
    }

    function getApprovedExporters() external view returns (address[] memory) {
        return approvedExporters;
    }

    function getExporterDocuments(
        address _exporter
    ) external view returns (DocumentDetails[] memory) {
        require(isExporterApproved(_exporter), "Exporter not found");

        return exporterDocuments[_exporter];
    }
}

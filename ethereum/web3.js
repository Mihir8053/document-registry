import Web3 from "web3";

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    // we are in the browser and metamask is running
    window.ethereum.request({ method: "eth_requestAccounts" });
    web3 = new Web3(window.ethereum);
} else {
    // we are on the server *OR* the user is not running metamask
    const key = process.env.NEXT_PUBLIC_INFURA_API_KEY;
    const network = process.env.NEXT_PUBLIC_ETHEREUM_NETWORK;
    const provider = new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${key}`);
    web3 = new Web3(provider);
}

require("dotenv").config();

export default web3;
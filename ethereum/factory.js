import web3 from "./web3";
import Verifcation from "./build/Verification.json"

const instance = new web3.eth.Contract(
    Verifcation.abi, "0x19d40aa683bf6b4aa5142ad993c2914d97ca2239"
);

export default instance;

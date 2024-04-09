import web3 from "./web3";
import Verifcation from "./build/Verification.json"

const instance = new web3.eth.Contract(
    Verifcation.abi, "0x39f69fa886d0d8169e5597fbb9bdc50c2393b5cb"
);

export default instance;

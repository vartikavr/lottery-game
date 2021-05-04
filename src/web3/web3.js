import Web3 from 'web3';

//rips out the current(injected) provider to that copy of web3
const web3 = new Web3(window.ethereum);

//MetaMask injects a global API into websites visited by its users at window.ethereum
//This API allows websites to request users' Ethereum accounts, read data from blockchains the user is connected to, and suggest that the user sign messages and transactions.

window.ethereum.enable();

export default web3;
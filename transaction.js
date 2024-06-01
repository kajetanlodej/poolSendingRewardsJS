const axios = require('axios');

const {
    POOL_ADDRESS,
    NODE_URL,
    API_KEY
} = require('./config');

async function getEpoch() {
    const response = await axios.post(NODE_URL, {
        jsonrpc: '2.0',
        method: 'dna_epoch',
        params: [],
        id: 1,
        key: API_KEY
    });
    return response.data.result.epoch;
}

async function getNonce(address) {
    const response = await axios.post(NODE_URL, {
        jsonrpc: '2.0',
        method: 'dna_getBalance',
        params: [address],
        id: 1,
        key: API_KEY
    });
    return response.data.result.nonce;
}

async function sendTransaction(epoch, nonce, receiverAddress, amount) {
    const transactionParams = {
        from: '0x71eecdf6414eda0be975c2b748a74ca5018460e4', //change to pool_address later
        to: receiverAddress,
        amount: amount, // amount to send
        maxFee: 1, // max fee 1 - mining, 2-validation reward
        nonce: nonce + 1, // incremented nonce
        epoch: epoch, // current epoch
    };

    const response = await axios.post(NODE_URL, {
        jsonrpc: '2.0',
        method: 'dna_sendTransaction',
        params: [transactionParams],
        id: 1,
        key: API_KEY
    });

    return response.data;
}

module.exports = {
    getEpoch,
    getNonce,
    sendTransaction
};
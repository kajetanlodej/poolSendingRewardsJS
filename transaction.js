const axios = require('axios'); // Importing axios for HTTP requests

// Importing configuration values from the config file
const {
    POOL_ADDRESS,
    NODE_URL,
    API_KEY,
    MAX_RETRIES,
    RETRY_DELAY
} = require('./config');

// Fetches the current epoch number
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

// Fetches the nonce for a given address
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

// Sends a transaction from the pool address to a receiver address
// Retries if the mempool is full, up to a maximum number of retries
async function sendTransaction(epoch, nonce, receiverAddress, amount, maxFee, retries = 0) {
    const transactionParams = {
        from: POOL_ADDRESS,
        to: receiverAddress,
        amount: amount,
        maxFee: maxFee, // 1 - mining rewards, 2 - validation rewards
        nonce: nonce + 1,
        epoch: epoch
    };

    try {
        const response = await axios.post(NODE_URL, {
            jsonrpc: '2.0',
            method: 'dna_sendTransaction',
            params: [transactionParams],
            id: 1,
            key: API_KEY
        });

        if (response.data.error) {
            throw new Error(response.data.error.message);
        }

        return response.data;

    } catch (error) {
        if (error.message.includes('mempool is full') && retries < MAX_RETRIES) {
            console.log(`Mempool is full, retrying transaction in ${RETRY_DELAY / 1000} seconds...`);

            // Wait for the specified delay before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

            // Retry the transaction with an incremented retry count
            return sendTransaction(epoch, nonce, receiverAddress, amount, retries + 1);
        } else {
            throw error; // Rethrow the error if it's not related to mempool or retries are exhausted
        }
    }
}

// Exporting the functions for external usage
module.exports = {
    getEpoch,
    getNonce,
    sendTransaction
};
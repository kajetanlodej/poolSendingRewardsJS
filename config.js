// Base URL for the Idena API
const BASE_API_URL = 'https://api.idena.io/api';

// Address of the pool (replace with your actual pool address)
const POOL_ADDRESS = '0x0118205a91620458a263D20EC8E2f4F562066E35';

// Pool fee for mining rewards (12.5% of the 80% that goes to the pool owner, equaling 10% of the total mining rewards)
const POOL_FEE_MINING = 0.125;

// Pool fee for validation rewards (12.5% of the 80% that goes to the pool owner, equaling 10% of the total validation rewards)
const POOL_FEE_VALIDATION = 0.125;

// Limit for API requests
const LIMIT = 30;

// Maximum number of retries for sending transaction in the case of overloaded mempool
const MAX_RETRIES = 10;

// Delay between retries in milliseconds (30 seconds)
const RETRY_DELAY = 30000;

// URL of the local node via which to send transactions (replace with your actual node url)
const NODE_URL = 'http://localhost:9119';

// API key for accessing the node (replace with your actual node API key)
const API_KEY = '768dqweyipthba5wg1o71oj4xopu8n9';

// Exporting the configuration values for external usage
module.exports = {
    NODE_URL,
    API_KEY,
    BASE_API_URL,
    POOL_ADDRESS,
    POOL_FEE_MINING,
    POOL_FEE_VALIDATION,
    LIMIT,
    MAX_RETRIES,
    RETRY_DELAY
};
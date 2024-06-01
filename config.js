const BASE_API_URL = 'https://api.idena.io/api';
const POOL_ADDRESS = '0x0118205a91620458a263D20EC8E2f4F562066E35';
const POOL_FEE_MINING = 0.125; // 12.5% fee of the 80% that goes to the pool owner from mining rewards, so it equals to 10% of the total mining rewards
const LIMIT = 30;

const NODE_URL = 'http://localhost:9119';
const API_KEY = '768dqweyipthba5wg1o71oj4xopu8n9'; // replace with your actual node API key



module.exports = {
    NODE_URL,
    API_KEY,
    BASE_API_URL,
    POOL_ADDRESS,
    POOL_FEE_MINING,
    LIMIT,
};
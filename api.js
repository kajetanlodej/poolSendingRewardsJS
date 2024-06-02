const axios = require('axios');

// Import configuration values from the config file
const {
    BASE_API_URL,
    LIMIT,
    POOL_ADDRESS
} = require('./config');

// Function to create an axios instance with the base API URL
function apiClient() {
    return axios.create({
        baseURL: BASE_API_URL,
    });
}

// Function to process the API response
async function getResponse(request) {
    const {
        data
    } = await request;
    const {
        result,
        continuationToken,
        error
    } = data;
    if (error) throw error;
    return {
        result,
        continuationToken
    };
}

// Function to get delegators of a pool
async function getPoolDelegators(address, limit, continuationToken) {
    return getResponse(
        apiClient().get(`pool/${address}/delegators`, {
            params: {
                limit,
                continuationToken
            },
        })
    );
}

// Function to get transactions of an address
async function getAddressTransactions(address, limit, continuationToken) {
    return getResponse(
        apiClient().get(`address/${address}/txs`, {
            params: {
                limit,
                continuationToken
            },
        })
    );
}

// Function to get delegations of an address
async function getAddressDelegations(address, limit, continuationToken) {
    return getResponse(
        apiClient().get(`address/${address}/delegations`, {
            params: {
                limit,
                continuationToken
            },
        })
    );
}

// Function to get balance changes of an address
async function getBalanceChanges(address, limit, continuationToken) {
    return getResponse(
        apiClient().get(`address/${address}/balance/changes`, {
            params: {
                limit,
                continuationToken
            },
        })
    );
}

// Function to get delegatee validation results
async function getDelegateeValidationResults(epoch, address, limit, continuationToken) {
    return getResponse(
        apiClient().get(`epoch/${epoch}/address/${address}/delegateerewards`, {
            params: {
                limit,
                continuationToken
            },
        })
    );
}

// Function to get all validation rewards for a delegatee
async function getDelegateesValidationRewards(epoch, address) {
    let Delegatees = [];
    let continuationToken = null;

    do {
        const response = await getDelegateeValidationResults(epoch, address, LIMIT, continuationToken);
        if (response.result) {
            Delegatees = Delegatees.concat(response.result);
        }
        continuationToken = response.continuationToken;
    } while (continuationToken);

    return Delegatees;
}

// Function to get all active delegators of a pool
async function getActiveDelegators(address) {
    let allDelegators = [];
    let continuationToken = null;

    do {
        const response = await getPoolDelegators(address, LIMIT, continuationToken);
        if (response.result) {
            allDelegators = allDelegators.concat(response.result);
        }
        continuationToken = response.continuationToken;
    } while (continuationToken);

    const activeDelegators = allDelegators.filter(delegator =>
        delegator.state !== 'Suspended' &&
        delegator.state !== 'Zombie' &&
        delegator.state !== 'Undefined'
    );

    return activeDelegators;
}

// Function to get the timestamp from which to count mining rewards for a delegator
async function getTimestampToCountMiningRewardsSince(delegatorAddress, delegationTimestamp) {
    let continuationToken = null;

    do {
        const response = await getAddressTransactions(delegatorAddress, LIMIT, continuationToken);
        const transactions = response.result;

        for (const transaction of transactions) {
            if (new Date(transaction.timestamp) < new Date(delegationTimestamp)) {
                return delegationTimestamp;
            }
            if (transaction.type === 'SendTx' && transaction.from === POOL_ADDRESS && transaction.maxFee === 1) {
                return transaction.timestamp;
            }
        }

        continuationToken = response.continuationToken;
    } while (continuationToken);

    return delegationTimestamp;
}

// Exporting the functions for external usage
module.exports = {
    getPoolDelegators,
    getAddressTransactions,
    getAddressDelegations,
    getBalanceChanges,
    getActiveDelegators,
    getTimestampToCountMiningRewardsSince,
    getDelegateesValidationRewards
};
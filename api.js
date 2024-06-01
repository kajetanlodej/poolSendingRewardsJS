const axios = require('axios');

const {
    BASE_API_URL,
    LIMIT,
    POOL_ADDRESS
} = require('./config');

function apiClient() {
    return axios.create({
        baseURL: BASE_API_URL,
    });
}

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

async function getActiveDelegators(address, limit) {
    let allDelegators = [];
    let continuationToken = null;

    do {
        const response = await getPoolDelegators(address, limit, continuationToken);
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

module.exports = {
    getPoolDelegators,
    getAddressTransactions,
    getAddressDelegations,
    getBalanceChanges,
    getActiveDelegators,
    getTimestampToCountMiningRewardsSince
};
// Import necessary configurations and APIs
const {
    POOL_ADDRESS,
    POOL_FEE_MINING,
    LIMIT
} = require('./config');
const {
    getAddressDelegations,
    getBalanceChanges,
    getActiveDelegators,
    getTimestampToCountMiningRewardsSince
} = require('./api');
const {
    getEpoch,
    getNonce,
    sendTransaction
} = require('./transaction');

// Main function to count and send mining rewards to delegatees
async function countAndSendMiningRewards() {
    console.log('Fetching active delegators...');

    // Fetch active delegators from the pool
    const activeDelegators = await getActiveDelegators(POOL_ADDRESS);
    console.log('Active delegators found:', activeDelegators.length);
    const delegatorTimestamps = [];
    console.log('Fetching timestamps...');

    // Loop through each active delegator to get timestamps to count mining rewards since
    for (const delegator of activeDelegators) {
        const addressDelegation = await getAddressDelegations(delegator.address, 1, null);
        const delegationTimestamp = addressDelegation.result[0].delegationTx.timestamp;
        const timestamp = await getTimestampToCountMiningRewardsSince(delegator.address, delegationTimestamp);
        delegatorTimestamps.push([delegator.address, timestamp, 0]);
    }
    console.log('Fetching stake changes for delegators...');

    // Loop through active delegators to calculate total stake changes since the timestamp
    for (let i = 0; i < delegatorTimestamps.length; i++) {
        const [address, timestamp] = delegatorTimestamps[i];
        let totalStakeChange = 0;
        let continuationToken = null;

        // Fetch balance changes and calculate the total relevant stake changes
        do {
            const response = await getBalanceChanges(address, LIMIT, continuationToken);
            const balanceChanges = response.result;
            let shouldContinue = true;
            for (const change of balanceChanges) {
                if (new Date(change.timestamp) < new Date(timestamp)) {
                    shouldContinue = false;
                    break;
                }
                if ((change.reason === 'CommitteeReward' || change.reason === 'ProposerReward')) {
                    const stakeChange = parseFloat(change.stakeNew) - parseFloat(change.stakeOld);
                    totalStakeChange += stakeChange;
                }
            }
            if (!shouldContinue) {
                break;
            }
            continuationToken = response.continuationToken;
        } while (continuationToken);

        // Calculate the amount to send back to the delegator
        const amountToSend = totalStakeChange * 4 * (1 - POOL_FEE_MINING);
        delegatorTimestamps[i][2] = amountToSend;
    }

    // Fetch current epoch and nonce for transactions
    const epoch = await getEpoch();
    let nonce = await getNonce(POOL_ADDRESS); // Change to pool address later

    // Send transactions to delegators with calculated rewards
    for (let i = 0; i < delegatorTimestamps.length; i++) {
        const [address, , amountToSend] = delegatorTimestamps[i];
        console.log(`Sending ${amountToSend} iDNA to ${address}...`);
        try {
            const result = await sendTransaction(epoch, nonce, address, amountToSend, 1);
            console.log('Success! Transaction TX:', result.result, '\n');
        } catch (error) {
            console.error('Transaction failed:', error.message);
        }
        nonce += 1; // Increment nonce for the next transaction
    }
}

// Execute the main function
countAndSendMiningRewards();
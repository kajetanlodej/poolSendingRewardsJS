// Import necessary configurations and APIs
const {
    getDelegateesValidationRewards
} = require('./api');

const {
    getEpoch,
    getNonce,
    sendTransaction
} = require('./transaction');

const {
    POOL_ADDRESS,
    POOL_FEE_VALIDATION,
    LIMIT
} = require('./config');

// Main function to count and send validation rewards to delegatees
async function countAndSendValidationRewards() {
    try {
        // Fetch the current epoch and determine the previous epoch
        const epoch = await getEpoch();
        const previousEpoch = epoch - 1;

        // Fetch validation rewards for the previous epoch
        const delegateeValidationRewards = await getDelegateesValidationRewards(previousEpoch, POOL_ADDRESS);

        // Initialize an array to store the results
        const rewardsSummary = [];

        // Iterate over each delegatee's rewards and sum the balances
        delegateeValidationRewards.forEach(delegator => {
            const amountToSend = delegator.rewards.reduce((sum, reward) => sum + parseFloat(reward.balance), 0);
            rewardsSummary.push([delegator.delegatorAddress, amountToSend * (1 - POOL_FEE_VALIDATION)]);
        });

        //console.log('Rewards Summary:', rewardsSummary);
        let nonce = await getNonce(POOL_ADDRESS);

        // Iterate over the rewards summary and send transactions
        for (let i = 0; i < rewardsSummary.length; i++) {
            const [address, amountToSend] = rewardsSummary[i];
            console.log(`Sending ${amountToSend} iDNA to ${address}...`);
            try {
                // Send the transaction
                const result = await sendTransaction(epoch, nonce, address, amountToSend, 2);
                console.log('Success! Transaction TX:', result.result, '\n');
            } catch (error) {
                console.error('Transaction failed:', error.message);
            }
            nonce += 1; // Increment nonce for the next transaction
        }

    } catch (error) {
        console.error('Error fetching validation rewards:', error);
    }
}

module.exports = {
    countAndSendValidationRewards
};

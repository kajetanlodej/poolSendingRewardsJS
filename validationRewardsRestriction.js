const axios = require('axios');

const {
    getEpochDetails,
    getAssuranceToNotDuplicateValidationRewardsPayments
} = require('./api');

const {
    getEpoch,
} = require('./transaction');

const {
    countAndSendValidationRewards
} = require('./validationRewards')

async function runValidationRewardsPayout() {

    const thisEpochNumber = await getEpoch();
    const lastEpochNumber = thisEpochNumber - 1;
    const lastEpochDetails = await getEpochDetails(lastEpochNumber);
    const approval = await getAssuranceToNotDuplicateValidationRewardsPayments(lastEpochDetails.result.validationTime);

    if (approval) {
        console.log("Validation rewards have not yet been distributed. Distrubuting rewards now.");
        countAndSendValidationRewards();
    } else {
        console.log("A record of the distribution of validation rewards exists. Exiting.");
    }

}

runValidationRewardsPayout();
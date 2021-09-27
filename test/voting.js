var Voting = artifacts.require("./Voting.sol");

contract("Voting", function(accounts){
    var votingInstance;

    it("Initialized two candidates", function(){
        return Voting.deployed().then(function(instance){
            return instance.candidatesCount();
        }).then(function(count){
            assert.equal(count,2);
        });
    });
    it("Initialised candidates with the correct values", function(){
        return Voting.deployed().then(function(instance){
            votingInstance = instance; 
            return votingInstance.candidates(1);
        }).then(function(candidate){
            assert.equal(candidate[0], 1, "Correct ID");
            assert.equal(candidate[1], "Candidate 1", "Correct Name");
            assert.equal(candidate[2], 0, "Correct Vote Count");
            return votingInstance.candidates(2);
        }).then(function(candidate){
            assert.equal(candidate[0], 2, "Correct ID");
            assert.equal(candidate[1], "Candidate 2", "Correct Name");
            assert.equal(candidate[2], 0, "Correct Vote Count");
        });
    });
    it("Allow voter to cast a vote", function(){
        return Voting.deployed().then(function(instance){
            votingInstance = instance;
            candidateId = 1;
            return votingInstance.vote(candidateId, { from: accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
            assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "candidate id is correct");
            return votingInstance.voters(accounts[0]);
        }).then(function(voted){
            assert(voted, "The voter has voted.");
            return votingInstance.candidates(candidateId);
        }).then(function(candidate){
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "Candidate's vote count incremented")
        })
    });
    it("Throw exception for invalid candidates", function(){
        return Voting.deployed().then(function(instance){
            votingInstance = instance;
            return votingInstance.vote(99, {from: accounts[1]})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return votingInstance.candidates(1);
        }).then(function(candidate1){
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
            return votingInstance.candidates(2);
        }).then(function(candidate2){
            var voteCount = candidate2[2];
            assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
        });
    });
    // it("throws an exception for double voting", function(){
    //     return Voting.deployed().then(function(instance){
    //         votingInstance = instance;
    //         candidateId = 2;
    //         votingInstance.vote(candidateId, {from: accounts[3]});
    //         return votingInstance.candidates(candidateId);
    //     }).then(function (candidate){
    //         var voteCount = candidate[2];
    //         assert.equal(voteCount,1, "Accept first vote");
    //         return votingInstance.vote(candidateId, {from: accounts[3]});
    //     }).then(assert.fail).catch(function(error){
    //         assert(error.message.indexOf('revert') >= 0, "error message contains revert");
    //         return votingInstance.candidates(1);
    //     }).then(function(candidate1){
    //         var voteCount = candidate1[2];
    //         assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
    //         return votingInstance.candidates(2);
    //     }).then(function(candidate2){
    //         var voteCount = candidate2[2];
    //         assert.equal(voteCount,1, "candidate 2 did not receieve any votes");
    //     });
    // });
});
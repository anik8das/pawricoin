var PawriToken = artifacts.require('PawriToken')

contract('PawriToken', function(accounts){
    it('checks if the contract was initialized with the correct values', function(){
        return PawriToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.equal(name, "pawricoin", 'does not have the correct name');
            return tokenInstance.symbol()
        }).then(function(symbol){
            assert.equal(symbol, 'PAW', 'does not have the correct symbol');
            return tokenInstance.standard()
        }).then(function(standard){
            assert.equal(standard, 'pawricoin v1.0', 'does not have the correct standard');
        });
    });

    it('checks the total supply upon deployment', function(){
        return PawriToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(),1000000,'the total supply is not 1000000')
            return tokenInstance.balanceOf(accounts[0])
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(),1000000, 'the initial supply is not allocated to the admin account');
        });
    });

    it('checks if the transfers of token ownership is working as expected', function() {
        return PawriToken.deployed().then(function(instance) {
          tokenInstance = instance;
          // Test `require` statement first by transferring something larger than the sender's balance
          return tokenInstance.transfer.call(accounts[1], 99999999999999999999999);
        }).then(assert.fail).catch(function(error) {
          assert(error.message/*.indexOf('revert') >= 0*/, 'error message not obtained on larger than available transaction');
          return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function(success) {
          assert.equal(success, true, 'did not receive true on a legitimate transaction');
          return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function(receipt) {
          assert.equal(receipt.logs.length, 1, 'only one event is not triggered');
          assert.equal(receipt.logs[0].event, 'Transfer', 'the event is not "Transfer"');
          assert.equal(receipt.logs[0].args._from, accounts[0], 'issue in the logs of the account the tokens are transferred from');
          assert.equal(receipt.logs[0].args._to, accounts[1], 'issue in logs of the account the tokens are transferred to');
          assert.equal(receipt.logs[0].args._value, 250000, 'issue in logs of the transfer amount');
          return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 250000, 'did not add the amount to the receiving account');
          return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 750000, 'did not deduct the amount from the sending account');
        });
      });
});
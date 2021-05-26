var PawriToken = artifacts.require('PawriToken')

contract('PawriToken', function(accounts){
    it('the contract was initialized with the correct values', function(){
        return PawriToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.equal(name, "pawricoin", 'does not have the correct name');
            return tokenInstance.symbol()
        }).then(function(symbol){
            assert.equal(symbol, 'PRTY', 'does not have the correct symbol');
            return tokenInstance.standard()
        }).then(function(standard){
            assert.equal(standard, 'pawricoin v1.0', 'does not have the correct standard');
        });
    });

    it('the total supply is initialzed and allocated upon deployment', function(){
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

    it('the transfers of non-delegated token ownership is working as expected', function() {
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

      it('tokens were accurately approved for delegated transfer', function() {
        return PawriToken.deployed().then(function(instance) {
          tokenInstance = instance;
          return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success) {
          assert.equal(success, true, 'it returns false');
          return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
        }).then(function(receipt) {
          assert.equal(receipt.logs.length, 1, 'does not trigger only one event');
          assert.equal(receipt.logs[0].event, 'Approval', 'is not the "Approval" event');
          assert.equal(receipt.logs[0].args._owner, accounts[0], 'does not accurately log the account the tokens are authorized by');
          assert.equal(receipt.logs[0].args._spender, accounts[1], 'does not accurately log the account the tokens are authorized to');
          assert.equal(receipt.logs[0].args._value, 100, 'does not accurately log the transfer amount');
          return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
          assert.equal(allowance.toNumber(), 100, 'issue in storing the allowance for delegated transfer');
        });
      });
    
      it('The delegated token transfers were handled as expected', function() {
        return PawriToken.deployed().then(function(instance) {
          tokenInstance = instance;
          fromAccount = accounts[2];
          toAccount = accounts[3];
          spendingAccount = accounts[4];
          // Transfer some tokens to fromAccount
          return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        }).then(function(receipt) {
          // Approve spendingAccount to spend 10 tokens form fromAccount
          return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(function(receipt) {
          // Try transferring something larger than the sender's balance
          return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, 'transfers value larger than balance');
          // Try transferring something larger than the approved amount
          return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert') >= 0, 'transfers value larger than approved amount');
          return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(success) {
          assert.equal(success, true);
          return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(receipt) {
          assert.equal(receipt.logs.length, 1, 'does not triggers one event');
          assert.equal(receipt.logs[0].event, 'Transfer', 'is not the "Transfer" event');
          assert.equal(receipt.logs[0].args._from, fromAccount, 'does not accurately log the account the tokens are transferred from');
          assert.equal(receipt.logs[0].args._to, toAccount, 'does not accurately log the account the tokens are transferred to');
          assert.equal(receipt.logs[0].args._value, 10, 'does not accurately log the transfer amount');
          return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 90, 'inaccurately deducts the amount from the sending account');
          return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 10, 'fails to accurately add the amount from the receiving account');
          return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance) {
          assert.equal(allowance.toNumber(), 0, 'issues in deducting the amount from the allowance');
        });
      });
});
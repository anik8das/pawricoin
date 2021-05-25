var PawriToken = artifacts.require('PawriToken')

contract('PawriToken', function(accounts){
    it('checks the total supply upon deployment', function(){
        return PawriToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(),1000000,'the total supply is 1000000')
        })
    })
})
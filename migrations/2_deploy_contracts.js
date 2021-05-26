const PawriToken = artifacts.require("PawriToken");
const PawriTokenSale = artifacts.require("PawriTokenSale");

module.exports = function (deployer) {
  deployer.deploy(PawriToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(PawriTokenSale, PawriToken.address, tokenPrice);
  });
};
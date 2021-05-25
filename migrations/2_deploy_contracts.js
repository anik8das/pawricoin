const PawriToken = artifacts.require("PawriToken");

module.exports = function (deployer) {
  deployer.deploy(PawriToken);
};
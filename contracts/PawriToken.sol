// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

contract PawriToken {
    // defining token parameters
    uint256 public totalSupply;
    string public name = "pawricoin";
    string public symbol = "PAW";
    string public standard = "pawricoin v1.0";
    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // defining events
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // defining functions
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // terminating with an error if balance is insuficient
        require(balanceOf[msg.sender] >= _value);

        // adjusting the balances of the sender and receiver accordingly
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // initializing the transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}

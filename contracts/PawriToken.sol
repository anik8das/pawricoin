// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

contract PawriToken {
    // defining token parameters
    uint256 public totalSupply;
    string public name = "pawricoin";
    string public symbol = "PAW";
    string public standard = "pawricoin v1.0";

    // defining maps
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // constructor for initialization
    constructor(uint256 _initialSupply) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // defining required events
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

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

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        // defining allowance
        allowance[msg.sender][_spender] = _value;

        // initializing approval
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // ensuring transaction is legitimate
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        // adjusting the balances accordingly
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        // initializing the transfer
        emit Transfer(_from, _to, _value);

        return true;
    }
}

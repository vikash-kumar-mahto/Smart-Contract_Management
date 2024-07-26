// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bank {
    mapping(address => string) userAccountNames;

    event Transfer(uint256 amount);
    event NameUpdate(string value);

    function setAccountName(string memory _name) public {
        require(
            keccak256(abi.encodePacked(userAccountNames[msg.sender])) !=
                keccak256(abi.encodePacked(_name)),
            "New name is same as old name"
        );
        userAccountNames[msg.sender] = _name;

        emit NameUpdate(userAccountNames[msg.sender]);
    }

    function getAccountName() public view returns (string memory) {
        return userAccountNames[msg.sender];
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function transferFunds(address payable _to) public payable {
        if (msg.sender.balance < msg.value)
            revert
                InsufficientBalance({
                    balance: msg.sender.balance,
                    withdrawAmount: msg.value
                });
        _to.transfer(msg.value);
        emit Transfer(msg.value);
    }

    function getBalance() public view returns (uint256) {
        return msg.sender.balance;
    }
}

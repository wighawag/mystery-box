pragma solidity ^0.4.17;

// Proxy contract for testing throws // from https://truffleframework.com/tutorials/testing-for-throws-in-solidity-tests
contract ThrowProxy {
    address public target;
    bytes data;
    uint256 value;

    constructor(address _target) public {
        target = _target;
    }

    //prime the data using the fallback function.
    function() public payable{
        data = msg.data;
        value = msg.value;
    }

    function execute() public returns (bool) {
        return target.call.value(value)(data);
    }

    function execute(uint256 gasToUse) public returns (bool) {
        require(gasleft() > gasToUse); // TODO consider the extra gas for call
        return target.call.gas(gasToUse).value(value)(data);
    }

    function delegateExecute(uint256 gasToUse) public returns (bool) {
        require(gasleft() > gasToUse);
        return target.delegatecall.gas(gasToUse)(data); // TODO consider the extra gas for delegatecall
    }

    function delegateExecute() public returns (bool) {
        return target.delegatecall(data);
    }
}

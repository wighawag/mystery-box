pragma solidity ^0.4.24;

import "./ERC1155.sol";

/**
    @dev Mintable form of ERC1155
    Shows how easy it is to mint new items
*/
contract ERC1155Mintable is ERC1155 {
    // This would be the creator
    mapping (uint256 => address) public minters;
    uint256 public nonce;

    modifier minterOnly(uint256 _itemId) {
        require(minters[_itemId] == msg.sender);
        _;
    }

    function _mint(string _name, uint256 _totalSupply, string _uri, uint8 _decimals, string _symbol)
        internal 
        returns(uint256 _itemId) 
    {
        _itemId = ++nonce;
        minters[_itemId] = msg.sender; //

        items[_itemId].name = _name;
        items[_itemId].totalSupply = _totalSupply;
        metadataURIs[_itemId] = _uri;
        decimals[_itemId] = _decimals;
        symbols[_itemId] = _symbol;

        // Grant the items to the minter
        items[_itemId].balances[msg.sender] = _totalSupply;
    }
}

pragma solidity ^0.4.24;

import "./erc1155/ERC1155Mintable.sol";
import "./ERC1155MysteryBoxSale.sol";

contract MultiNFTAsset is ERC1155Mintable {

    function approveAndCreateMysteryBox(
        ERC1155MysteryBoxSale _mysteryBoxSale,
        uint256[] _tokenTypes,
        uint256[] _numTokens,
        uint256 _price,
        uint256 _revealBlock
    ) public payable{
        setApprovalForAll(_mysteryBoxSale, true);
        _mysteryBoxSale.createMysteryBoxWithSeller(this, _tokenTypes, _numTokens, _price, _revealBlock, msg.sender);
    }

    function approveAndCreateMysteryBoxUsingBlockDelta(
        ERC1155MysteryBoxSale _mysteryBoxSale,
        uint256[] _tokenTypes,
        uint256[] _numTokens,
        uint256 _price,
        uint256 _revealBlockDelta
    ) public payable{
        setApprovalForAll(_mysteryBoxSale, true);
        _mysteryBoxSale.createMysteryBoxWithSeller(this, _tokenTypes, _numTokens, _price, block.number + _revealBlockDelta, msg.sender);
    }

    function mint(string _uri, uint256 _totalSupply)
        external
        payable
        returns(uint256 _tokenId)
    {
        _tokenId = _mint("", _totalSupply, _uri, 0, "");
    }

    function creatorOf(uint256 _tokenId)
        external
        view
        returns(address)
    {
        return minters[_tokenId];
    }
}
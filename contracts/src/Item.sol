pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "./MysteryBoxSale.sol";

contract Item is ERC721Token {

    uint256 lastTokenId;

    mapping (uint256 => address) tokenIdToCreator;

    constructor() public
        ERC721Token("Item", "Item")
    {}


    function approveAndCreateMysteryBox(
        MysteryBoxSale _mysteryBoxSale,
        uint256[] _tokenIds,
        uint256 _price,
        uint256 _revealBlock
    ) public payable{
        setApprovalForAll(_mysteryBoxSale, true);
        _mysteryBoxSale.createMysteryBoxWithSeller(this, _tokenIds, _price, _revealBlock, msg.sender);
    }

    function approveAndCreateMysteryBoxUsingBlockDelta(
        MysteryBoxSale _mysteryBoxSale,
        uint256[] _tokenIds,
        uint256 _price,
        uint256 _revealBlockDelta
    ) public payable{
        setApprovalForAll(_mysteryBoxSale, true);
        _mysteryBoxSale.createMysteryBoxWithSeller(this, _tokenIds, _price, block.number + _revealBlockDelta, msg.sender);
    }

    function mint(string _uri) 
        public 
        payable
        returns(uint256 _tokenId)
    {
        _tokenId = ++lastTokenId;
        // we could use uint256(keccak256(_uri)) as tokenId 
        // on the other hand lastTokenId combine with numTokemId can replace the nee for the array mechanism of openzeppelin
        tokenIdToCreator[_tokenId] = msg.sender;
        _mint(msg.sender, _tokenId);  
        _setTokenURI(_tokenId, _uri);
    }

    /// @dev Returns the creator of a token
    /// @param _tokenId The token id to find it's creator
    function creatorOf(uint256 _tokenId)
        external
        view
        returns(address)
    {
        return tokenIdToCreator[_tokenId];
    }

    function tokenDataOfOwnerByIndex(
        address _owner,
        uint256 _index
        )
        public
        view
        returns (uint256 tokenId, string uri)
    {
        require(_index < balanceOf(_owner));
        tokenId = ownedTokens[_owner][_index];
        uri = tokenURI(tokenId);
    }
}

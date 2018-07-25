pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

/// @notice We omit a fallback function to prevent accidental sends to this contract.
contract MysteryBoxSale is Pausable, ERC721Holder {
  
    uint256 lastMysteryBoxId;

    struct MysteryBox {
        ERC721 nftContract; //TODO array //TODO suppor tmultiple 721 or support erc1155
        uint256[] tokenIds;
        address seller;
        uint128 price;
        uint64 revealBlock;
    }

    mapping (uint256 => MysteryBox) private mysteryBoxes;

    bytes4 constant InterfaceSignature_ERC721 = bytes4(0x4f558e79);

    // event AuctionCreated(uint256 tokenId, uint256 startingPrice, uint256 endingPrice, uint256 duration);
    // event AuctionSuccessful(uint256 tokenId, uint256 totalPrice, address winner);
    // event AuctionCancelled(uint256 tokenId);

    function withdraw(uint256 mysteryBoxId) 
        external 
    {
        //TODO
    }
    
    function createMysteryBox(
        ERC721 _nftContract, //TODO array
        uint256[] _tokenIds,
        uint256 _price,
        uint256 _revealBlock
    )
        external
    {        
        require(_price == uint256(uint128(_price)), "price too high");
        require(_revealBlock == uint256(uint128(_revealBlock)), "block too high");
        
        require(_revealBlock > block.number /*+ 255*/, "Duration too short");
        
        for(uint8 i=0; i < _tokenIds.length; i++){
            _escrow(msg.sender, _nftContract, _tokenIds[i]);
        }

        mysteryBoxes[++lastMysteryBoxId] = MysteryBox(
            _nftContract,
            _tokenIds, 
            msg.sender,
            uint128(_price), 
            uint64(_revealBlock));
        // emit AuctionCreated(_tokenId, _startingPrice, _endingPrice, _duration);
    }

    function buy(uint256 _mysteryBoxId) 
        external 
        payable
    {
        require(_isMysteryBoxOnSale(_mysteryBoxId), "MysteryBox not on sale");

        require(msg.value >= mysteryBoxes[_mysteryBoxId].price, "Not enough money for the bid");
    }

    //TODO withdraw money for seller

    function getMysteryBox(uint256 _mysteryBoxId) 
        external 
        view 
        returns
    (
        address seller,
        uint256 price,
        uint256 revealBlock
    ) {
        MysteryBox memory mysteryBox = mysteryBoxes[_mysteryBoxId];
        seller = mysteryBox.seller;
        price = mysteryBox.price;
        revealBlock = mysteryBox.revealBlock;
    }

    /// @dev If this contract isn't approved it will throw
    function _escrow(address _ownerOfToken, ERC721 _nftContract, uint256 _tokenId) internal {
        _nftContract.transferFrom(_ownerOfToken, this, _tokenId);
    }

    function _isMysteryBoxOnSale(uint256 _mysteryBoxId) internal view returns(bool) {
        return mysteryBoxes[_mysteryBoxId].revealBlock > block.number;
    }

}
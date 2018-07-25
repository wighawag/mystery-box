pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

/// @notice We omit a fallback function to prevent accidental sends to this contract.
contract MysteryBoxSale is Pausable, ERC721Holder {
  
    uint256 lastMysteryBoxId;
    uint256[] mysteryBoxesList;
    mapping (uint256 => uint256) mysteryBoxesListIndex;

    struct MysteryBox {
        ERC721 nftContract; //TODO array //TODO suppor tmultiple 721 or support erc1155
        uint256[] tokenIds;
        address seller;
        uint128 price;
        uint64 revealBlock;
        address[] participants;
        bytes32 revealHash;
    }

    mapping (uint256 => MysteryBox) private mysteryBoxes;

    bytes4 constant InterfaceSignature_ERC721 = bytes4(0x4f558e79);

    // event AuctionCreated(uint256 tokenId, uint256 startingPrice, uint256 endingPrice, uint256 duration);
    // event AuctionSuccessful(uint256 tokenId, uint256 totalPrice, address winner);
    // event AuctionCancelled(uint256 tokenId);
    
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

        uint256 mysteryBoxId = ++lastMysteryBoxId;
        mysteryBoxes[mysteryBoxId] = MysteryBox(
            _nftContract,
            _tokenIds, 
            msg.sender,
            uint128(_price), 
            uint64(_revealBlock), new address[](0), 0);

        _addMysteryBox(mysteryBoxId);

        // emit AuctionCreated(_tokenId, _startingPrice, _endingPrice, _duration);
    }

    function buy(uint256 _mysteryBoxId) 
        external 
        payable
    {
        require(_isMysteryBoxOnSale(_mysteryBoxId), "MysteryBox not on sale");

        require(msg.value >= mysteryBoxes[_mysteryBoxId].price, "Not enough money for the bid");

        require(mysteryBoxes[_mysteryBoxId].participants.length < mysteryBoxes[_mysteryBoxId].tokenIds.length, "mystery box has been all purchased");

        mysteryBoxes[_mysteryBoxId].participants.push(msg.sender);
    }

    //TODO withdraw money for seller

    function reveal(uint256 _mysteryBoxId)
        external 
    {
        MysteryBox storage mysteryBox = mysteryBoxes[_mysteryBoxId];
        require(block.number > mysteryBox.revealBlock, "mystery box has not finished");
        require(block.number < mysteryBox.revealBlock + 255, "mystery box has expired"); // support looping over modulo 255
        mysteryBox.revealHash = blockhash(mysteryBox.revealBlock);
    }

    function withdrawToSeller(uint256 _mysteryBoxId) 
        external 
    {
        MysteryBox memory mysteryBox = mysteryBoxes[_mysteryBoxId];
        require(mysteryBox.revealHash != 0, "mystery box has not been revealed");
        
        uint256 firstTokenIndex = (uint256(mysteryBox.revealHash) + mysteryBox.participants.length) % mysteryBox.tokenIds.length;
        for(uint8 i = 0; i < mysteryBox.tokenIds.length - mysteryBox.participants.length; i++) { //TODO break loop (gaslimit issue)
            uint256 tokenIndex = (firstTokenIndex + i) % mysteryBox.tokenIds.length;
            mysteryBox.nftContract.transferFrom(this, mysteryBox.seller, mysteryBox.tokenIds[tokenIndex]);
        }
        mysteryBox.seller.transfer(mysteryBox.participants.length * mysteryBox.price);

        //TODO closing
    }

    function withdraw(uint256 _mysteryBoxId, uint256 _participantIndex) 
        external 
    {
        MysteryBox memory mysteryBox = mysteryBoxes[_mysteryBoxId];
        require(mysteryBox.revealHash != 0, "mystery box has not been revealed");
        require(_participantIndex < mysteryBox.participants.length, "particpantIndex to big");
        
        uint256 tokenIndex = (uint256(mysteryBox.revealHash) + _participantIndex) % mysteryBox.tokenIds.length;
        mysteryBox.nftContract.transferFrom(this, mysteryBox.participants[_participantIndex], mysteryBox.tokenIds[tokenIndex]);
    }

    function _addMysteryBox(uint256 _mysteryBoxId) internal{
        uint256 length = mysteryBoxesList.length;
        mysteryBoxesList.push(_mysteryBoxId);
        mysteryBoxesListIndex[_mysteryBoxId] = length;
    }

    function _removeMysteryBox(uint256 _mysteryBoxId) internal{
        require(mysteryBoxesList.length > 0, "no mystery box exists");
        uint256 index = mysteryBoxesListIndex[_mysteryBoxId];
        uint256 lastIndex = mysteryBoxesList.length - 1;
        uint256 lastMysteryBoxIdAdded = mysteryBoxesList[lastIndex];

        mysteryBoxesList[index] = lastMysteryBoxIdAdded;
        mysteryBoxesList[lastIndex] = 0;
        // Note that this will handle single-element arrays. In that case, both index and lastIndex are going to
        // be zero. Then we can make sure that we will remove _mysteryBoxId from the mysteryBoxList since we are first swapping
        // the lastMysteryBoxIdAdded to the first position, and then dropping the element placed in the last position of the list

        mysteryBoxesList.length--;
        mysteryBoxesListIndex[_mysteryBoxId] = 0;
        mysteryBoxesListIndex[lastMysteryBoxIdAdded] = index;
    }

    function numOfMysteryBoxes() public view returns (uint256) {
        return mysteryBoxesList.length;
    }


    // function getMysteryBox(uint256 _mysteryBoxId) 
    //     external 
    //     view 
    //     returns
    // (
    //     // ERC721 nftContract, //TODO array //TODO suppor tmultiple 721 or support erc1155
    //     // uint256[] tokenIds,
    //     address seller,
    //     uint256 price,
    //     uint256 revealBlock
    // ) {
    //     MysteryBox memory mysteryBox = mysteryBoxes[_mysteryBoxId];
    //     // nftContract = mysteryBox.nftContract;
    //     // tokenIds = mysteryBox.tokenIds;
    //     seller = mysteryBox.seller;
    //     price = mysteryBox.price;
    //     revealBlock = mysteryBox.revealBlock;
    // }

    function getMysteryBoxByIndex(
        uint256 _index
    )
        public
        view
        returns
    (
        ERC721 nftContract, //TODO array //TODO suppor tmultiple 721 or support erc1155
        uint256[] tokenIds,
        address seller,
        uint256 price,
        uint256 revealBlock
    ) {
        require(_index < mysteryBoxesList.length);

        MysteryBox memory mysteryBox = mysteryBoxes[mysteryBoxesList[_index]];
        nftContract = mysteryBox.nftContract;
        tokenIds = mysteryBox.tokenIds;
        seller = mysteryBox.seller;
        price = mysteryBox.price;
        revealBlock = mysteryBox.revealBlock;

        // return getMysteryBox(mysteryBoxesList[_index]);
    }

    

    /// @dev If this contract isn't approved it will throw
    function _escrow(address _ownerOfToken, ERC721 _nftContract, uint256 _tokenId) internal {
        _nftContract.transferFrom(_ownerOfToken, this, _tokenId);
    }

    function _isMysteryBoxOnSale(uint256 _mysteryBoxId) internal view returns(bool) {
        return mysteryBoxes[_mysteryBoxId].revealBlock > block.number;
    }

}
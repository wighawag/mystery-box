pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

contract MysteryBoxSale is ERC721Holder {
  
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

    event MysteryBoxCreated(uint256 mysteryBoxId, address seller, uint64 revealBlock);
    event MysteryBoxBought(uint256 mysteryBoxId, address buyer);
    event MysteryBoxRevealed(uint256 mysteryBoxId);
    event MysteryBoxClosed(uint256 mysteryBoxId);
    
    function createMysteryBox(
        ERC721 _nftContract, //TODO array
        uint256[] _tokenIds,
        uint256 _price,
        uint256 _revealBlock
    )
    external
    {   
        createMysteryBoxWithSeller(_nftContract, _tokenIds, _price, _revealBlock, msg.sender);
    }

    function createMysteryBoxWithSeller(
        ERC721 _nftContract, //TODO array
        uint256[] _tokenIds,
        uint256 _price,
        uint256 _revealBlock,
        address _seller
    )
        public
    {        
        require(_price == uint256(uint128(_price)), "price too high");
        require(_revealBlock == uint256(uint128(_revealBlock)), "block too high");
        
        require(_revealBlock > block.number /*+ 255*/, "Duration too short");

        for(uint8 i=0; i < _tokenIds.length; i++){
            address ownerOfToken = _nftContract.ownerOf(_tokenIds[i]);
            require(ownerOfToken == _seller, "only the owner can be seller");
            require(msg.sender == ownerOfToken || msg.sender == address(_nftContract), "Sender is the NFT owner or the nft contract itself"); 
            _escrow(ownerOfToken, _nftContract, _tokenIds[i]); // TODO ERC1155 can save gas on multiNFT
        }

        uint256 mysteryBoxId = ++lastMysteryBoxId;
        mysteryBoxes[mysteryBoxId] = MysteryBox(
            _nftContract,
            _tokenIds, 
            _seller,
            uint128(_price), 
            uint64(_revealBlock), new address[](0), 0);

        _addMysteryBox(mysteryBoxId);

        emit MysteryBoxCreated(mysteryBoxId, _seller, uint64(_revealBlock));
    }


    function buy(uint256 _mysteryBoxId) 
        public
        payable
    {
        gift(_mysteryBoxId, msg.sender);
    }

    function gift(uint256 _mysteryBoxId, address recipient) 
        public
        payable
    {
        require(_isMysteryBoxOnSale(_mysteryBoxId), "MysteryBox not on sale");

        require(msg.value >= mysteryBoxes[_mysteryBoxId].price, "Not enough money for the bid");
        uint256 numParticipants = mysteryBoxes[_mysteryBoxId].participants.length;
        require(numParticipants < mysteryBoxes[_mysteryBoxId].tokenIds.length, "mystery box has been all purchased");

        mysteryBoxes[_mysteryBoxId].participants.push(recipient);
        
        //shuffling as we go by inserting at random //TODO remove push
        if(numParticipants >= 2) {
            uint256 swapIndex = uint256(blockhash(block.number-1)) % numParticipants;
            mysteryBoxes[_mysteryBoxId].participants[numParticipants] = mysteryBoxes[_mysteryBoxId].participants[swapIndex];
            mysteryBoxes[_mysteryBoxId].participants[swapIndex] = recipient;
        }

        emit MysteryBoxBought(_mysteryBoxId, recipient);
    }

    //TODO withdraw money for seller

    function reveal(uint256 _mysteryBoxId) //can be called to anyone , could add reward to ensure it is called in time but the seller should have all interest to do it for its buyer. Without it, he isn't going to get anything
        external 
    {
        require(mysteryBox.revealHash == 0, "mysterybox already revealed");
        MysteryBox storage mysteryBox = mysteryBoxes[_mysteryBoxId];
        require(block.number > mysteryBox.revealBlock, "mystery box has not finished");
        // require(block.number < mysteryBox.revealBlock + 255, "mystery box has expired"); // support looping over modulo 255

        //modulo 255 if too far in the past
        uint256 blockNumber = mysteryBox.revealBlock;
        uint256 fartherBlock = block.number - 255;
        if (fartherBlock > mysteryBox.revealBlock) {
            blockNumber = blockNumber - ((fartherBlock - mysteryBox.revealBlock) % 255);
        }

        mysteryBox.revealHash = blockhash(blockNumber);

        emit MysteryBoxRevealed(_mysteryBoxId);
    }

    function withdrawToSeller(uint256 _mysteryBoxId) 
        external 
    {
        MysteryBox storage mysteryBox = mysteryBoxes[_mysteryBoxId];
        require(mysteryBox.revealHash != 0, "mystery box has not been revealed");
        require(mysteryBox.seller != 0, "mysterybox already closed");

        uint256 firstTokenIndex = (uint256(mysteryBox.revealHash) + mysteryBox.participants.length) % mysteryBox.tokenIds.length;
        for(uint8 i = 0; i < mysteryBox.tokenIds.length - mysteryBox.participants.length; i++) { //TODO break loop (gaslimit issue)
            uint256 tokenIndex = (firstTokenIndex + i) % mysteryBox.tokenIds.length;
            mysteryBox.nftContract.transferFrom(this, mysteryBox.seller, mysteryBox.tokenIds[tokenIndex]);
        }
        mysteryBox.seller.transfer(mysteryBox.participants.length * mysteryBox.price);

        mysteryBox.seller = 0;
        emit MysteryBoxClosed(_mysteryBoxId);
    }

    // seller could pay upfront the cost of calling withdraw and widthraw would reward the caller
    // function withdraw2(uint256 _mysteryBoxId) 
    //     external 
    // {
    //     MysteryBox storage mysteryBox = mysteryBoxes[_mysteryBoxId];
        
    //     require(mysteryBox.revealHash != 0, "mystery box has not been revealed");
    //     uint256 tokenIndex = uint256(keccak256(mysteryBox.revealHash, mysteryBox.participants.length)) % mysteryBox.tokenIds.length;
    //     mysteryBox.nftContract.transferFrom(this, mysteryBox.participants[mysteryBox.participants.length-1], mysteryBox.tokenIds[tokenIndex]);
    //     mysteryBox.participants.length --;
    //     mysteryBox.tokenIds[tokenIndex] = mysteryBox.tokenIds[mysteryBox.tokenIds.length -1];
    //     mysteryBox.tokenIds.length --;
    // }

    function withdraw(uint256 _mysteryBoxId, uint256 _participantIndex) 
        external 
    {
        MysteryBox memory mysteryBox = mysteryBoxes[_mysteryBoxId];
        require(mysteryBox.revealHash != 0, "mystery box has not been revealed");
        require(_participantIndex < mysteryBox.participants.length, "particpantIndex to big");
        
        uint256 tokenId = getTokenReceived(_mysteryBoxId, _participantIndex);
        mysteryBox.nftContract.transferFrom(this, mysteryBox.participants[_participantIndex], tokenId); // will fails if attempted twice
    }

    function getTokenReceived(uint256 _mysteryBoxId, uint256 _participantIndex) public view returns(uint256 tokenId) {
        MysteryBox memory mysteryBox = mysteryBoxes[_mysteryBoxId];
        return mysteryBox.tokenIds[(uint256(mysteryBox.revealHash) + _participantIndex) % mysteryBox.tokenIds.length]; // TODO shuffle indexes on buy
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
        uint256 id,
        ERC721 nftContract, //TODO array //TODO suppor tmultiple 721 or support erc1155
        uint256[] tokenIds,
        address seller,
        uint256 price,
        uint256 revealBlock,
        address[] participants
        // bytes32 revealHash;
    ) {
        require(_index < mysteryBoxesList.length);

        id = mysteryBoxesList[_index];
        MysteryBox memory mysteryBox = mysteryBoxes[id];
        nftContract = mysteryBox.nftContract;
        tokenIds = mysteryBox.tokenIds;
        seller = mysteryBox.seller;
        price = mysteryBox.price;
        revealBlock = mysteryBox.revealBlock;
        participants = mysteryBox.participants;
        // return getMysteryBox(mysteryBoxesList[_index]);
    }

    

    /// @dev If this contract isn't approved it will throw
    function _escrow(address _ownerOfToken, ERC721 _nftContract, uint256 _tokenId) internal {
        _nftContract.transferFrom(_ownerOfToken, this, _tokenId);
    }

    function _isMysteryBoxOnSale(uint256 _mysteryBoxId) internal view returns(bool) {
        return mysteryBoxes[_mysteryBoxId].revealBlock > block.number;
        // TODO check reveal expiry
        // TODO check seller == 0 ?
    }

}
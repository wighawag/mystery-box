pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../src/MysteryBoxSale.sol";
import "../../src/Item.sol";
import "./utils/ThrowProxy.sol";

contract TestMysteryBoxSale {
    Item item = Item(DeployedAddresses.Item());
    MysteryBoxSale mysteryBoxSale = MysteryBoxSale(DeployedAddresses.MysteryBoxSale());

    uint public initialBalance = 1 ether; //Truffle will ensure the Test Contract has that balance

    // function testMysteryBoxCreation() public {
    //     item.mint("ipfs hashed id");
    //     item.setApprovalForAll(mysteryBoxSale, true);
    //     mysteryBoxSale.createMysteryBox(item, [uint256(1)], 100, 33);
    // }

    function testMysteryBoxCreationExists() public {
        uint256 itemId = item.mint("ipfs hashed id");
        item.setApprovalForAll(mysteryBoxSale, true);
        uint256[] memory items = new uint256[](1);
        items[0] = itemId;
        mysteryBoxSale.createMysteryBox(item, items, 100, 33);
        
        // (,,,, uint256 startedAt) = simpleAuction.getMysteryBox(2);
        // Assert.isTrue(startedAt > 0, "Auction has not started");
    }

}

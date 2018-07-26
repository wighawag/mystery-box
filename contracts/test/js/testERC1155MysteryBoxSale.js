const Web3 = require('web3');
const BN = require('bn.js');
const {web3, getMigratedContract, increaseTime, proxy, expectThrow, stopAutoMine, mine, startAutoMine} = require('./utils');

contract('', (accounts) => {
  it('should be able to create an erc1155 mysteryBox', async () => {
    const mysteryBoxSaleContract = await getMigratedContract('ERC1155MysteryBoxSale');
    const itemContract = await getMigratedContract('MultiNFTAsset');

    await itemContract.methods.mint('tree', 1100).send({from: accounts[1], gas: 4000000});
    await itemContract.methods.mint('dog', 100).send({from: accounts[1], gas: 4000000});
    await itemContract.methods.mint('dragon', 1).send({from: accounts[1], gas: 4000000});
    await itemContract.methods.setApprovalForAll(mysteryBoxSaleContract.options.address, true).send({from: accounts[1], gas: 4000000});
    await mysteryBoxSaleContract.methods.createMysteryBox(itemContract.options.address, [1, 2, 3], [100, 10, 1], 100, 33).send({from: accounts[1], gas: 4000000});

    assert.equal(true, true);
  });
});

contract('', (accounts) => {
  it('approve and create an erc1155 mysteryBox', async () => {
    const mysteryBoxSaleContract = await getMigratedContract('ERC1155MysteryBoxSale');
    const itemContract = await getMigratedContract('MultiNFTAsset');
    const seller = accounts[1];
    await itemContract.methods.mint('tree', 1100).send({from: seller, gas: 4000000});
    await itemContract.methods.mint('dog', 100).send({from: seller, gas: 4000000});
    await itemContract.methods.mint('dragon', 1).send({from: seller, gas: 4000000});
    await itemContract.methods.approveAndCreateMysteryBox(mysteryBoxSaleContract.options.address, [1, 2, 3], [100, 10, 1], 100, 33).send({from: seller, gas: 4000000});
    assert.equal(true, true);
  });
});

contract('mysterybox ownership', (accounts) => {
  it('create an mysteryBox', async () => {
    const mysteryBoxSaleContract = await getMigratedContract('ERC1155MysteryBoxSale');
    const itemContract = await getMigratedContract('MultiNFTAsset');
    const seller = Web3.utils.toChecksumAddress(accounts[1]);
    const buyer = Web3.utils.toChecksumAddress(accounts[2]);
    const anyone = Web3.utils.toChecksumAddress(accounts[5]);

    await itemContract.methods.mint('tree', 1100).send({from: seller, gas: 4000000});
    await itemContract.methods.mint('dog', 100).send({from: seller, gas: 4000000});
    await itemContract.methods.mint('horse', 10).send({from: seller, gas: 4000000});
    await itemContract.methods.mint('dragon', 1).send({from: seller, gas: 4000000});

    await itemContract.methods.approveAndCreateMysteryBox(mysteryBoxSaleContract.options.address, [1], [100], 100, 33).send({from: seller, gas: 4000000});

    await mysteryBoxSaleContract.methods.buy(1).send({from: buyer, gas: 4000000, value: 100});

    await stopAutoMine();
    await mine(33);
    await startAutoMine();

    await mysteryBoxSaleContract.methods.reveal(1).send({from: anyone, gas: 4000000});

    await mysteryBoxSaleContract.methods.withdraw(1, [0]).send({from: anyone, gas: 4000000});

    const numAssetsOwned = await itemContract.methods.balanceOf(1, buyer).call();
    assert.equal(numAssetsOwned, 1);
  });
});

contract('mysterybox ownership', (accounts) => {
  it('create an mysteryBox with 3 items', async () => {
    const mysteryBoxSaleContract = await getMigratedContract('ERC1155MysteryBoxSale');
    const itemContract = await getMigratedContract('MultiNFTAsset');
    const seller = Web3.utils.toChecksumAddress(accounts[1]);
    const buyer = Web3.utils.toChecksumAddress(accounts[2]);
    const buyer2 = Web3.utils.toChecksumAddress(accounts[3]);
    const buyer3 = Web3.utils.toChecksumAddress(accounts[4]);
    const anyone = Web3.utils.toChecksumAddress(accounts[5]);

    await itemContract.methods.mint('tree', 1100).send({from: seller, gas: 4000000});
    await itemContract.methods.mint('dog', 100).send({from: seller, gas: 4000000});
    await itemContract.methods.mint('horse', 10).send({from: seller, gas: 4000000});
    await itemContract.methods.mint('dragon', 1).send({from: seller, gas: 4000000});

    await itemContract.methods.approveAndCreateMysteryBox(mysteryBoxSaleContract.options.address, [1, 2, 4], [100, 10, 1], 10000000, 33).send({from: seller, gas: 4000000});

    await mysteryBoxSaleContract.methods.buy(1).send({from: buyer, gas: 4000000, value: 10000000});
    await mysteryBoxSaleContract.methods.buy(1).send({from: buyer2, gas: 4000000, value: 10000000});
    await mysteryBoxSaleContract.methods.buy(1).send({from: buyer3, gas: 4000000, value: 10000000});

    await stopAutoMine();
    await mine(33);
    await startAutoMine();

    await mysteryBoxSaleContract.methods.reveal(1).send({from: anyone, gas: 4000000});

    await mysteryBoxSaleContract.methods.withdraw(1, [0, 1, 2]).send({from: anyone, gas: 4000000});
    // await mysteryBoxSaleContract.methods.withdraw(1, [1]).send({from: anyone, gas: 4000000});
    // await mysteryBoxSaleContract.methods.withdraw(1, [2]).send({from: anyone, gas: 4000000});

    const treeBalanceForBuyer1 = new BN(await itemContract.methods.balanceOf(1, buyer).call());
    const dogBalanceForBuyer1 = new BN(await itemContract.methods.balanceOf(2, buyer).call());
    const horseBalanceForBuyer1 = new BN(await itemContract.methods.balanceOf(3, buyer).call());
    const dragonBalanceForBuyer1 = new BN(await itemContract.methods.balanceOf(4, buyer).call());

    assert.isTrue(treeBalanceForBuyer1.add(dogBalanceForBuyer1).add(horseBalanceForBuyer1).add(dragonBalanceForBuyer1).eq(new BN(1)));

    const sellerBalanceBefore = new BN(await web3.eth.getBalance(seller));
    await mysteryBoxSaleContract.methods.withdrawToSeller(1).send({from: anyone, gas: 4000000});
    const sellerBalanceAfter = new BN(await web3.eth.getBalance(seller));
    assert.isTrue(sellerBalanceAfter.sub(sellerBalanceBefore).gt(new BN(9000000 * 3)));

    // TODO fix : 
    // const treeBalanceForSeller = new BN(await itemContract.methods.balanceOf(1, seller).call());
    // const dogBalanceForSeller = new BN(await itemContract.methods.balanceOf(2, seller).call());
    // const horseBalanceForSeller = new BN(await itemContract.methods.balanceOf(3, seller).call());
    // const dragonBalanceForSeller = new BN(await itemContract.methods.balanceOf(4, seller).call());
    // assert.isTrue(treeBalanceForSeller.add(dogBalanceForSeller).add(horseBalanceForSeller).add(dragonBalanceForSeller).eq(new BN(1100 + 100 + 10 + 1 - 3)));
  });
});

// contract('mysterybox ownership', (accounts) => {
//   it('create an mysteryBox with 3 items not all taken', async () => {
//     const mysteryBoxSaleContract = await getMigratedContract('MysteryBoxSale');
//     const itemContract = await getMigratedContract('Item');
//     const seller = Web3.utils.toChecksumAddress(accounts[1]);
//     const buyer = Web3.utils.toChecksumAddress(accounts[2]);
//     const buyer2 = Web3.utils.toChecksumAddress(accounts[3]);
//     const buyer3 = Web3.utils.toChecksumAddress(accounts[4]);
//     const anyone = Web3.utils.toChecksumAddress(accounts[5]);

//     await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
//     await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
//     await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
//     await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
//     await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
//     await itemContract.methods.approveAndCreateMysteryBox(mysteryBoxSaleContract.options.address, [1, 3, 5], 100000000, 33).send({from: seller, gas: 4000000});

//     await mysteryBoxSaleContract.methods.buy(1).send({from: buyer, gas: 4000000, value: 100000000});

//     await stopAutoMine();
//     await mine(33);
//     await startAutoMine();

//     await mysteryBoxSaleContract.methods.reveal(1).send({from: anyone, gas: 4000000});

//     await mysteryBoxSaleContract.methods.withdraw(1, 0).send({from: anyone, gas: 4000000});

//     const sellerBalanceBefore = new BN(await web3.eth.getBalance(seller));
//     await mysteryBoxSaleContract.methods.withdrawToSeller(1).send({from: anyone, gas: 4000000});
//     const sellerBalanceAfter = new BN(await web3.eth.getBalance(seller));

//     const sellerTokenBalance = await itemContract.methods.balanceOf(seller).call();
//     assert.equal(sellerTokenBalance, 4);
//     assert.isTrue(sellerBalanceAfter.sub(sellerBalanceBefore).gt(new BN(90000000)));
//   });
// });

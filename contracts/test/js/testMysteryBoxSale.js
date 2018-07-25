const Web3 = require('web3');
const BN = require('bn.js');
const {web3, getMigratedContract, increaseTime, proxy, expectThrow, stopAutoMine, mine, startAutoMine} = require('./utils');

contract('', (accounts) => {
  it('should be able to create an mysteryBox', async () => {
    const mysteryBoxSaleContract = await getMigratedContract('MysteryBoxSale');
    const itemContract = await getMigratedContract('Item');

    await itemContract.methods.mint('ipfs hash id').send({from: accounts[1], gas: 4000000});
    await itemContract.methods.setApprovalForAll(mysteryBoxSaleContract.options.address, true).send({from: accounts[1], gas: 4000000});
    await mysteryBoxSaleContract.methods.createMysteryBox(itemContract.options.address, [1], 100, 33).send({from: accounts[1], gas: 4000000});

    assert.equal(true, true);
  });
});

contract('', (accounts) => {
  it('approve and create an mysteryBox', async () => {
    const mysteryBoxSaleContract = await getMigratedContract('MysteryBoxSale');
    const itemContract = await getMigratedContract('Item');
    const seller = accounts[1];
    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.approveAndCreateMysteryBox(mysteryBoxSaleContract.options.address, [1], 100, 33).send({from: seller, gas: 4000000});
    assert.equal(true, true);
  });
});

contract('mysterybox ownership', (accounts) => {
  it('create an mysteryBox', async () => {
    const mysteryBoxSaleContract = await getMigratedContract('MysteryBoxSale');
    const itemContract = await getMigratedContract('Item');
    const seller = Web3.utils.toChecksumAddress(accounts[1]);
    const buyer = Web3.utils.toChecksumAddress(accounts[2]);
    const anyone = Web3.utils.toChecksumAddress(accounts[5]);

    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.approveAndCreateMysteryBox(mysteryBoxSaleContract.options.address, [1], 100, 33).send({from: seller, gas: 4000000});

    await mysteryBoxSaleContract.methods.buy(1).send({from: buyer, gas: 4000000, value: 100});

    await stopAutoMine();
    await mine(33);
    await startAutoMine();

    await mysteryBoxSaleContract.methods.reveal(1).send({from: anyone, gas: 4000000});

    await mysteryBoxSaleContract.methods.withdraw(1, 0).send({from: anyone, gas: 4000000});

    const ownerOfAsset = await itemContract.methods.ownerOf(1).call();
    assert.equal(ownerOfAsset, buyer);
  });
});

contract('mysterybox ownership', (accounts) => {
  it('create an mysteryBox with 3 items', async () => {
    const mysteryBoxSaleContract = await getMigratedContract('MysteryBoxSale');
    const itemContract = await getMigratedContract('Item');
    const seller = Web3.utils.toChecksumAddress(accounts[1]);
    const buyer = Web3.utils.toChecksumAddress(accounts[2]);
    const buyer2 = Web3.utils.toChecksumAddress(accounts[3]);
    const buyer3 = Web3.utils.toChecksumAddress(accounts[4]);
    const anyone = Web3.utils.toChecksumAddress(accounts[5]);

    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.approveAndCreateMysteryBox(mysteryBoxSaleContract.options.address, [1, 3, 5], 100, 33).send({from: seller, gas: 4000000});

    await mysteryBoxSaleContract.methods.buy(1).send({from: buyer, gas: 4000000, value: 100});
    await mysteryBoxSaleContract.methods.buy(1).send({from: buyer2, gas: 4000000, value: 100});
    await mysteryBoxSaleContract.methods.buy(1).send({from: buyer3, gas: 4000000, value: 100});

    await stopAutoMine();
    await mine(33);
    await startAutoMine();

    await mysteryBoxSaleContract.methods.reveal(1).send({from: anyone, gas: 4000000});

    await mysteryBoxSaleContract.methods.withdraw(1, 0).send({from: anyone, gas: 4000000});
    await mysteryBoxSaleContract.methods.withdraw(1, 1).send({from: anyone, gas: 4000000});
    await mysteryBoxSaleContract.methods.withdraw(1, 2).send({from: anyone, gas: 4000000});

    const ownerOfAsset = await itemContract.methods.ownerOf(1).call();
    assert.isFalse(ownerOfAsset === seller);
    assert.isFalse(ownerOfAsset === mysteryBoxSaleContract.options.address);
    assert.isTrue(ownerOfAsset === buyer || ownerOfAsset === buyer2 || ownerOfAsset === buyer3);
  });
});

contract('mysterybox ownership', (accounts) => {
  it('create an mysteryBox with 3 items not all taken', async () => {
    const mysteryBoxSaleContract = await getMigratedContract('MysteryBoxSale');
    const itemContract = await getMigratedContract('Item');
    const seller = Web3.utils.toChecksumAddress(accounts[1]);
    const buyer = Web3.utils.toChecksumAddress(accounts[2]);
    const buyer2 = Web3.utils.toChecksumAddress(accounts[3]);
    const buyer3 = Web3.utils.toChecksumAddress(accounts[4]);
    const anyone = Web3.utils.toChecksumAddress(accounts[5]);

    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.mint('ipfs hash id').send({from: seller, gas: 4000000});
    await itemContract.methods.approveAndCreateMysteryBox(mysteryBoxSaleContract.options.address, [1, 3, 5], 100, 33).send({from: seller, gas: 4000000});

    await mysteryBoxSaleContract.methods.buy(1).send({from: buyer, gas: 4000000, value: 100});

    await stopAutoMine();
    await mine(33);
    await startAutoMine();

    await mysteryBoxSaleContract.methods.reveal(1).send({from: anyone, gas: 4000000});

    await mysteryBoxSaleContract.methods.withdraw(1, 0).send({from: anyone, gas: 4000000});

    await mysteryBoxSaleContract.methods.withdrawToSeller(1).send({from: anyone, gas: 4000000});

    const tokenIdOwnedByBuyer = itemContract.methods.tokenOfOwnerByIndex(buyer, 0);
    if (tokenIdOwnedByBuyer === 1) {
      const ownerOfAsset = await itemContract.methods.ownerOf(2).call();
      assert.equal(ownerOfAsset, seller);
    } else {
      const ownerOfAsset = await itemContract.methods.ownerOf(1).call();
      assert.equal(ownerOfAsset, seller);
    }
  });
});

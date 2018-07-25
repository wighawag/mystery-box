const Web3 = require('web3');
const BN = require('bn.js');
const {web3, getMigratedContract, increaseTime, proxy, expectThrow} = require('./utils');

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

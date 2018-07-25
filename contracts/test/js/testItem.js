const Web3 = require('web3');
const {getMigratedContract} = require('./utils');

contract.only('Item', (accounts) => {

  it('should be able to mint any tokenId', async () => {  
    const itemContract = await getMigratedContract('Item');
    const contentCreator = Web3.utils.toChecksumAddress(accounts[1]);

    await itemContract.methods.mint('ipfs://0xffe2364646456').send({from: contentCreator, gas: 4000000});
    const ownerOfAsset = await itemContract.methods.ownerOf(1).call();
    assert.equal(ownerOfAsset, contentCreator);
  });

  it('should be able to approve all items to another account', async () => {
    const itemContract = await getMigratedContract('Item');
    const contentCreator = Web3.utils.toChecksumAddress(accounts[1]);
    const approvedUser = Web3.utils.toChecksumAddress(accounts[2]);
    const otherUser = Web3.utils.toChecksumAddress(accounts[3]);

    await itemContract.methods.setApprovalForAll(approvedUser, true).send({from: contentCreator, gas: 4000000});
    await itemContract.methods.transferFrom(contentCreator, otherUser, 1).send({from: approvedUser, gas: 4000000});
    const ownerOfAsset = await itemContract.methods.ownerOf(1).call();
    assert.equal(ownerOfAsset, otherUser);
  });

});

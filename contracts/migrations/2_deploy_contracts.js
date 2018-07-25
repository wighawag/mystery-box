const fs = require('fs');
const Item = artifacts.require('Item');
const MysteryBoxSale = artifacts.require('MysteryBoxSale');

const sharedNetworks = {
  "1": true,
  "4": true,
  "42": true
}


module.exports = function(deployer, network) {
  const deployAndSave = createDeployer(deployer, network);
  deployAndSave(Item)
    .then((deployedAssetContract) => deployAndSave(MysteryBoxSale)) //, deployedAssetContract.address))
    .catch(console.error);
};

function createDeployer(deployer, network) {
  return (contractInfo, ...args) => {
    return deployer.deploy(contractInfo, ...args)
      .then((contract) => {
        saveSharedNetworksDeployment(contractInfo, network, contract.address, contract.transactionHash, args);
        return contract;
      });
  }
}

saveSharedNetworksDeployment = (contractInfo, network, contractAddress, transactionHash, args) => {
  if(sharedNetworks[network]){
    console.log("Saving deployment to network " + network);
    const newContractInfo = {...contractInfo._json};
    const updatedNetworks = {};
    for (networkID in newContractInfo.networks) {
      if(sharedNetworks[networkID]) {
        updatedNetworks[networkID] = newContractInfo.networks[networkID];
      }
    }
    updatedNetworks[network] = {
      events: {}, // TODO ?
      links: {}, // TODO ?
      address: contractAddress,
      transactionHash: transactionHash
    };
    newContractInfo.networks = updatedNetworks;
    try {
      fs.mkdirSync('deployments')
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
    fs.writeFileSync('deployments/' + contractInfo.contractName + '.json', JSON.stringify(newContractInfo, null, 2));
  }
}
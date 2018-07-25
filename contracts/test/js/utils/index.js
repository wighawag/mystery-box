const Web3 = require('web3');
const web3 = new Web3();

let providerSet = false;

function getArtifact(contractName) {
  const Artifact = artifacts.require(contractName);
  if (!providerSet) {
    web3.setProvider(Artifact.web3.currentProvider);
    providerSet = true;
  }
  return Artifact;
}

module.exports = {

  web3,

  getContract: (contractName) => {
    const Artifact = getArtifact(contractName);
    const ContractInfo = Artifact._json;
    return new web3.eth.Contract(ContractInfo.abi, {data: ContractInfo.bytecode});
  },

  getMigratedContract: (contractName) => {
    return new Promise((resolve, reject) => {
      const Artifact = getArtifact(contractName);
      const ContractInfo = Artifact._json;
      web3.eth.net.getId()
        .then((networkId) => resolve(new web3.eth.Contract(ContractInfo.abi, Artifact.networks[networkId].address)))
        .catch((error) => reject(error));
    });
  },

  proxy: (proxyContractName, web3Contract, deployOptions) => {
    return new Promise((resolve, reject) => {
      const ProxyArtifact = getArtifact(proxyContractName);
      const ProxyContractInfo = ProxyArtifact._json;
      const Proxy = new web3.eth.Contract(ProxyContractInfo.abi, {data: ProxyContractInfo.bytecode});
      Proxy.deploy({arguments: [web3Contract.options.address]}).send(deployOptions)
        .then((deployedContract) => {
          deployedContract.options.jsonInterface = web3Contract.options.jsonInterface; // use abi of proxied contract
          resolve(deployedContract);
        })
        .catch(reject);
    });
  },

  revertToSnapshot: (id) => {
    return new Promise((resolve, reject) => {
      console.log('reverting to snapshot ' + id + '...');
      web3.currentProvider.sendAsync({
        method: 'evm_revert',
        params: [id],
        jsonrpc: '2.0',
        id: '2'
      }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  saveSnapshot: () => {
    return new Promise((resolve, reject) => {
      console.log('snapshot...');
      web3.currentProvider.sendAsync({
        method: 'evm_snapshot',
        params: [],
        jsonrpc: '2.0',
        id: '2'
      }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.result);
        }
      });
    });
  },

  increaseTime: (timeInSeconds) => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
        method: 'evm_increaseTime',
        params: [timeInSeconds],
        jsonrpc: '2.0',
        id: '2'
      }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  mine: (num = 1) => {
    function mineOnce() {
      return new Promise((resolve, reject) => {
        console.log('mining...');
        web3.currentProvider.sendAsync({
          method: 'evm_mine',
          params: [],
          jsonrpc: '2.0',
          id: '2'
        }, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    const promises = [];
    for (let i = 0; i < num; i++) {
      promises.push(mineOnce());
    }
    return Promise.all(promises);
  },

  stopAutoMine: () => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
        method: 'miner_stop',
        params: [],
        jsonrpc: '2.0',
        id: '3'
      }, (err, result) => {
        if (err) {
          console.log('error while calling miner_stop', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  startAutoMine: () => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
        method: 'miner_start',
        params: [],
        jsonrpc: '2.0',
        id: '3'
      }, (err, result) => {
        if (err) {
          console.log('error while calling miner_start', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Took this from https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/test/helpers/expectThrow.js
  // Doesn't seem to work any more :(
  // Changing to use the invalid opcode error instead works
  expectThrow: async (promise) => {
    try {
      await promise;
    } catch (error) {
      // TODO: Check jump destination to destinguish between a throw
      //       and an actual invalid jump.
      const invalidOpcode = error.message.search('invalid opcode') >= 0;
      // TODO: When we contract A calls contract B, and B throws, instead
      //       of an 'invalid jump', we get an 'out of gas' error. How do
      //       we distinguish this from an actual out of gas event? (The
      //       ganache log actually show an 'invalid jump' event.)
      const outOfGas = error.message.search('out of gas') >= 0;
      const revert = error.message.search('revert') >= 0;
      assert(
        invalidOpcode || outOfGas || revert,
        'Expected throw, got \'' + error + '\' instead',
      );
      return;
    }
    assert.fail('Expected throw not received');
  }
};

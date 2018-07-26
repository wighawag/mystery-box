const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const {
    nodeUrl
} = yargs
    .option('nodeUrl', {
        alias: 'n',
        describe: 'url to ethereum node',
        demandOption: true, // https://rinkeby.infura.io/1gcUgtqyl8GNffAyajky
        type: 'string',
        requiresArg: true
    })
    .help()
    .argv;

console.log({
    nodeUrl
});

const web3 = new Web3(nodeUrl);

function readContractInfoSync(path) {
    return JSON.parse(fs.readFileSync(path).toString());
}

const MysteryBoxSaleContractInfo = readContractInfoSync(path.join(__dirname, '../contracts/build/contracts/MysteryBoxSale.json'));

let networkId = null;

web3.eth.net.getId()
    .then((id) => { 
      networkId = id;
      return web3.eth.getBlock('latest')
    })
    .then((block) => web3.eth.getAccounts())
    .then(connectedToNetwork)
    .catch((error) => {
        console.error(error);
    });

function connectedToNetwork(accounts) {
  console.log(MysteryBoxSaleContractInfo.networks[networkId]);
  setInterval(() => {
    const Contract = new web3.eth.Contract(MysteryBoxSaleContractInfo.abi, MysteryBoxSaleContractInfo.networks[networkId].address);
    Contract.methods.numOfMysteryBoxes().call().then((numBoxes) => {
      for(let i = 0; i < numBoxes; i++) {
        Contract.methods.getMysteryBoxByIndex(i).call().then((mysteryBox) => {
          Contract.methods.reveal(mysteryBox.id).send({from:accounts[0], gas:4000000}).then((receipt) => {
            console.log('RECEIPT');
            console.log(JSON.stringify(receipt));
            // console.log(JSON.stringify(receipt.events[0].returnValues));
          });
        });
        // Contract.methods.isReadyForReveal().call().then((ready) => {
        //   if(ready){
        //     Contract.methods.reveal().send().then((ready) => {
        //   }
        // });
      }
    });
  }, 5000);
}


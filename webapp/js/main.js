
const contractList=[];


function whenDocumentReady(fn) {
  if (document.readyState == "complete") {
    return fn();
  }

  if (window.addEventListener) {
    window.addEventListener("load", fn, false);
  } else if (window.attachEvent) {
    window.attachEvent("onload", fn);
  } else {
    window.onload = fn;
  }
}

function initWeb3(){
  if (typeof web3 !== 'undefined') {
    web3Provider = web3.currentProvider;
  } else {
    web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
  }
  window.web3 = new Web3(web3Provider);
  return new Web3(web3Provider);
}



function initContract(web3){
  return web3.eth.net.getId()
    .then(function(networkId) {
      return axios.all([axios.get('MysteryBoxSale.json'), axios.get('Item.json')])
        .then(function(response){
          var availableNetworksMystery = response[0].data.networks;
          var availableNetworksItem = response[1].data.networks;
          if (availableNetworksMystery[networkId]) {
            console.log("found network " + networkId, availableNetworksMystery[networkId]);
            contractList.push(new web3.eth.Contract(response[0].data.abi,availableNetworksMystery[networkId].address));
            contractList.push(new web3.eth.Contract(response[1].data.abi,availableNetworksItem[networkId].address));
            return contractList
          } else {
            var supportedNetworks = Object.keys(availableNetworks);
            var message = "Please switch to one of the following networks : ";
            if(supportedNetworks.length == 0){
              message = "Contract has not been deployed anywhere yet";
            }else if(supportedNetworks.length == 1){
              message = "Please switch to network with id : ";
            }
            alert(message + supportedNetworks.join(","));
            throw "wrong network";
          }
        });
    });con
}

whenDocumentReady(function() {
  initContract(initWeb3())
    .then(function(contract){
      console.log("contract initialised 1", contract[0]);
      console.log("contract initialised 2", contract[1]._address)
      localStorage.setItem('MysteryBoxAddress', contract[0]._address )
      localStorage.setItem('ItemAddress', contract[1]._address )
      getBalance()
  })
    .catch(function(error){console.error(error);})
});


function addAuction(){

}

function mint(){

  web3.eth.getAccounts().then(account => {
    
    var ItemContract = contractList[1]    
    var promiEvent = ItemContract.methods.mint('ipfs hash id').send({from: account[0], gas: 400000})
    promiEvent.on("transactionHash", function(txHash){
      console.log(`txHash: ${txHash}`)
    });
    promiEvent.then(function(txReceipt){
      console.log(`txRe: ${JSON.stringify(txReceipt)}`)

    });
  });

}

function getBalance(){
  web3.eth.getAccounts().then(account => {
    var ItemContract = contractList[1]    
    ItemContract.methods.balanceOf(account[0]).call().then(numberOfTokens => {
      console.log(`results: ${JSON.stringify(numberOfTokens)}`)
      var tokenList = Array.apply(null, {length: numberOfTokens}).map(Number.call, Number)
      tokenList.forEach(i => {
        ItemContract.methods.tokenDataOfOwnerByIndex(account[0], i).call().then(re =>{
          console.log(`re: ${JSON.stringify(re)}`)
        })
      })
    })
  })
}
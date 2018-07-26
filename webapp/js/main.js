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
    });
}

whenDocumentReady(function() {
  initContract(initWeb3())
    .then(function(contract){
      console.log("contract initialised 1", contract[0]._address);
      console.log("contract initialised 2", contract[1]._address)
      getBalance();
  })
    .catch(function(error){console.error(error);})
});


function getChecked(){
  var selectedList = [];
  $('.form-check-input:checkbox:checked').each(checked =>{
    selectedList.push(checked+1);
  });
  console.log(`selectedList: ${selectedList}`)
  return selectedList

}

function getRevealDelta(){
  var delta = 15;
  // console.log(`selectedList: ${selectedList}`)
  return delta;
}

function getPrice(){
  var price = 20;
  // console.log(`selectedList: ${selectedList}`)
  return price;
}


function addAuction(){

var selectedList = getChecked();
console.log(selectedList);
var ItemContract = contractList[1]

var delta = getRevealDelta();
var price = Big(getPrice()).times(Big("1000000000000000000")).toString();

console.log('price', price);

web3.eth.getAccounts().then(account => {
  var MysteryBoxContractAddress = Web3.utils.toChecksumAddress(contractList[0]._address)    
  var ItemContractAddress = Web3.utils.toChecksumAddress(contractList[1]._address)    
  console.log(`address mys: ${MysteryBoxContractAddress}`)
  console.log(`address item: ${ItemContractAddress}`)
  console.log(`accounts: ${account[0]}`)
  var ItemContract = contractList[1]  
  // TODO items in box length
  var promiEvent = ItemContract.methods.approveAndCreateMysteryBoxUsingBlockDelta(MysteryBoxContractAddress, selectedList, price, delta).send({from: account[0], gas: 400000});
  promiEvent.on("transactionHash", function(txHash){
    console.log(`txHash: ${txHash}`)
  });
  promiEvent.then(function(txReceipt){
    console.log(`txRe: ${JSON.stringify(txReceipt)}`)
  });
  promiEvent.catch(function(error){
    console.log(`error: ${JSON.stringify(error)}`)
  });
})

getBalance()


}

function hashCode (str){
  var hash = 0;
  if (str.length == 0) return hash;
  for (i = 0; i < str.length; i++) {
      char = str.charCodeAt(i);
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function mint(){
  var hh=Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  var uri=`ipfs:${hh}/`
  web3.eth.getAccounts().then(account => {
    var ItemContract = contractList[1]  
    var promiEvent = ItemContract.methods.mint(uri).send({from: account[0], gas: 400000})
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
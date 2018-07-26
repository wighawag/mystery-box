
const contractList=[];
const imgList=[ 'AirBubble.png',
'AmmoRocket.png',
'Antivirus.png',
'Apple.png',
'Arnold.png',
'Arnold_BIG.png',
'Banana.png',
'Barrel.png',
'Bear.png',
'BlackCat.png',
'BritishHouse.png',
'Car.png',
'Caveman_BIG.png',
'ClydeGhost.png',
'CoinX300.png',
'Controllable_BIG.png',
'Deer.png',
'DinoBoss_BIG.png',
'DonutRed.png',
'EctoCar.png',
'Fire.png',
'GizaPyramyd.png',
'Helicopter.png',
'Iglu.png',
'King_BIG.png',
'Meat.png',
'MinerHeart.png',
'Mushroom.png',
'Pacman_BIG.png',
'PineBig.png',
'PurpleGem.png',
'Sheep.png',
'ShrekKnight.png',
'Unicorn.png',
'Zombie.png' ]

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
	/* declare an checkbox array */
	var chkArray = [];
	
	/* look for all checkboes that have a class 'chk' attached to it and check if it was checked */
	$(".form-check-input:checked").each(function() {
		chkArray.push(parseInt($(this).val()));
	});
  
  return chkArray
}

// function getChecked(){
//   var selectedList = [];
//   $('.form-check-input:checkbox:checked').each(checked =>{
//     console.log(`checked: `, checked)
//     selectedList.push(checked+1);
//   });
//   console.log(`selectedList: ${selectedList}`)
//   return selectedList

// }

function getRevealDelta(){
  var delta = parseInt($('#duration').val());
  return delta;
}

function getPrice(){
  var price = $('#price').val();
  return price;
}


function addAuction(){

var selectedList = getChecked();
if(selectedList.length <= 1){
  alert('Need at least 2 items');
  console.log('no item selected');
  return;
}
console.log(selectedList);
var ItemContract = contractList[1]

var delta = getRevealDelta();
var price = Big(getPrice()).times(Big("1000000000000000000")).toString();

console.log('price', price);
console.log('delta', delta);

web3.eth.getAccounts().then(account => {
  var MysteryBoxContractAddress = Web3.utils.toChecksumAddress(contractList[0]._address)    
  var ItemContractAddress = Web3.utils.toChecksumAddress(contractList[1]._address)    
  console.log(`address mys: ${MysteryBoxContractAddress}`)
  console.log(`address item: ${ItemContractAddress}`)
  console.log(`accounts: ${account[0]}`)
  var ItemContract = contractList[1]  
  // TODO items in box length
  var promiEvent = ItemContract.methods.approveAndCreateMysteryBoxUsingBlockDelta(MysteryBoxContractAddress, selectedList, price, delta).send({from: account[0], gas: 800000});
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
$('.form-check').html('');


web3.eth.getAccounts().then(account => {
  var ItemContract = contractList[1]    
  ItemContract.methods.balanceOf(account[0]).call().then(numberOfTokens => {
    console.log(`results: ${JSON.stringify(numberOfTokens)}`)
    var tokenList = Array.apply(null, {length: numberOfTokens}).map(Number.call, Number)
    tokenList.forEach(i => {
      ItemContract.methods.tokenDataOfOwnerByIndex(account[0], i).call().then(re =>{
        console.log(`re: ${JSON.stringify(re)}`)
        if (re.tokenId < imgList.length) {
          var imgFile = imgList[re.tokenId];
        } else {
          var imgFile = imgList[re.tokenId % imgList]
        }

        var $divbody = $(`
            <div class="radio">
            <label for="radio1" class="form-check-label ">
                <input type="checkbox" id="${re.tokenId}" name="radios" value=${re.tokenId} class="form-check-input">
                <img src="images/Sample NFTs/${imgFile}" alt="Smiley face" height="80px" width="80px">
           </label>
         </div>`)
        $(`.form-check`).append($divbody)
      })
    })
  })
})
}
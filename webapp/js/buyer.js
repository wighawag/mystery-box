const contractList=[];
const mysteryBoxList=[];
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
'Zombie.png' ];
const mysteryPrice = 0

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
            console.log(`here ${contractList}`)
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
      console.log("contract initialised My", contract[0]._address);
      console.log("contract initialised It", contract[1]._address)
      displayAuctions();
      displayBoxItems();
  })
    .catch(function(error){console.error(error);})
});


function displayAuctions (){

    var MysteryContract = contractList[0]  
    var ItemContract = contractList[1]  
    web3.eth.getBlock("latest").then(function(latestBlock){
        console.log('latest', latestBlock.number);
        MysteryContract.methods.numOfMysteryBoxes().call().then(numberOfBox => {
            console.log(`number: ${numberOfBox}`);
            var boxList = Array.apply(null, {length: numberOfBox}).map(Number.call, Number)
            var ctr = 0;
            boxList.forEach((id, index, array) => {
                MysteryContract.methods.getMysteryBoxByIndex(id).call().then(element => {
                    // console.log(JSON.stringify(element))
                    var mysteryID = element.tokenIds.length;
                    var mysteryPart = element.participants.length;
                    var mysteryReveal = element.revealBlock - latestBlock.number;
                    var mysteryRevealHash = element.revealHash;
                    console.log(mysteryRevealHash)
                    if(mysteryReveal < 0 && element.participants.length > 0){
                        mysteryReveal = "Revealed"
                        var imageSrc = `images/Sample NFTs/${imgList[element.tokenIds[0]]}` 
                        console.log(`id:${id}`)
                        console.log(`toid: ${element.tokenIds}`)
                        console.log(`imgList[element.tokenIds[id]]: ${imgList[element.tokenIds[0]]}`)
                    } else {
                        var imageSrc= "/landing/img/hero-img.png" //TODO needs link to tokenIds
                    }
                    var mysteryContractAddress = element.price
                
                    var $tablebody = $(`
                            <tr class="spacer"></tr>
                            <tr class="tr-shadow">
                                <td>
                                    <label class="au-checkbox">
                                        <img src="${imageSrc}" style="width:100px;height:100px;" alt="King_BIG" />
                                    </label>
                                </td>
                                <td>
                                    <span class="block-email">${mysteryID}</span>
                                </td>
                                <td>${mysteryPart}</td>
                                <td>${mysteryReveal}</td>
                     

                                <td>${mysteryContractAddress}</td>
    
                            </tr>;
                            `)
                        $tablebody.on('click',_=>{bidAuction(element.id)});
                        $('#auctionTable').find('tbody').append($tablebody);
                    })
                });        
            })
    })
    
    }

function bidAuction(mysteryID){
    window.location.href = `box_details.html#${mysteryID}`
}

function getID (){
    var mysteryID = window.location.hash
    console.log(`${mysteryID.slice(1, mysteryID.length)}`)
    return mysteryID.slice(1, mysteryID.length)
}



function displayBoxItems(){

    var id = getID()


    var MysteryContract = contractList[0];  
    var ItemContract = contractList[1];  
            MysteryContract.methods.getMysteryBox(id).call().then(element => {
                console.log(JSON.stringify(element))
                var mysteryID = element.tokenIds;
                localStorage.setItem('price',element.price)
                $(`#payment-button-amount`).html(element.price)
                mysteryID.forEach(e =>{
                    console.log(`e: ${e}`)
                    ItemContract.methods.tokenURI(e).call().then(re =>{
                        console.log(`re: ${JSON.stringify(re)}`)
                        if (e < imgList.length) {
                            var imgFile = imgList[e];
                          } else {
                            var imgFile = imgList[e % imgList]
                          }
                        var tokenIds = e;
                        var tokenURI = re;
                        var imageSrc= `images/Sample NFTs/${imgFile}` 
                        var $tablebody = $(`
                        <tr class="spacer"></tr>
                        <tr class="tr-shadow">
                        <td>
                        <label class="au-checkbox">
                        <img src="${imageSrc}" style="width:100px;height:100px;" alt="King_BIG" />
                        </label>
                        </td>
                        <td>
                        <span class="block-email">${tokenIds}</span>
                        </td>
                        <td>${tokenURI}</td>
                        </tr>;
                        `)
                        $tablebody.on('click',_=>{bidAuction(element.id)});
                        $('#detailTable').find('tbody').append($tablebody);
                    })
                    })
                })
            }

function bidding(){
    var id = parseInt(getID())
    var price = parseInt(localStorage.getItem('price'));
    console.log(`bid: `, id)
    console.log(`bid: `, price)
    var MysteryContract = contractList[0];

    //TODO get price
    // var price = Big(price).times(Big("1000000000000000000")).toString();
    
    web3.eth.getAccounts().then(account => {        
        var buyer = account[0];
        var promiEvent = MysteryContract.methods.buy(id).send({from: buyer, value: price, gas: 4000000});
        promiEvent.on("transactionHash", function(txHash){
            console.log(`txHash: ${txHash}`)
          });
          promiEvent.then(function(txReceipt){
            console.log(`txRe: ${JSON.stringify(txReceipt)}`)
            alert('Successfully purchased')
            window.location.href = `buying.html`

          });
          promiEvent.catch(function(error){
            console.log(`error: ${JSON.stringify(error)}`)
          });
    })
}






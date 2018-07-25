const contractList=[];
const mysteryBoxList=[];

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
      displayAuctions()
  })
    .catch(function(error){console.error(error);})
});

function displayAuctions (){

    var MysteryContract = contractList[0]  
    MysteryContract.methods.numOfMysteryBoxes().call().then(numberOfBox => {
        console.log(`number: ${numberOfBox}`);
        var boxList = Array.apply(null, {length: numberOfBox}).map(Number.call, Number)
        var ctr = 0;
        boxList.forEach((id, index, array) => {
            MysteryContract.methods.getMysteryBoxByIndex(id).call().then(element => {
                // TODO move to box_details
                // var mysteryName = element.nftContract
                // document.getElementById('NFTContract').innerHTML = 'Mystery: ' + mysteryName;
                var mysteryID = array.length;
                var mysteryDescription = element.tokenIds;
                var mysteryReveal = element.revealBlock
                var mysteryClose = element.revealBlock-5
                var imageSrc= "images/Sample NFTs/King_BIG.png" //TODO needs link to tokenIds
            
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
                            <td class="desc">${mysteryDescription}</td>
                            <td>${mysteryReveal}</td>
                            <td>
                                <span class="status--process">${mysteryClose}</span>
                            </td>
                        </tr>;
                        `)
                    $tablebody.on('click',_=>{bidAuction(mysteryID)});
                    $('#auctionTable').find('tbody').append($tablebody);
                })
            });        
        })
    }

function bidAuction(mysteryID){
    console.log("here?")
    window.location.href = `box_details.html#${mysteryID}`    

}




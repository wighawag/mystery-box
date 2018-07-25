
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
  return new Web3(web3Provider);
}
function initContract(web3){
  return web3.eth.net.getId()
    .then(function(networkId) {
      return axios.get("MysteryBoxSale.json")
        .then(function(response){
          var availableNetworks = response.data.networks;
          if (availableNetworks[networkId]) {
            console.log("found network " + networkId, availableNetworks[networkId]);
            return  new web3.eth.Contract(response.data.abi,availableNetworks[networkId].address)
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
    .then(function(contract){console.log("contract initialised", contract);})
    .catch(function(error){console.error(error);})
});
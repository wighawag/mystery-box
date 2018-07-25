# mystery-box


Install homebrew (mac) 
install yarn - should be 1.7.0

RUNNING GANACHE
cd  mystery-box/contract/ 
yarn --> this installs all dependencies
yarn ganache --> runs ganache on localhost

DEPLOY CONTRACTS
cd mystery-box/contract/
yarn truffle migrate --network localhost


RUNNING WEBAPP
cd mystery-box/
yarn
yarn serve --> serves webapp on localhost
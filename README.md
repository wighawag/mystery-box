# mystery-box

setting up contracts
```
cd contracts
yarn
yarn truffle test
```

serving static webpage locally (via browsersync, see bs-config.json)
```
yarn
yarn serve
```

running ganache on localhost:8545
```
cd contracts
yarn ganache
```

deploying contracts on the running ganache
```
cd contracts
yarn truffle migrate --network localhost
```

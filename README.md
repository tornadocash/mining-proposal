## Tornado cash Proposal #5: Enable Anonymity Mining on the new pools

```
npm install --dev
```

You need to configure:

```
export ETH_RPC=<Ethereum node>
```

Run the test:

```
npx hardhat test
```

Deploy:

```
GAS_PRICE=80 PRIVATE_KEY=<Private key> npx hardhat run --network mainnet scripts/deploy.ts
```

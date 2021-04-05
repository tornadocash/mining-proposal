// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./EnsResolve.sol";
import "./interfaces/IMiner.sol";
import "./interfaces/ITornadoProxy.sol";

contract ProposalSetMiningRates is EnsResolve {
    function executeProposal() public {
        ITornadoProxy proxy = ITornadoProxy(0x722122dF12D4e14e13Ac3b6895a86e84145b6967);
        IMiner miner = IMiner(0x746Aebc06D2aE31B71ac51429A19D54E797878E9);

        IMiner.Rate[] memory rates = new IMiner.Rate[](11);
        rates[0] = IMiner.Rate({ instance: bytes32(0x95ad5771ba164db3fc73cc74d4436cb6a6babd7a2774911c69d8caae30410982), value: 10 }); // dai-100.tornadocash.eth
        rates[1] = IMiner.Rate({ instance: bytes32(0x109d0334da83a2c3a687972cc806b0eda52ee7a30f3e44e77b39ae2a20248321), value: 10 }); // dai-1000.tornadocash.eth
        rates[2] = IMiner.Rate({ instance: bytes32(0x3de4b55be5058f538617d5a6a72bff5b5850a239424b34cc5271021cfcc4ccc8), value: 10 }); // dai-10000.tornadocash.eth
        rates[3] = IMiner.Rate({ instance: bytes32(0xf50559e0d2f0213bcb8c67ad45b93308b46b9abdd5ca9c7044efc025fc557f59), value: 10 }); // dai-100000.tornadocash.eth
        rates[4] = IMiner.Rate({ instance: bytes32(0xc9395879ffcee571b0dfd062153b27d62a6617e0f272515f2eb6259fe829c3df), value: 10 }); // cdai-5000.tornadocash.eth
        rates[5] = IMiner.Rate({ instance: bytes32(0xf840ad6cba4dbbab0fa58a13b092556cd53a6eeff716a3c4a41d860a888b6155), value: 10 }); // cdai-50000.tornadocash.eth
        rates[6] = IMiner.Rate({ instance: bytes32(0x8e52ade66daf81cf3f50053e9bfca86a57d685eca96bf6c0b45da481806952b1), value: 10 }); // cdai-500000.tornadocash.eth
        rates[7] = IMiner.Rate({ instance: bytes32(0x0b86f5b8c2f9dcd95382a469480b35302eead707f3fd36359e346b59f3591de2), value: 10 }); // cdai-5000000.tornadocash.eth
        rates[8] = IMiner.Rate({ instance: bytes32(0x10ca74c40211fa1598f0531f35c7d54c19c808082aad53c72ad1fb22ea94ab83), value: 10 }); // wbtc-01.tornadocash.eth
        rates[9] = IMiner.Rate({ instance: bytes32(0x6cea0cba8e46fc4ffaf837edf544ba36e5a35503636c6bca4578e965ab640e2c), value: 10 }); // wbtc-1.tornadocash.eth
        rates[10] = IMiner.Rate({ instance: bytes32(0x82c57bf2f80547b5e31b92c1f92c4f8bc02ad0df3d27326373e9f55adda5bd15), value: 10 }); // wbtc-10.tornadocash.eth

        // Enable mining on tornado instances
        for (uint256 i = 0; i < rates.length; i++) {
            address addr = resolve(rates[i].instance);
            ITornadoProxy.Instance memory instance = proxy.instances(addr);
            instance.state = ITornadoProxy.InstanceState.MINEABLE;
            proxy.updateInstance(ITornadoProxy.Tornado({
                addr: addr,
                instance: instance
            }));
        }

        // Set AP rates on mining contract
        miner.setRates(rates);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

interface ITornadoProxy {
    enum InstanceState {DISABLED, ENABLED, MINEABLE}

    struct Instance {
        bool isERC20;
        address token;
        InstanceState state;
    }

    struct Tornado {
        address addr;
        Instance instance;
    }

    function updateInstance(Tornado calldata _tornado) external;

    function instances(address _tornado) external returns (Instance memory);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

interface IMiner {
    struct Rate {
        bytes32 instance;
        uint256 value;
    }

    function setRates(Rate[] memory _rates) external;
}

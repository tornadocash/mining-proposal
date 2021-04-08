// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface ENS {
    function resolver(bytes32 node) external view returns (Resolver);
}

interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

contract EnsResolve {
    function resolve(bytes32 node) public view virtual returns (address) {
        return ENS(0x8595bFb0D940DfEDC98943FA8a907091203f25EE).resolver(node).addr(node);
    }
}

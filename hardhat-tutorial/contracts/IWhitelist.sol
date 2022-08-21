// we are not copy pasting whitelist sol contract from previous dapp and just using its interface is bcz we dont want to use extra gas in calculating all functions as we only need some functions
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface IWhitelist {
    function whitelistedAddresses(address) external view returns (bool);
}
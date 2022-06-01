//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "./MerkleWhitelist.sol";
import "./ERC721A.sol";

contract NFT is ERC721A, Ownable, MerkleWhitelist {
    // public mint price
    uint256 public MINT_PRICE = 0.2 ether;

    // free mint suppoly
    uint256 public FREE_MINT_QUANTITY = 100;

    // public mint suppoly
    uint256 public PUBLIC_MINT_QUANTITY = 400;

    // withdraw addresses - replace with actual address
    address addr1 = 0xfc86A64a8DE22CF25410F7601AcBd8d6630Da93D;
    address addr2 = 0x4265de963cdd60629d03FEE2cd3285e6d5ff6015;
    address addr3 = 0x1b33EBa79c4DD7243E5a3456fc497b930Db054b2;
    address addr4 = 0x92d79ccaCE3FC606845f3A66c9AeD75d8e5487A9;

    // track whitelist addresses that have already claimed their mint
    mapping(address => bool) public whitelistClaimed;

    /// @notice _tokenIds to keep track of the number of NFTs minted
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(bytes32 _rootHash) ERC721A("Merkle", "MRKL") {
        publicWhitelistMerkleRoot = _rootHash;
        // mint to team addresses
    }

    function publicWhitelistMint(
        bytes32[] calldata _merkleProof,
        uint256 quantity
    ) public payable onlyPublicWhitelist(_merkleProof) {
        require(quantity > 0 && quantity < 6, "Can only mint max 5 NFTs!");
        require(msg.value >= quantity * MINT_PRICE, "Did not send enough eth.");
        // check total supply just in case
        // check mint time
        _safeMint(msg.sender, quantity);
    }

    function updateRootHash(bytes32 _newRootHash) public onlyOwner {
        publicWhitelistMerkleRoot = _newRootHash;
    }

    function withdrawFunds() public onlyOwner {
        // check contract funds >0
        uint256 _amount = address(this).balance / 4;
        require(_amount > 0, "Contract has no Ether");
        require(payable(addr1).send(_amount));
        require(payable(addr2).send(_amount));
        require(payable(addr3).send(_amount));
        require(payable(addr4).send(_amount));
    }
}

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
    address addr1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // team wallet 1
    address addr2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // team wallet 2
    address addr3 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906; // public whitelist wallet 1
    address addr4 = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65; // public whitelist wallet 2

    // track whitelist addresses that have already claimed their mint
    mapping(address => bool) public publicWhitelistClaimed;

    /// @notice _tokenIds to keep track of the number of NFTs minted
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(bytes32 _rootHash) ERC721A("Merkle", "MRKL") {
        publicWhitelistMerkleRoot = _rootHash;
        _safeMint(addr1, 5);
        _safeMint(addr2, 5);
        _safeMint(addr3, 5);
        _safeMint(addr4, 5);
    }

    function publicWhitelistMint(
        bytes32[] calldata _merkleProof,
        uint256 quantity
    ) public payable onlyPublicWhitelist(_merkleProof) {
        require(quantity > 0 && quantity < 6, "Can only mint max 5 NFTs!");
        require(msg.value >= quantity * MINT_PRICE, "Did not send enough eth.");
        // check total supply just in case
        // check if contract is unpaused
        publicWhitelistClaimed[msg.sender] = true;
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

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "./MerkleWhitelist.sol";
import "./ERC721A.sol";

contract NFT is ERC721A, Ownable, MerkleWhitelist {
    // root hash of the whitelist merkle tree
    bytes32 public merkleRoot;

    // track whitelist addresses that have already claimed their mint
    mapping(address => bool) public whitelistClaimed;

    /// @notice _tokenIds to keep track of the number of NFTs minted
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(bytes32 _rootHash) ERC721A("Merkle", "MRKL") {
        // console.log("Deploying merkle tree whitelist nft");
        publicWhitelistMerkleRoot = _rootHash;
    }

    function publicWhitelistMint(bytes32[] calldata _merkleProof)
        public
        onlyPublicWhitelist(_merkleProof)
    {
        console.log("mint success");
    }

    function updateRootHash(bytes32 _newRootHash) public onlyOwner {
        merkleRoot = _newRootHash;
    }
}

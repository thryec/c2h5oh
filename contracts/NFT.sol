//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract NFT is ERC721URIStorage, Ownable {
    // root hash of the whitelist merkle tree
    bytes32 public merkleRoot;

    // track whitelist addresses that have already claimed their mint
    mapping(address => bool) public whitelistClaimed;

    /// @notice _tokenIds to keep track of the number of NFTs minted
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(bytes32 _rootHash) ERC721("Merkle", "MRKL") {
        // console.log("Deploying merkle tree whitelist nft");
        merkleRoot = _rootHash;
    }

    function whitelistMint(bytes32[] calldata _merkleProof) public {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        bool proof = MerkleProof.verify(_merkleProof, merkleRoot, leaf);
        console.log("merkle proof: ", proof);
        // require(proof, "Invalid whitelist address");
        // mint
    }

    function updateRootHash(bytes32 _newRootHash) public onlyOwner {
        merkleRoot = _newRootHash;
    }
}

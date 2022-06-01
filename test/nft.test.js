const { expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

describe('MerkleNFT', () => {
  let whitelist1
  let whitelist2
  let whitelist3
  let whitelist4
  let unwhitelisted

  let merkleTree
  let nft
  let proof

  beforeEach(async () => {
    ;[whitelist1, whitelist2, whitelist3, whitelist4, unwhitelisted] = await ethers.getSigners()
    const whitelist = [whitelist1, whitelist2, whitelist3, whitelist4]
    const leafNodes = whitelist.map((addr) => keccak256(addr.address))
    merkleTree = new MerkleTree(leafNodes, keccak256, { sort: true })
    const rootHash = merkleTree.getRoot()

    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy(rootHash)
    await nft.deployed()
  })

  describe('Whitelist Mint', async () => {
    it('allows whitelisted address to mint', async () => {
      proof = merkleTree.getHexProof(keccak256(whitelist1.address))
      await nft.connect(whitelist1).whitelistMint(proof)
    })

    it('does not allow non-whitelisted address to mint', async () => {
      const badProof = merkleTree.getHexProof(keccak256(unwhitelisted.address))
      await expectRevert(
        nft.connect(unwhitelisted).whitelistMint(badProof),
        'MerkleWhitelist: Caller is not whitelisted',
      )
    })

    it('requires user to send in correct amount of Ether', async () => {})
  })
})

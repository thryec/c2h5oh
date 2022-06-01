// const { constants, expectRevert } = require('@openzeppelin/test-helpers')
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

  let nft
  let goodProof
  let badProof

  beforeEach(async () => {
    ;[whitelist1, whitelist2, whitelist3, whitelist4, unwhitelisted] = await ethers.getSigners()
    const whitelist = [whitelist1, whitelist2, whitelist3, whitelist4]
    const leafNodes = whitelist.map((addr) => keccak256(addr.address))
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sort: true })
    const rootHash = merkleTree.getRoot()
    goodProof = merkleTree.getHexProof(whitelist1.address)
    console.log('good proof: ', goodProof)

    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy(rootHash)
    await nft.deployed()
  })

  describe('Minting', () => {
    it('allows whitelisted address to mint', async () => {
      await nft.connect(whitelist1).whitelistMint(goodProof)
    })

    it('does not allow un-whitelisted address to mint', async () => {
      console.log('bad proof: ', badProof)
      await nft.connect(unwhitelisted).whitelistMint(goodProof)
    })
  })
})

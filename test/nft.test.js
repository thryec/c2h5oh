const { expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

const NAME = 'Merkle'
const SYMBOL = 'MRKL'
const TOTAL_SUPPLY = 400

describe('Merkle Whitelist NFT', () => {
  let deployer
  let whitelist1
  let whitelist2
  let whitelist3
  let unwhitelisted

  let merkleTree
  let nft
  let proof

  const mintPrice = ethers.utils.parseEther('0.2')

  beforeEach(async () => {
    ;[deployer, whitelist1, whitelist2, whitelist3, unwhitelisted] = await ethers.getSigners()
    const whitelist = [whitelist1, whitelist2, whitelist3]
    const leafNodes = whitelist.map((addr) => keccak256(addr.address))
    merkleTree = new MerkleTree(leafNodes, keccak256, { sort: true })
    const rootHash = merkleTree.getRoot()

    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy(rootHash)
    await nft.deployed()
  })

  describe('Deployment', (async) => {
    it('sets contract deployer as owner of contract', async () => {
      expect(await nft.owner()).to.equal(deployer.address)
    })
    it('sets token name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })
    it('sets token symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })
  })

  // describe('Free Mint', (async) => {
  //   it('allows free mint whitelist address to mint', async () => {})
  //   it('does not allow non free mint whitelist address to mint', async () => {})
  //   it('does not require ether to be sent', async () => {})

  // })

  describe('Public Whitelist Mint', async () => {
    it('allows public whitelisted address to mint', async () => {
      const mintQty = 2
      proof = merkleTree.getHexProof(keccak256(whitelist1.address))
      await nft.connect(whitelist1).publicWhitelistMint(proof, mintQty, { value: mintPrice.mul(2) })
    })

    it('does not allow public non-whitelisted address to mint', async () => {
      const badProof = merkleTree.getHexProof(keccak256(unwhitelisted.address))
      await expectRevert(
        nft.connect(unwhitelisted).publicWhitelistMint(badProof),
        'PublicMerkleWhitelist: Caller is not whitelisted',
      )
    })

    it('requires user to send in correct amount of Ether', async () => {})
  })

  // describe('Free Whitelist Mint', (async) => {
  //   it('only allows contract owner to withdraw funds', async () => {})
  // })

  // describe('Withdrawing Funds', (async) => {
  //   it('only allows contract owner to withdraw funds', async () => {})
  //   it('withdraws correct amount of ether to each wallet address', async () => {})
  //   it('only executes withdrawal if contract contains funds', async () => {})
  // })
})

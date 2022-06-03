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
  let teamWallet1
  let teamWallet2
  let pubWhitelist1
  let pubWhitelist2
  let freeWhitelist1
  let freeWhitelist2
  let unwhitelisted

  let pubMerkleTree
  let nft
  let proof

  const mintPrice = ethers.utils.parseEther('0.2')

  beforeEach(async () => {
    ;[
      deployer,
      teamWallet1,
      teamWallet2,
      pubWhitelist1,
      pubWhitelist2,
      freeWhitelist1,
      freeWhitelist2,
      unwhitelisted,
    ] = await ethers.getSigners()
    const pubWhitelist = [pubWhitelist1, pubWhitelist2]
    const pubLeafNodes = pubWhitelist.map((addr) => keccak256(addr.address))
    pubMerkleTree = new MerkleTree(pubLeafNodes, keccak256, { sort: true })
    const pubRootHash = pubMerkleTree.getRoot()

    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy(pubRootHash)
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

    it('mints 5 tokens to each team address', async () => {
      expect(await nft.balanceOf(teamWallet1.address)).to.equal(5)
      expect(await nft.balanceOf(teamWallet2.address)).to.equal(5)
      expect(await nft.balanceOf(pubWhitelist1.address)).to.equal(5)
      expect(await nft.balanceOf(pubWhitelist2.address)).to.equal(5)
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
      proof = pubMerkleTree.getHexProof(keccak256(pubWhitelist1.address))
      await nft
        .connect(pubWhitelist1)
        .publicWhitelistMint(proof, mintQty, { value: mintPrice.mul(2) })
    })

    it('does not allow public address to mint twice', async () => {})

    it('does not allow public non-whitelisted address to mint', async () => {
      const badProof = pubMerkleTree.getHexProof(keccak256(unwhitelisted.address))
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

  // describe('Reading Token Data', async () => {
  //   it('Returns token IDs owned by user', async () => {})
  //   it('Returns token URI by ID', async () => {})
  //   it('Returns baseURI', async () => {})
  //   it('Returns total supply of collection', async () => {})
  // })

  // describe('Updating Whitelists', async () => {
  //   it('Successfully updates public mint whitelist', async () => {})
  //   it('Successfully updates free mint whitelist', async () => {})
  // })

  // describe('Withdrawing Funds', (async) => {
  //   it('only allows contract owner to withdraw funds', async () => {})
  //   it('withdraws correct amount of ether to each wallet address', async () => {})
  //   it('only executes withdrawal if contract contains funds', async () => {})
  // })
})

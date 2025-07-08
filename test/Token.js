const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HypeToken", function () {
  let token, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("HypeToken");
    token = await Token.deploy(1000000);
    await token.waitForDeployment();
  });

  it("should assign total supply to owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    const totalSupply = await token.totalSupply();
    expect(ownerBalance).to.equal(totalSupply);
  });

  it("should transfer tokens between accounts", async function () {
    await token.transfer(addr1.address, 1000);
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.equal(1000);
  });

  it("should allow approved transferFrom", async function () {
    await token.approve(addr1.address, 500);
    await token.connect(addr1).transferFrom(owner.address, addr2.address, 500);
    const balance = await token.balanceOf(addr2.address);
    expect(balance).to.equal(500);
  });

  it("should mint tokens by owner", async function () {
    await token.mint(addr1.address, 2000);
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.equal(2000 * (10 ** 18));
    const totalSupply = await token.totalSupply();
    expect(totalSupply).to.equal(1000000 * 1e18 + 2000 * 1e18);
  });

  it("should not allow minting from non-owner", async function () {
    await expect(token.connect(addr1).mint(addr1.address, 1000)).to.be.revertedWith("Not owner");
  });

  it("should burn tokens from caller", async function () {
    await token.transfer(addr1.address, 1000);
    await token.connect(addr1).burn(500);
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.equal(500);
  });

  it("should pause and block transfers", async function () {
    await token.pause();
    await expect(token.transfer(addr1.address, 100)).to.be.revertedWith("Token is paused");
  });

  it("should allow unpausing", async function () {
    await token.pause();
    await token.unpause();
    await token.transfer(addr1.address, 100);
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.equal(100);
  });

  it("should transfer ownership", async function () {
    await token.transferOwnership(addr1.address);
    expect(await token.owner()).to.equal(addr1.address);
  });

  it("should block pause from non-owner", async function () {
    await expect(token.connect(addr1).pause()).to.be.revertedWith("Not owner");
  });
});

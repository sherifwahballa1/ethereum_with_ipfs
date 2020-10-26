pragma solidity ^0.5.0;

// save hash on the blockchain

contract Meme {
  string public memeHash;

  function set(string memory _memeHash) public payable {
    memeHash = _memeHash;
  }

  function get() public view returns (string memory) {
    return memeHash;
  }
}

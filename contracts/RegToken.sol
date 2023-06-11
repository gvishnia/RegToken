// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Consecutive.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Wrapper.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Enums.sol";
import "./RegMetaData.sol";

contract RegToken is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

  

    // The mapping from token ID to metadata.
    mapping(uint256 => RegMetaData) public metaData;

    Counters.Counter private _tokenIdCounter;
    OrderStatus private orderStatus;
    string private side;

    constructor() ERC721("RegToken", "RGT")
    {
        // Set the default metadata.
        metaData[0] = RegMetaData("RegToken0","RGT","First RegToken in collection",-1); 
    }

    function updateMetaData(uint256 tokenId, string memory name, string  memory symbol, string memory description, int size) public {
        // Check if the token ID is valid.
        require(tokenId > 0);

        // Update the metadata.
        metaData[tokenId] = RegMetaData(name,symbol, description,size);
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function compare(string memory str1, string memory str2) public pure returns (bool) {
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }

    function _beforeTokenTransfer(address from, address to,uint256 tokenId  , uint256 batchSize  ) internal virtual override
    {
        super._beforeTokenTransfer(from, to, tokenId,1);
        orderStatus = OrderStatus.Filled;
        // do stuff before every transfer
        // e.g. check that vote (other than when minted) 
        // being transferred to registered candidate
    }

    function tokenURI(uint256 tokenId)   public view override(ERC721, ERC721URIStorage)
            returns (string memory)
    {
        return super.tokenURI(tokenId);
    }


    function tokenValidation() private returns (bool result)
    {
         require(orderStatus != OrderStatus.NULL, "Order stats must be filled");
         require(compare(side,"") , "Side must be filled");
         return true;
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage){
    }

    event Macth(address pl1, address pl2);
}

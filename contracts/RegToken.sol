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
import "hardhat/console.sol";

contract RegToken is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    // The mapping from token ID to metadata.
    mapping(uint256 => RegMetaData[])  public  metaData;

    Counters.Counter private _tokenIdCounter;
    OrderStatus public orderStatus;
    string public side;
    string public stam;
    address _owner;

    constructor() ERC721("RegToken", "RGT")
    {
        // Set the default metadata        
        metaData[0].push (RegMetaData("RegToken_0","RGT","Seed RegToken in collection",0,_owner));         
        _tokenIdCounter.increment();
    }

    function createRegToken(address generator,string memory name, string  memory symbol, string memory description, uint256 size) public
        onlyOwner returns (uint256)
    {
        uint256 newItemId = _tokenIdCounter.current();
        console.log(newItemId);
        _mint(generator, newItemId);        
        updateMetaData(newItemId,name,symbol,description,size);
        _tokenIdCounter.increment();
        return newItemId;
    }

    function RegMetaDataToString(RegMetaData memory metaData) public  view returns (string memory) {       
        //console.log(string.concat("RegMetaDataToStrin --> name:",metaData.name, ", symbol:",metaData.symbol,", description:",metaData.description,", size:",Strings.toString(metaData.size)));
        return string.concat("name:",metaData.name, ", symbol:",metaData.symbol,", description:",metaData.description,", size:",Strings.toString(metaData.size));
    }

    function updateMetaData(uint256 tokenId, string memory name, string  memory symbol, string memory description, uint256 size) public 
    {        
        require(tokenId > 0); // Check if the token ID is valid.
        // Update the metadata.        
        metaData[tokenId].push(RegMetaData(name,symbol, description,size,_owner));        
    }
    
    function updatePartMetaData(uint256 tokenId, address tAddress, uint256 size) public 
    {        
        require(tokenId > 0); // Check if the token ID is valid.
        // Update the metadata.
        RegMetaData memory mt0 = metaData[tokenId][0];
        metaData[tokenId].push(RegMetaData(mt0.name,mt0.symbol, mt0.description,size,tAddress));
        
    }

    function macthOrders(address pl1,uint256 pl1TokennId, address pl2,uint256 pl2TokennId) public
    {
        console.log("Match");
        RegMetaData memory md1 = GetMetaData(pl1TokennId);
        RegMetaData memory md2 = GetMetaData(pl2TokennId);
        console.log(RegMetaDataToString(md1));
        if(compare(md1.name,md2.name))
        {
            console.log("hrer");
        }
    }    
    function GetTokenCount() public view returns (uint)
    {
        return _tokenIdCounter.current();
    }

    function GetMetaData(uint256 tokenId) public view returns (RegMetaData memory) { 
        uint arrLen = metaData[tokenId].length;
        return metaData[tokenId][arrLen-1];
    }

    
    function GetName(uint256 tokenId) public returns (string memory) { 
       return "hello";
       //return ((RegMetaData)metaData[tokenId]).name;       
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

    
}

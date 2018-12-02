pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 { 

    struct Star { 
        string name;      // Name
        string starStory; // Star story
        string ra;        // Right ascension (h m s)
        string dec;       // Declination (° ' ")
        string mag;       // Magnitude
    }

    mapping(uint256 => Star) public tokenIdToStarInfo; 
    mapping(uint256 => uint256) public starsForSale;
    mapping(bytes32 => uint256) public coordinatesHashToTokenId;

    function createStar(string _name, string _starStory, string _ra, string _dec, string _mag, uint256 _tokenId) public { 
        require(!checkIfStarExist(_ra, _dec, _mag));

        Star memory newStar = Star(_name, _starStory, _ra, _dec, _mag);
    
        bytes32 coordinatesHash = hashCoordinates(_ra, _dec, _mag);
        coordinatesHashToTokenId[coordinatesHash] = _tokenId;

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // We are only using star coordinates and not the token ID as that will be handled internally by the ERC721 token implementation
    function checkIfStarExist(string _ra, string _dec, string _mag) public view returns (bool) {
        bytes32 coordinatesHash = hashCoordinates(_ra, _dec, _mag);

        // This should be the first time we are getting the star coordinates
        return (coordinatesHashToTokenId[coordinatesHash] != 0);
    }

    function hashCoordinates(string _ra, string _dec, string _mag) internal pure returns (bytes32) {
        // Note since we are hashing strings, any variations in providing star coordinates will not be caught
        return keccak256(abi.encodePacked(_ra, _dec, _mag));
    }

}
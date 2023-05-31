import { useState, useEffect, React } from 'react'
import styled from 'styled-components'
import StoreNFTCard from './StoreNFTCard'
import {
  Link,
  Element,
  Events,
  animateScroll as scroll,
  scroller,
} from "react-scroll";
import web3modal from "web3modal"
import { ethers } from "ethers"
import { contractAbi, contractAddress } from "../config";
import axios from "axios";

function Market() {

  const [loaded, setLoaded] = useState(false);
  const [nfts, setNfts] = useState([]);

  /*-----------------Code to Fetch NFT from contract----------------*/
  useEffect(() => {
    fetchNFTs();
  }, [])


  function extractCIDFromIPFSUrl(ipfsUrl) {
    const cidRegex = /ipfs:\/\/([a-zA-Z0-9]+)/;
    const matches = ipfsUrl.match(cidRegex);

    if (matches && matches.length > 1) {
      const cid = matches[1];
      return cid;
    } else {
      return null;
    }
  }

  const alchemyId = process.env.REACT_APP_ALCHEMY_API_KEY;

  const fetchNFTs = async () => {
    const provider = new ethers.providers.AlchemyProvider("maticmum", alchemyId);
    const contract = new ethers.Contract(contractAddress, contractAbi.abi, provider);
    const data = await contract.fetchMarket();

    const items = await Promise.all(
      data.map(async (i) => {
        let tokenUri = await contract.tokenURI(i.tokenId.toString());
        let trimmedTokenUri = tokenUri.substring(7);
        let rawURI = trimmedTokenUri.substring(0, trimmedTokenUri.indexOf('/'));

        if (rawURI) {
          const uri = `https://${rawURI}.ipfs.w3s.link/metadata.json`;
          try {
            const response = await fetch(uri);
            const meta = await response.json();
            console.log("For image : ", meta.image)
            let imageUri = meta.image;
            console.log("Image Uri : ", imageUri)
            let cid = extractCIDFromIPFSUrl(imageUri);

            if (cid) {
              console.log("Extracted CID:", cid);
            } else {
              console.log("Invalid IPFS URL");
            }
            let filePath = imageUri.substring(imageUri.lastIndexOf("/") + 1);
            console.log("file path is : ", filePath)
            let imageURL = `https://${cid}.ipfs.dweb.link/${filePath}`;
            let price = ethers.utils.formatEther(i.price);
            let royalty = ethers.utils.formatEther(i.royaltyFeeInBips);
            let item = {
              price,
              royalty,
              name: meta.name,
              tokenId: i.tokenId.toNumber(),
              image: imageURL
            };

            return item;
          } catch (error) {
            console.log("fetch error:", error);
          }
        } else {
          console.log("Empty rawURI for tokenId:", i.tokenId.toString());
        }
      })
    );

    // console.log("items array is:", items.filter(Boolean));
    setNfts(items.filter(Boolean));
    setLoaded(true);
  };


  const cards = nfts.map(card => {
    return (
      <StoreNFTCard
        id={card.tokenId}
        name={card.name}
        price={card.price}
        royalty={card.royalty}
        image={card.image}
      />
    )
  })

  /*-------------------------------------------------------------------*/

  return (
    <Container>
      <BackgroundImage>
        <div className="left">
          <img src="/images/grad-left.png" />
        </div>
        <div className="right">
          <img src="/images/grad-right.svg" />
        </div>
      </BackgroundImage>
      <StoreSection>
        <Element name="market" className="heading">
          <p>
            Explore, Buy NFTs
          </p>
        </Element>
        {
          loaded &&
          <div className="marketplace">
            {cards}
          </div>
        }
        {
          !loaded &&
          <div className='loading'>
            <p>Loading NFTs...</p>
          </div>
        }
      </StoreSection>

    </Container >
  )
}

export default Market

const Container = styled.div`
  height: auto;
  min-height: 1544px;
  width: 100%;
  position: relative;
`
const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -2;
  display: flex;

  .left {
    flex:1;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.6;
  }

  .right {
    flex:1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`

const StoreSection = styled.div`
  height: auto;
  min-height: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;


  .heading {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 183px;

    p {
      margin-top: 90px;
      font-size: 48px;
      font-weight: 600;
      color: #0D004D;
    }
  }

  .marketplace {
    flex: 1;
    margin-right: 15rem;
    margin-left: 15rem;
    padding-top: 25px;
    padding-bottom: 95px;
    display: grid;
    grid-template-columns: 300px 300px 300px 300px;
    grid-column-gap: 69.5px;
    grid-row-gap: 46px;
  }

  .loading {
    flex:1;
    margin-right: 15rem;
    margin-left: 15rem;
    display: flex;
    align-items: start;
    justify-content: center;

    p {
      margin-top: 120px;
      font-size: 22px;
    }
  }

`

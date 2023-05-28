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
  useEffect( ()=> {
    fetchNFTs();
  },[])

  const alchemyId = process.env.REACT_APP_ALCHEMY_API_KEY;

  const fetchNFTs = async () => {

    const provider = new ethers.providers.AlchemyProvider("maticmum", alchemyId);
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi.abi,
      provider
    );
    const data = await contract.fetchMarket();
    console.log("data is : ", data)
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.tokenURI(i.tokenId.toString());
        console.log("token uri is ", tokenUri)
        const trimmedTokenUri = tokenUri.substring(7);
        console.log('trimmed : ', trimmedTokenUri)
        // const finalUri = `https://ipfs.io/ipfs/${trimmedTokenUri}`;
        // const finalUri = `https://${trimmedTokenUri}.ipfs.w3s.link`;
        // console.log("final uri : ", finalUri)
        const meta = await axios.get(finalUri);
        let price = ethers.utils.formatEther(i.price);
        let royalty = ethers.utils.formatEther(i.royaltyFeeInBips);
        let item = {
            price,
            royalty,
            name: meta.data.name,
            tokenId: i.tokenId.toNumber(),
            image: `https://${(meta.data.image).substring(7)}.ipfs.w3s.link`,
        };
        console.log("each item is : ", item)
        return item;
      })
    );
    setNfts(items);
    setLoaded(true);
  }

  console.log('nfts are : ', nfts);

  const cards = nfts.map( card => {
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
              <img src="/images/grad-left.png"/>
            </div>
            <div className="right">
              <img src="/images/grad-right.svg"/>
            </div>
          </BackgroundImage>
          <StoreSection>
            <Element name="market" className="heading">
              <p>
                Explore, Buy NFTs
              </p>
            </Element>
            <div className="marketplace">
              {cards}
            </div>
          </StoreSection>

        </Container >
    )
}

export default Market

const Container=styled.div`
  height: auto;
  min-height: 1544px;
  width: 100%;
  position: relative;
`
const BackgroundImage=styled.div`
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

const StoreSection=styled.div`
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

`

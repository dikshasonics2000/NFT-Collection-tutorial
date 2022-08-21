import Head from "next/head";
 import image from 'next/image'
 import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import  { providers, Contract , utils } from "ethers"; //utils-to use ethers in eth in palce of wei
import  {useEffect, useRef, useState } from "react";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from '../constants';

  export default function Home(){
    const [isOwner, setIsOwner] = useState(false);
    const [presaleStarted, setPresaleStarted] = useState(false);
    const [presaleEnded, setPresaleEnded] = useState(false);
    const [numTokensMinted, setNumTokensMinted] = useState("0");
const [walletConnected, setWalletConnected] = useState(false);
const [loading, setLoading] = useState(false);
    const web3ModalRef = useRef();

    const getNumMintedTokens = async () => {
      try {
        const provider = await getProviderOrSigner();
        const nftContract = new Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          provider
        );

        const numTokenIds = await nftContract.tokenIds();
        setNumTokensMinted(numTokenIds.toString());
      } catch (error) {
        console.error(error);
      }
    };

    const presaleMint = async () => {
      setLoading(true);
  try {
    const signer = await getProviderOrSigner(true);

    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,  //smart contract allow every ether only in wei as it doesnt has floating numbers
      NFT_CONTRACT_ABI,
      signer
    );

    const txn = await nftContract.presaleMint({
      value: utils.parseEther("0.01"),
    });
    await txn.wait();

    window.alert("You successfully minted a cryptoDev!");
  } catch (error) {
    console.error(error);
  }
  setLoading(false);
    };

    const publicMint = async () => {
      setLoading(true);
      try {
        const signer = await getProviderOrSigner(true);
    
        const nftContract= new Contract(
          NFT_CONTRACT_ADDRESS,  //smart contract allow every ether only in wei as it doesnt has floating numbers
          NFT_CONTRACT_ABI,
          signer
        );

        const txn = await nftContract.mint({
          value: utils.parseEther("0.01"),
        });
        await txn.wait();
    
        window.alert("You successfully minted a cryptoDev!");
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }

    const getOwner = async () => {
try {
  
  const signer = await getProviderOrSigner(true);
  const provider = await getProviderOrSigner();
  //Get an instance of your NFT  contract
  //this will let us read the contract cuz provider just provides 
  const nftContract = new Contract(
    NFT_CONTRACT_ADDRESS,
    NFT_CONTRACT_ABI,
    provider
  );
  const owner =await nftContract.owner(); //owner who is connected
  const userAddress = await signer.getAddress();// his address

  if(owner.toLowerCase() === userAddress.toLowerCase()); { //if address of ownber is equal to the currently connected user
setIsOwner(true);
  }
} catch (error) {
  console.error(error);
}
    };

    const startPresale = async () => {
      setLoading(true);
try {
  
  const signer = await getProviderOrSigner(true); //when starting a presale u are sending something transaction to blockchain  so we need to chaange state and thus need a signer

  const nftContract = new Contract(
    NFT_CONTRACT_ADDRESS,
    NFT_CONTRACT_ABI,
    signer
  );

  const txn = await nftContract.startPresale(); //txn = transaction
  await txn.wait(); 

  setPresaleStarted(true);
} catch (error) {
  console.error(error);
}
setLoading(false);
    };

    const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();

  //Get an instance of your NFT  contract
  //this will let us read the contract cuz provider just provides 
  const nftContract = new Contract(
    NFT_CONTRACT_ADDRESS,
    NFT_CONTRACT_ABI,
    provider
  );

  //this will return a big number ciuz the presale is ended is a uint256
  //this will return a timestamp in a seconds
  const presaleEndTime = await nftContract.presaleEnded();
  const currentTimeInSeconds = Date.now() /1000; //s returns timestamp with this function but in milliseconds thus we divided it with 10000 to get in seconds

  const hasPresaleEnded = presaleEndTime.lt(
    Math.floor(currentTimeInSeconds)
    );
  setPresaleEnded(hasPresaleEnded);
  return hasPresaleEnded;
    } catch (error) {
      
    }
    };
    const checkIfPresaleStarted = async () => {
try {
  
  const provider = await getProviderOrSigner();

  //Get an instance of your NFT  contract
  //this will let us read the contract cuz provider just provides 
  const nftContract = new Contract(
    NFT_CONTRACT_ADDRESS,
    NFT_CONTRACT_ABI,
    provider
  );

  const isPresaleStarted = await nftContract.presaleStarted();
  if (!isPresaleStarted) {
    await getOwner();
  }
  setPresaleStarted(isPresaleStarted);

  return isPresaleStarted;

} catch (error) {
  console.error(error);
  return false;
}
    };
    const connectWallet = async() => {
      try {
        await getProviderOrSigner();
        setWalletConnected(true);
      } catch (error) {
        console.error(error);
      }
   
    };

    const getProviderOrSigner = async (needSigner = false) => {
      
      //we ned to gain access to provider /signer from metamask
      const provider = await web3ModalRef.current.connect();  // this line will itself pop open metamask and ask the userto connect
    const web3Provider = new providers.Web3Provider(provider); // we will wrap the provider in this web3Provider
    
    //if user is not connected rto rinkeby then we alert them to connect to rinkeby
    const { chainId } = await web3Provider.getNetwork(); // every network whether be mainnet or rinkeby every has a chain id and rinkeby has chain id 4
    if(chainId !== 4) {
      window.alert("Please switch to the rinkeby network");
      throw new Error("Incorrect network");

    }

    if(needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  };
  const  onPageLoad = async () => {
    connectWallet();
    const presaleStarted = await checkIfPresaleStarted();
    if(presaleStarted) {
      await checkIfPresaleEnded();
    }
    await getNumMintedTokens();
    //Track in real time the number of minted NFTs
    setInterval(async() => {
      await getNumMintedTokens();
    }, 5* 1000);

    //Track in real time the status of presale (started, ended, whatever)
    setInterval(async () => {

      const presaleStarted = await checkIfPresaleStarted();
      if(presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 5 * 1000)
  };

useEffect(() => {
  if(!walletConnected) {
    web3ModalRef.current  = new Web3Modal({
network: "rinkeby",
providerOptions: {},
disableInjectedProvider: false,

    });
   onPageLoad();
   
  }
}, [walletConnected]);

const renderBody = () => {
  if(!walletConnected) {
    return (
      <button onClick={connectWallet} className = {styles.button}>
        connect your wallet
      </button>
    );
    
  }

  if(loading) {
    return(
      <span className={styles.description}>Loading.....</span> 
    )
  };

  if(isOwner && !presaleStarted) {
//render a button to start the presale
return (
  <button  className={styles.button} onClick={startPresale}>
    Start presale
  </button>
);
  };

  if(!presaleStarted) {
    //just say that presale hasnt started yet, come again later
    return (
      <div>
        <span className={styles.description}>
          Presale hasn't started yet. Come again later.
        </span>
      </div>
    );
  }
  if(presaleStarted && !presaleEnded) {
    //allow users to mint in presale
    //they need to be in whitelist in order for it to work

    return(
      <div>
        <span className={styles.description}>
        Presale has startred! If your address is whitelisted, you can mint a cryptodev!
      </span>
      <button className={styles.button} onClick={presaleMint}>Presale Mint </button>
      </div>
    );
  }

  if(presaleStarted && presaleEnded ) {
    //allow users to take part in public sale

    return(
      <div>
        <span className={styles.description}>
Presale has ended.
You can mint a cryptoDev in public sale, if any remain.
      </span>
      <button className={styles.button} onClick={publicMint}>Public Mint </button>
      </div>
    );
  }

}
    
    return (
    <div>
      <Head>
        <title>Crypto Devs NFT</title>
        <meta name="description" content="Whitelist-Dapp" />
      </Head>

      <div className = {styles.main}>
<div>
  <h1 className={styles.title}>Welcome to CryptoDev's NFT</h1>
  <div classame={styles.description}>CryptoDevs NFT is a collection for developers in web3</div>
<div className={styles.description}>
  {numTokensMinted}/20 have been minted already!
</div>
        {renderBody()}
      </div>
      <img className={styles.image} src="/cryptoDevs/0.svg" />
    </div>

    <footer className={styles.footer}> Made with &#10084; by Crypto Devs</footer>
    </div>
    );
  }

import Head from 'next/head'
import styles from '../styles/Home.module.css';
import Web3Modal from "web3modal";
import {ethers, providers} from "ethers";
import {useEffect, useRef, useState} from "react";

export default function Home() {

  // walletConnected keep track of whether the user's wallet is connected on not
  const [walletConnected, setWalletConnected] = useState(false);
  //Create a reference to the web3 Modal (used for connecting to metamask)
  const web3ModalRef = useRef();
  //ENS
  const [ens, setENS] = useState("");
  //Save the address of the currently connected account
   const [address, setAddress] = useState("");


   const setENSOrAddress = async(address, web3Provider) => {
     // Lookup the ENS related to the given address
     var _ens = await web3Provider.lookupAddress(address);
     // if the address has an ENS set the ENS or else just set the address
     if(_ens) {
       setENS(_ens);
     } else{
       setAddress(address);
     }
   }

   /**
    * A `Provider` is needed to interact with the blockchain - reading transaction and balances etc
    * A ``Signer is a special type of provider used for writing to the blockchain. It requires the connected 
    * account to digitally sign and authorize the transaction   
    * 
    */

   const getProviderOrSigner = async() => {
     const provider = await web3ModalRef.current.connect();
     const web3Provider = new providers.Web3Provider(provider);

     // if user is not connected to the rinkeby network, let them know and throw an error

     const { chainId } = await web3Provider.getNetwork();

     if (chainId !== 4) {
       window.alert("Change the network to Rinkeby");
       throw new Error("Change network to Rinkeby");
     }

     const signer = web3Provider.getSigner();

     //Get the address associated to the signer which is connected to metaMask
      const address = await signer.getAddress();

      // Calls the function to set the ENS or Address
      await setENSOrAddress(address, web3Provider);
      return signer;
   };

   /**
    * ConnectWallet: Connects the MetaMask wallet
    */

   const connectWallet = async () => {
     try {
       // Get the Provider from the web3Modal, which is our case is MetaMask
       // When used for the first time, it prompts the user to connect
       await getProviderOrSigner(true);
       setWalletConnected(true);
     } catch (err) {
       console.error(err);
     }
   };

   /**
    * renderButton: REturns a button based on the state of the dapp
    */

   const renderButton = () => {
     if (walletConnected) {
       <div>Wallet connected</div>;
     } else {
       return (
         <button onClick={connectWallet} className={styles.button}>
           Connect your wallet
         </button>
       );
     }
   };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);


  return (
    <div>
      <Head>
        <title>ENS Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to DukeWeb3 Punks {ens ? ens : address}!
          </h1>
          <div className={styles.description}>
            Its an NFT collection for DukeWeb3 Punks.
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./dukeweb3punks.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by DukeWeb3 Punks
      </footer>
    </div>
  );
}

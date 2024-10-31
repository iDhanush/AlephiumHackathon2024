import React, { useState, useEffect } from "react";
import "./Navbar.scss";
import { Link, NavLink } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

import { AlephiumConnectButton, useWallet } from "@alephium/web3-react";

const Navbar = ({ page }) => {
  const { setWallet } = useStore();
  // const [provider, setProvider] = useState(null);

  // useEffect(() => {
  //   if (window.ethereum) {
  //     setProvider(window.ethereum);
  //   }
  // }, []);

  const alephiumWallet = useWallet();

  useEffect(() => {
    if (alephiumWallet) {
      setWallet(alephiumWallet?.account?.address || null);
      console.log(alephiumWallet?.account?.address || null);
    }
  }, [alephiumWallet])

  // const requestAccount = async () => {
  //   if (provider) {
  //     try {
  //       const accounts = await provider.request({
  //         method: "eth_requestAccounts",
  //       });
  //       setWalletAddress(accounts[0]);
  //       setWallet(accounts[0]);
  //       console.log(accounts[0]);
  //       localStorage.setItem("wallet", accounts[0]);
  //     } catch (err) {
  //       console.error("Error:", err);
  //     }
  //   } else {
  //     console.log("MetaMask not detected");
  //   }
  // };
  return (
    <>
      <nav className="nav">
        <Link className="logo" to="/">
          Un<span className="col">Mask</span>
        </Link>

        <div className="nav-group">
          <ul className="navlinks">
            <li>
              <NavLink to="/nft">My certificates</NavLink>
            </li>
            <li>
              <NavLink to="/pricing">Pricing</NavLink>
            </li>
            <li>
              {/* <NavLink to="/certification">Certification</NavLink> */}
            </li>
          </ul>
          <div className="alephium-connect-button">
            <AlephiumConnectButton label="Connect Wallet" />
          </div>
          {
            //   <button
            //   className="cssbuttons-io-button"
            //   onClick={requestAccount}
            //   style={{ gap: "10px" }}
            // >
            //   <img src={META} alt="" />
            //   <span>Connect wallet</span>
            // </button>
          }
        </div>
      </nav>
    </>
  );
};

export default Navbar;

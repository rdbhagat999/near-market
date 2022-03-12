import { useEffect, useState } from "react";
import { utils } from "near-api-js";
import { NavLink, useNavigate } from "react-router-dom";
import { login, logout } from "../lib/initContract";

export default function Navbar() {
  let navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [balance, setAccountBalance] = useState(0);

  useEffect(() => {
    setIsSignedIn(window.walletConnection.isSignedIn());

    if (isSignedIn) {
      // window.contract is set by initContract in index.js

      const getBalance = async () => {
        const account = await window.walletConnection.account();
        const balance = await account.getAccountBalance();
        const amountInNEAR = utils.format.formatNearAmount(balance.available);
        const nearFloat = parseFloat(amountInNEAR);
        setAccountBalance(nearFloat.toFixed(2));
      };
      getBalance();
    }
  }, [isSignedIn, balance]);

  const handleLogout = () => {
    navigate("/");
    logout();
  };
  return (
    <nav className="nav">
      <div className="left-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/list">My Collection</NavLink>
      </div>
      <div className="right-nav">
        {isSignedIn && (
          <>
            <div>Balance: {balance} N</div>
            <div>{window.accountId}</div>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
        {!isSignedIn && (
          <>
            <button type="button" onClick={login}>
              Login
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

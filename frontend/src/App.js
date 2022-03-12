import { useEffect, useState } from "react";
import "./App.css";

import TokenList from "./components/TokenList";
import Navbar from "./components/Navbar";

import data from "./data";

function App() {
  const [isSignedIn, setSignedIn] = useState(false);
  useEffect(
    () => {
      setSignedIn(window.walletConnection.isSignedIn());
      // in this case, we only care to query the contract when signed in
      if (isSignedIn) {
        console.log("signed_in");

        const fn = async () => {
          // window.contract is set by initContract in index.js
          await window.contract.getProjectInfo({}).then((message) => {
            console.log(message);
          });
        };
        fn();
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    [isSignedIn]
  );
  return (
    <>
      <Navbar />
      <TokenList data={data} />
    </>
  );
}

export default App;

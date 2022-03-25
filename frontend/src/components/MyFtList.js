import { useState, useEffect } from "react";
import { utils } from "near-api-js";

import Navbar from "./Navbar";
import Token from "./Token";

export default function MyFtList() {
  const [myFTs, setMyFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSellPoster = async (ft) => {
    console.log("sellMoviePoster", ft);

    if (isSignedIn) {
      try {
        setIsLoading(false);
        ft.price = utils.format.parseNearAmount(`${ft.price}`);
        await window.walletConnection.account().functionCall({
          contractId: window.contractName,
          methodName: "sellMoviePoster",
          args: { ft },
          attachedDeposit: utils.format.parseNearAmount(
            "0.000000000000000000000001"
          ),
          attachedGas: "300000000000000",
        });
        window.location = "/";
        setIsLoading(false);
      } catch (error) {
        console.log("error");
        console.log(error);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // in this case, we only care to query the contract when signed in
    setIsSignedIn(window.walletConnection.isSignedIn());

    if (isSignedIn) {
      // window.contract is set by initContract in index.js
      setIsLoading(true);
      let accountId = window.accountId;

      const fn = async () => {
        await window.contract
          .fetchMovieListByAccountId({ accountId })
          .then((myFtsFromContract) => {
            const fts = myFtsFromContract.map((t) => {
              const amountInNEAR = utils.format.formatNearAmount(t.price);
              // console.log("amountInNEAR", amountInNEAR);
              const updatedPrice = parseFloat(amountInNEAR) * parseFloat(2);
              // console.log("updatedPrice", updatedPrice);
              t.price = `${updatedPrice.toFixed(2)}`;
              return t;
            });
            console.log(fts);
            setMyFTs(myFtsFromContract);
            setIsLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setIsLoading(false);
          });
      };
      fn();
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  return isSignedIn ? (
    isLoading ? (
      <>
        <Navbar />
        <div>
          <h3 className="popular-nfts-heading">My Movie Posters</h3>
          <div className="popular-nfts">
            <h2 style={{ textAlign: "center" }}>
              Fetching from blockchain ...
            </h2>
          </div>
        </div>
      </>
    ) : (
      <>
        <Navbar />
        <h3 className="popular-nfts-heading">My Movie Posters</h3>
        <div className="popular-nfts">
          {myFTs.length === 0 && (
            <h2 style={{ textAlign: "center" }}>Nothing to show here.</h2>
          )}
          {myFTs &&
            myFTs.map((ft, index) => (
              <Token
                key={index}
                data={{
                  ...ft.item,
                  price: ft.price,
                }}
                op="sell"
              >
                <button
                  className="btn buy-button"
                  onClick={() => handleSellPoster(ft)}
                >
                  Sell
                </button>
              </Token>
            ))}
        </div>
      </>
    )
  ) : (
    <>
      <Navbar />
      <div>
        <h3 className="popular-nfts-heading">My Fungible Tokens</h3>
        <div className="popular-nfts">
          <h2 style={{ textAlign: "center" }}>
            You must be logged in to view your tokens.
          </h2>
        </div>
      </div>
    </>
  );
}

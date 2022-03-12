import { utils } from "near-api-js";
import Token from "./Token";

export default function TokenList({ data }) {
  const handleBuyFT = async (item) => {
    const tokenToBuy = Object.assign({}, item);
    const amountInFloat = parseFloat(tokenToBuy.voteAverage).toFixed(2);
    const amountInYocto = utils.format.parseNearAmount(`${amountInFloat}`);

    console.log("buyFungibleToken", tokenToBuy);
    console.log("amountInYocto", amountInYocto);

    if (window.walletConnection.isSignedIn()) {
      try {
        const ft = await window.walletConnection.account().functionCall({
          contractId: window.contractName,
          methodName: "buyFungibleToken",
          args: { item: tokenToBuy },
          attachedGas: "300000000000000",
          attachedDeposit: amountInYocto,
        });
        // const ft = await window.contract.buyFT({ movie: item });
        console.log("ft");
        console.log(ft);
      } catch (error) {
        console.log("error");
        console.log(error);
      }
    }
  };

  return (
    <>
      <h3 className="popular-nfts-heading">Popular Fungible Tokens</h3>
      <div className="popular-nfts">
        {data &&
          data.map((item, index) => (
            <Token key={index} data={item} op="buy">
              <button
                className="btn buy-button"
                onClick={() => handleBuyFT(item)}
              >
                Buy
              </button>
            </Token>
          ))}
      </div>
    </>
  );
}

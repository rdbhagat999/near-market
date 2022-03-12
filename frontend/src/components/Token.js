export const IMG_ROOT = "https://image.tmdb.org/t/p/original";

export default function Token({ children, data, op }) {
  return !data ? (
    <>
      <div className="token-placeholder">
        <h1>Loading...</h1>
      </div>
    </>
  ) : (
    <>
      <div id={data?.id} className="nft-card">
        <img src={data?.backdropPath} alt={data?.title} />
        <div className="description">
          <div>
            <h2>{data?.title}</h2>
            {op === "buy" && <p>{" " + data?.voteAverage} Near</p>}

            {op === "sell" && <p>{" " + data?.price} Near</p>}
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

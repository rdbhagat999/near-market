import { VMContext } from "near-sdk-as";
import {
  fetchMovieListByAccountId,
  buyMoviePoster,
  getProjectInfo,
  sellMoviePoster,
} from "../index";
import { MoviePoster, Item, message } from "../model";
import { toYocto } from "../utils";

const accountId = "YOUR-NAME.testnet";

let demoposter: MoviePoster;

const item: Item = {
  id: 111111,
  title: "Uncharted",
  backdropPath:
    "https://image.tmdb.org/t/p/original/cTTggc927lEPCMsWUsdugSj6wAY.jpg",
  releaseDate: "2022-02-10",
  voteAverage: 7.2,
};

beforeEach(() => {
  demoposter = new MoviePoster(item, toYocto(14), "1646488298177");
});

describe("contract methods", () => {
  it("[getProjectInfo] should return a string", () => {
    expect<string>(getProjectInfo()).toStrictEqual(message);
  });

  it("[fetchMovieListByAccountId] should return length = 0", () => {
    let posters = fetchMovieListByAccountId(accountId);
    let postersLength = posters.length;
    expect<i32>(postersLength).toBe(0);
  });

  it("[buyMoviePoster] should return an poster with id = 111111", () => {
    VMContext.setAttached_deposit(toYocto(7));
    const poster: MoviePoster = buyMoviePoster(item);
    expect(poster.item.id).toStrictEqual(item.id);
  });

  it("[fetchMovieListByAccountId] should return length = 2", () => {
    VMContext.setSigner_account_id(accountId);
    VMContext.setAttached_deposit(toYocto(14));
    buyMoviePoster(item);

    item.id = 222222;
    VMContext.setAttached_deposit(toYocto(14));
    buyMoviePoster(item);

    let posters = fetchMovieListByAccountId(accountId);
    let postersLength = posters.length;
    expect<i32>(postersLength).toBe(2);
  });

  it("[sell_user_fungible_tokens] should return poster_length = 0 after buy:1/sell:1", () => {
    VMContext.setSigner_account_id(accountId);

    //buy 1st poster
    VMContext.setAttached_deposit(toYocto(14));
    item.id = 111111;
    buyMoviePoster(item);

    let posters = fetchMovieListByAccountId(accountId);
    let postersLength = posters.length;
    expect<i32>(postersLength).toBe(
      1,
      "length after buying 1st_poster should be 1"
    );

    //sell 1st poster
    VMContext.setAttached_deposit(toYocto(30));
    demoposter.item.id = 111111;
    sellMoviePoster(demoposter);

    posters = fetchMovieListByAccountId(accountId);
    postersLength = posters.length;
    expect<i32>(postersLength).toBe(
      0,
      "length after selling 1st_poster should be 0"
    );
  });

  it("[sell_user_fungible_tokens] should return poster_length = 1 after buy:2/sell:1", () => {
    VMContext.setSigner_account_id(accountId);

    //buy 1st poster
    VMContext.setAttached_deposit(toYocto(14));
    item.id = 111111;
    buyMoviePoster(item);

    let posters = fetchMovieListByAccountId(accountId);
    let postersLength = posters.length;
    expect<i32>(postersLength).toBe(
      1,
      "length after buying 1st_poster should be 1"
    );

    // buy 2nd poster
    VMContext.setAttached_deposit(toYocto(14));
    item.id = 222222;
    buyMoviePoster(item);

    posters = fetchMovieListByAccountId(accountId);
    postersLength = posters.length;
    expect<i32>(postersLength).toBe(
      2,
      "length after buying 2nd_poster should be 2"
    );

    //sell 1st poster
    VMContext.setAttached_deposit(toYocto(30));
    item.id = 111111;
    sellMoviePoster(demoposter);

    posters = fetchMovieListByAccountId(accountId);
    postersLength = posters.length;
    expect<i32>(postersLength).toBe(
      1,
      "length after selling 1st_poster should be 1"
    );
  });

  it("[sell_user_fungible_tokens] should return poster_length = 0 after buy:2/sell:2", () => {
    VMContext.setSigner_account_id(accountId);

    //buy 1st poster
    VMContext.setAttached_deposit(toYocto(14));
    item.id = 111111;
    buyMoviePoster(item);

    let posters = fetchMovieListByAccountId(accountId);
    let postersLength = posters.length;
    expect<i32>(postersLength).toBe(
      1,
      "length after buying 1st_poster should be 1"
    );

    // buy 2nd poster
    VMContext.setAttached_deposit(toYocto(14));
    item.id = 222222;
    buyMoviePoster(item);

    posters = fetchMovieListByAccountId(accountId);
    postersLength = posters.length;
    expect<i32>(postersLength).toBe(
      2,
      "length after buying 2nd_poster should be 2"
    );

    //sell 1st poster
    VMContext.setAttached_deposit(toYocto(30));
    item.id = 111111;
    sellMoviePoster(demoposter);

    posters = fetchMovieListByAccountId(accountId);
    postersLength = posters.length;
    expect<i32>(postersLength).toBe(
      1,
      "length after selling 1st_poster should be 1"
    );

    //sell 2nd poster
    VMContext.setAttached_deposit(toYocto(30));
    item.id = 222222;
    sellMoviePoster(demoposter);

    posters = fetchMovieListByAccountId(accountId);
    postersLength = posters.length;
    expect<i32>(postersLength).toBe(
      0,
      "length after selling 2nd_poster should be 0"
    );
  });
});

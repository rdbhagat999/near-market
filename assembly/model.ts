import { AccountId, Amount, UnsignedInteger32 } from "./utils";

import {
  PersistentUnorderedMap,
  context,
  PersistentSet,
  ContractPromiseBatch,
} from "near-sdk-as";

export const message = "This is the near protocol smart contract tutorial.";


// poster_set = {"accountId-id"}
const poster_set = new PersistentSet<string>("s");

// poster_uMap = {"accountId": MoviePoster[]}
let poster_uMap = new PersistentUnorderedMap<string, MoviePoster[]>("u");

@nearBindgen
export class Item {
  id: UnsignedInteger32;
  title: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: f32;
}

@nearBindgen
export class MoviePoster {
  item: Item;
  price: Amount;
  created_at: string;

  constructor(item: Item, price: Amount, created_at: string) {
    this.item = item;
    this.price = price;
    this.created_at = created_at;
  }

  // private method to transfer funds to receiver address
  private static transfer_funds(transferTo: AccountId, funds: Amount): void {

    const beneficiary = ContractPromiseBatch.create(transferTo);
    beneficiary.transfer(funds);
  }

  // private method used by buy_movie_poster(item: Item): MoviePoster {}
  private static create_poster(
    item: Item,
    blockTimestamp: string
  ): MoviePoster {
    const attachedDepositInYoctoNear = context.attachedDeposit;
    // follows the ISO date format
    assert(blockTimestamp.length >= 10,"Date format has to in YYYY-MM-DD");
    assert(item.title.length > 0, "Empty title");
    assert(item.backdropPath.length > 0, "Empty backdrop path");
    assert(item.releaseDate.length >= 10, "Date format has to in YYYY-MM-DD");

    return new MoviePoster(item, attachedDepositInYoctoNear, blockTimestamp);
  }

  // private method that returns a string
  public static get_info(): string {
    return message;
  }

  // public method to fetch a list of poster by id
  public static getMovieListByAccountId(accountId: AccountId): MoviePoster[] {
    // accountIds on testnet ends with .testnet
    assert(
      accountId.length > 8,
      "Sender is required, put your account ID as sender!"
    );

    // check if sender has any poster
    const isSender = poster_uMap.contains(accountId);
    return isSender ? poster_uMap.getSome(accountId) : [];
  }

  // public method to buy a poster
  @mutateState()
  public static buy_movie_poster(item: Item): MoviePoster {
    const sender = context.sender;
    const contractName = context.contractName;
    const depositInYoctoNear = context.attachedDeposit;
    const blockTimestamp = `${context.blockTimestamp}`;

    // check if sender is not empty string
    assert(
      sender.length > 8,
      "Sender is required, put your account ID as sender!"
    );

    let buyer_poster_id = `${sender}-${item.id}`;
    let hasBought = poster_set.has(buyer_poster_id);


    // check if sender has already bought poster
    assert(!hasBought, `You have already bought this item.`);

    const ft = this.create_poster(item, blockTimestamp);

    const isSender = poster_uMap.contains(sender);

    /*
      check if sender has any poster
      - if yes then update the poster array
      - if no then create a new poster array
    */
    if (isSender) {
      const posters = poster_uMap.getSome(sender);
      posters.push(ft);
      poster_uMap.set(sender, posters);
    } else {
      poster_uMap.set(sender, [ft]);
    }

    // update the persistentSet by adding the buyers address
    poster_set.add(buyer_poster_id);

    // transfer funds to the contract address
    this.transfer_funds(contractName, depositInYoctoNear);


    return ft;
  }


  @mutateState()
  public static sell_movie_poster(ft: MoviePoster): void {
    const seller = context.sender;
    const buyer = context.contractName;

    assert(
      seller.length > 8,
      "Seller is required, put your account ID as seller!"
    );

    let seller_movie_id = `${seller}-${ft.item.id}`;

    // check if seller has the poster to sell
    let sellerHasFT = poster_set.has(seller_movie_id);

    assert(sellerHasFT, `You can only sell your own item.`);

    const isSender = poster_uMap.contains(seller);

    /*
      if seller has poster then update the poster array by removing the poster they are selling
    */
    if (isSender) {
      const seller_posters = poster_uMap.getSome(seller);
      let posterIndex = 0;

      for (let i = 0; i < seller_posters.length; i++) {
        if (seller_posters[i].item.id == ft.item.id) {
          posterIndex = i;
          break;
        }
      }
      let updatedposters = seller_posters.slice(posterIndex, 1);
      poster_uMap.set(seller, updatedposters);
    } else {
      poster_uMap.set(seller, []);
    }

    // update the persistentSet by removing the sellers address
    poster_set.delete(seller_movie_id);

    // transfer funds to the seller address
    this.transfer_funds(seller, ft.price);

  }
}

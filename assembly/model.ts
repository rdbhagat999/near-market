import { AccountId, Amount, UnsignedInteger32 } from "./utils";

import {
  PersistentUnorderedMap,
  logging,
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

  // private method to transfer funds to reciever address
  private static transfer_funds(transferTo: AccountId, funds: Amount): void {
    logging.log(`transferring ${funds} yN to ${transferTo}`);
    const beneficiary = ContractPromiseBatch.create(transferTo);
    beneficiary.transfer(funds);
  }

  // private method used by buy_movie_poster(item: Item): MoviePoster {}
  private static create_poster(
    item: Item,
    blockTimestamp: string
  ): MoviePoster {
    const attachedDepositInYoctoNear = context.attachedDeposit;

    logging.log(
      `attachedDepositInYoctoNear is ${attachedDepositInYoctoNear} yN`
    );

    return new MoviePoster(item, attachedDepositInYoctoNear, blockTimestamp);
  }

  // private method that returns a string
  public static get_info(): string {
    return message;
  }

  // public method to fetch a list of poster by id
  public static getMovieListByAccountId(accountId: AccountId): MoviePoster[] {
    assert(
      accountId.length > 0,
      "Sender is required, put your account ID as sender!"
    );
    logging.log(`fetching posters owned by ${accountId}`);

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

    logging.log(`${sender} is buyer`);

    logging.log(`${contractName} is seller`);

    logging.log(`poster_set.values() ${poster_set.values().toString()}`);

    // check if sender is not empty string
    assert(
      sender.length > 0,
      "Sender is required, put your account ID as sender!"
    );

    let buyer_poster_id = `${sender}-${item.id}`;
    let hasBought = poster_set.has(buyer_poster_id);

    logging.log(`hasBought ${hasBought}`);

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
    logging.log(`adding ${buyer_poster_id}`);
    poster_set.add(buyer_poster_id);

    // transfer funds to the contract address
    this.transfer_funds(contractName, depositInYoctoNear);

    logging.log(`${sender} bought a poster from ${contractName}`);
    logging.log(`poster_set.values() ${poster_set.values().toString()}`);

    return ft;
  }

  // private method used by sell_movie_poster(ft: MoviePoster): void {} to calculate selling price of a poster
  private static calculateSellPrice(price: Amount): Amount {
    // let itemPriceInYoctoNear = u128.mul(price, u128.fromF32(2));
    let itemPriceInYoctoNear = price;
    logging.log(`item sell price is ${itemPriceInYoctoNear} yN`);
    return itemPriceInYoctoNear;
  }

  @mutateState()
  public static sell_movie_poster(ft: MoviePoster): void {
    const seller = context.sender;
    const buyer = context.contractName;

    assert(
      seller.length > 0,
      "Seller is required, put your account ID as seller!"
    );

    logging.log(`poster_set.values() ${poster_set.values().toString()}`);

    logging.log(`${buyer} is buyer`);

    logging.log(`${seller} is seller`);

    let seller_movie_id = `${seller}-${ft.item.id}`;

    // check if seller has the poster to sell
    let sellerHasFT = poster_set.has(seller_movie_id);
    logging.log(`sellerHasFT ${sellerHasFT}`);

    assert(sellerHasFT, `You can only sell your own item.`);

    const sellPriceInYoctoNear = this.calculateSellPrice(ft.price);

    const isSender = poster_uMap.contains(seller);

    /*
      if seller has poster then update the poster array by removing the poster they are selling
    */
    if (isSender) {
      const seller_posters = poster_uMap.getSome(seller);
      let updatedposters = new Array<MoviePoster>();

      for (let i = 0; i < seller_posters.length; i++) {
        if (seller_posters[i].item.id != ft.item.id) {
          updatedposters.push(seller_posters[i]);
        }
      }

      poster_uMap.set(seller, updatedposters);
      logging.log(`updated ft_map for ${seller}`);
    } else {
      poster_uMap.set(seller, []);
      logging.log(`reset ft_map for ${seller}`);
    }

    // update the persistentSet by removing the sellers address
    logging.log(`deleteing ${seller_movie_id}`);
    poster_set.delete(seller_movie_id);

    // transfer funds to the seller address
    this.transfer_funds(seller, sellPriceInYoctoNear);

    logging.log(`${seller} sold a poster to ${buyer}`);
    logging.log(`poster_set.values() ${poster_set.values().toString()}`);
  }
}

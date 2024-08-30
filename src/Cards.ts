export type CardData = {
  id: number,
  attributes: Attributes
}
export type Attributes = { //TODO fill with actual known attributes
  title: string,
  cardNumber: number,
  cardCount: number, //total number of cards in set
  cardUid: string,
  expansion: {data: { id:number, attributes: {
    name: string,
    code: string,
    sortValue: number,
    [key: string]: any
  }}},
  [key: string]: any
}

export const CardTypes = ['Unit', 'Leader','Base','Event', 'None'];


function getCardExpansionCode(c: CardData) {
  return c.attributes.expansion.data.attributes.code;
}


export type CardExpansion = {
  code: string,
  name: string,
  sortValue: number,
}

export type aspect = {
  name: string,
  description: string,
  color: string
}
export type CardType = {
  CardData: CardData;
  title: string;
  cardNumber: number,
  cardUid: string;
  type: typeof CardTypes[number];
  expansion: CardExpansion,
  aspects: aspect[];
  variant: boolean;
  reprint: boolean;
  frontArt: {
    url:string,
    width: number,
    height: number,
    formats: {
      card: {
        url: string,
        width: number,
        height: number
      },
      xsmall: {
        url: string,
        width: number,
        height: number
      }
    }
  },
  artThumbnail: {
    url: string,
    height: number,
    width: number
  }
}
//a wrapper for the CardData
function wrapCard(c: CardData): CardType{
  // console.log((c.attributes.aspects));

  return {
    CardData: c,
    title: c.attributes.title,
    cardNumber: c.attributes.cardNumber,
    cardUid: c.attributes.cardUid,
    type: c.attributes.type.data?.attributes?.name ?? 'None',
    expansion: c.attributes.expansion.data.attributes,
    aspects: c.attributes.aspects.data.map((attr:{attributes:aspect})=>attr.attributes),
    reprint: (c.attributes.reprintOf.data && true),
    variant: (c.attributes.variantOf.data && true),
    frontArt: c.attributes.artFront.data.attributes,
    artThumbnail: c.attributes.artThumbnail.data.attributes
  }
}
export type CardDatabase = {
  byUid: { [uid: string]: CardType },
}
export const CARD_DATABASE: CardDatabase = {
  byUid: {},
}
export function getUniqueCardList(CDB:CardDatabase){
  return Object.values(CDB.byUid).filter(c => !c.variant && !c.reprint)
}


export function addCardDataToDatabase(c: CardData) {
  // console.log(c)
  const card = wrapCard(c);
  if (CARD_DATABASE.byUid[card.cardUid]) {
    //throw new Error("Uid already exists in database! " + card.cardUid);
  }
  CARD_DATABASE.byUid[card.cardUid] = card;
}

//uid of card, and the number of that card in the collection
export type playerCollection = {
  [cardUid: string]: number
}

type Pagination_Meta = {
  pagination: {
    page: number,
    pageSize: number,
    pageCount: number,
    total: number
  }
}

export async function getCardData() {

  const SW_API_URL = 'https://admin.starwarsunlimited.com/api/card-list';

  const CARDS: CardData[] = [];

  let res = await fetch(SW_API_URL);
  if (!res.ok) {
    throw new Error("Failed fetching cards");
  }
  while (res.ok) {
    const { data, meta }: { data: CardData[], meta: Pagination_Meta }
      = await res.json();
    if (data.length == 0) break;
    data.forEach(c => CARDS.push(c));
    const next_page = meta.pagination.page + 1;
    res = await fetch(SW_API_URL + '?pagination[page]=' + next_page);
  }
  CARDS.forEach(c => {
    if (!c.attributes.expansion.data.attributes.code) {
      console.log(c.attributes.title + "!!!")

    }
  })
  for (const c of CARDS) {
    addCardDataToDatabase(c);
  }
  return CARD_DATABASE;
}

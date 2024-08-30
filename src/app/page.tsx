import Image from "next/image";
import styles from "./page.module.css";
import { CARD_DATABASE, CardData, addCardDataToDatabase, getCardData, getUniqueCardList } from "@/Cards";
import Card from "@/Card";
import CollectionView from "@/CollectionView";
import Link from "next/link";
export default async function Home() {

  const cardDatabase = await getCardData();
  const cards = getUniqueCardList(cardDatabase);
  
  cards.sort((a, b) => a.title < b.title ? -1 : 1);
  return (
    <main className={styles.main}>
      {/* <div className={styles.cardlist}>
        {cards.map((card, i) => <Card key={i} card={card} />)}
      </div> */}
      <div className={styles.menuLink}><Link href={'./decks'}>Manage decks</Link></div>
      <div className={styles.menuLink}><Link href={'./collection'}>Manage collection</Link></div>
    </main>
  );
}




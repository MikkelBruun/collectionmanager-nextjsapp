import { getCardData, getUniqueCardList } from "@/Cards";
import CollectionView from "@/CollectionView"
import Link from "next/link"

export default async function Page() {
    const cardDatabase = await getCardData();
    return<>
        <Link href={'./'}>Back</Link>
        <CollectionView CDB={cardDatabase} />
    </>
}
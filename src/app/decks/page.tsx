import React from "react";
import { getCardData, getUniqueCardList } from "@/Cards";
import DeckBuilder from "@/DeckBuilder";
export default async function Page() {
    const cardDatabase = await (getCardData());
    return <div>
        <DeckBuilder CDB={cardDatabase}/>
    </div>
}
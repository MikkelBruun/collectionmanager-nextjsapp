'use client'

import { CardType } from "./Cards"
import styles from "./Card.module.css"
import Image from "next/image"
import { ComponentProps, useEffect } from "react"
export type CardProps = {
    card: CardType,
    onClick?: (c: CardType) => void,
    forceVertical?: boolean
}
export default function Card({ card, onClick, forceVertical}: CardProps) {
    const height = card.frontArt.height;
    const width = card.frontArt.width;
    let dimObj = { height, width }

    return <div 
        className={styles.card+' '+(forceVertical && height < width ? styles.rotated : '')}
        onClick={() => {
            console.log(card.CardData)
            onClick && onClick(card)
        }}
        style={dimObj}

    >
        <Image
            src={card.frontArt.url}
            height={height}
            width={width}
            alt="TODO ALT"
        />

    </div>
}

export function SmallCard(props: { card: CardType, count: number, onClick?: (c: any) => void }) {
    if (!props.card) return false;
    const { card, count, onClick } = props;
    // console.log(card)
    const height = card.artThumbnail.height;
    const width = card.artThumbnail.width;
    useEffect(() => {
    })
    return count > 0 && <div className={styles.smallCard} onClick={()=>{if(onClick)onClick(card)}}>
        <Image
            src={card.artThumbnail.url}
            height={height}
            width={width}
            alt="TODO ALT"
        />
        <span>{card.title}</span>
        <span>{count}</span>
    </div>
}
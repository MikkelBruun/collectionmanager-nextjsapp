'use client'
import { ComponentProps, FormEvent, Ref, useEffect, useState } from "react"
import Card from "./Card"
import styles from './CollectionView.module.css'
import { CARD_DATABASE,CardDatabase, playerCollection, CardType as CardType, CardTypes, getUniqueCardList } from "./Cards"
import { title } from "process"
import Link from "next/link"
import DeckBuilder, { DeckBuilderOptions } from "./DeckBuilder"

const STOREKEY = "collectionManagerUserDeck";

function getUserCollection(): playerCollection {
    const local = localStorage.getItem(STOREKEY);
    return local ? JSON.parse(local) : {};
}
function storeUserCollection(collection: playerCollection) {
    localStorage.setItem(STOREKEY, JSON.stringify(collection));
}

type CollectionViewProps = ComponentProps<'div'>&{
    CDB: CardDatabase,
    DeckBuilder?: DeckBuilderOptions
}

type filterFunction = (c:CardType) => boolean;
enum SortMode {
    default
}
export default function CollectionView({CDB, DeckBuilder, ...props}: CollectionViewProps) {
    const [collection, setCollection] = useState(null as playerCollection | null);
    const cardList = getUniqueCardList(CDB);
    useEffect(() => {
        const col = getUserCollection();
        console.log('first');
        console.log(col);
        setCollection(col);
    }, [])
    useEffect(() => {
        console.log('later');
        console.log(collection);
        if (collection) storeUserCollection(collection);
    },[collection])
    //searchPanel controls
    const [filterFunctions, setFilterFunctions] = useState([] as filterFunction[]);
    const [titleFilter, setTitleFilter] = useState('');
    const [showOnlyOwned, setShowOnlyOwned] = useState(DeckBuilder?true:false);
    const [type, setType] = useState('any'); 
    useEffect(() => {
        setFilterFunctions([
            c => titleFilter === '' || c.title.toLowerCase().includes(titleFilter.toLowerCase()),
            c => !showOnlyOwned || ((collection?.[c.cardUid] ?? 0) > 0),
            c => type === 'any' || type === c.type,
        ]);
    }, [
        collection,
        titleFilter,
        showOnlyOwned,
        type,
    ])
    //TODO better sorting options
    const [sortMode, setSortMode] = useState(SortMode.default);
    useEffect(() => {
        cardList.sort((a, b) => {
            if (a.expansion.sortValue < b.expansion.sortValue) return -1
            if (a.expansion.sortValue > b.expansion.sortValue) return 1
            if (a.cardNumber < b.cardNumber) return -1
            if (a.cardNumber > b.cardNumber) return 1
            return 0;
        });
    },[sortMode])
    return <div className={styles.collection} {...props}>
        {/* side control panel */}
        <div className={styles.searchPanel}>
            <Link href="./">Home</Link>
            <div className={styles.headerControls}>
                Collection
                <button onClick={()=>alert("TODO")}>Download</button>
                <button onClick={() => alert("TODO")}>upload</button>
            </div>
            <form>
                <label htmlFor="title">Title</label>
                <input type="text" name="title"
                    value={titleFilter}
                    onChange={e => setTitleFilter(e.target.value)} />
                <label htmlFor="inCollection">In collection</label>
                <input type='checkbox'
                    checked={showOnlyOwned}
                    onChange={() => setShowOnlyOwned(!showOnlyOwned)} />
                <label htmlFor="type">Card type</label>
                <select
                    name='type' value={type}
                    onChange={e => setType(e.target.value)}
                >
                    {
                        ['any', ...CardTypes].map(str => {
                            return <option key={str} value={str}>{str}</option>
                        })
                    }
                </select>
            </form>
        </div>
        {/* Cards rendered here */}
        <div>
            <div className={styles.container}>
                {collection && <RenderCardlist {...{
                    cardList,
                    filterFunctions:[...filterFunctions, c => c.type != 'Leader' && c.type != 'Base'],
                    collection,
                    setCollection,
                    DeckBuilder
                }}/>}
            </div>
            <div className={styles.horizontalContainer}>
                {collection && <RenderCardlist {...{
                    cardList,
                    filterFunctions: [...filterFunctions, c => c.type == 'Leader' || c.type == 'Base'],
                    collection,
                    setCollection,
                    DeckBuilder
                }} />}
            </div>
        </div>

        
    </div>
}

function RenderCardlist(props: {
    cardList: CardType[],
    filterFunctions: filterFunction[],
    collection: playerCollection,
    setCollection: (arg: playerCollection)=>void,
    DeckBuilder?: DeckBuilderOptions
}) {
    const { cardList,
        filterFunctions,
        collection,
        setCollection,
        DeckBuilder
    } = props;
    return <>
        {cardList
            .filter(c => {
                return filterFunctions.reduce((acc, cur) => {
                    return acc && cur(c);
                }, true)
            })
            .map((c, i) => {
                //DEBUG
                //     console.log(c.CardData.attributes?.type?.data?.name)
                //     console.log(c.CardData.attributes?.type?.data?.value)
                //\DEBUG
                const inCollection = collection?.[c.cardUid] ?? 0;
                const inCurrentDeck = DeckBuilder?.currentDeck?.[c.cardUid] ?? 0;
                return <div className={`${styles.cardField} ${inCollection ? '' : styles.unowned} ${DeckBuilder ? styles.inDeckbuilder : ''}`} key={i}>
                    <Card card={c} onClick={DeckBuilder ? (c) => DeckBuilder.setCurrentDeck({ ...DeckBuilder.currentDeck, [c.cardUid]: inCurrentDeck + 1 }) : undefined} />
                    <span className={styles.cardControls}>
                        <span className={DeckBuilder ? styles.twoNum : ''}>{(DeckBuilder ? `${inCurrentDeck}/` : '') + inCollection}</span>
                        <button onClick={() => {
                            const _count = inCollection - 1;
                            if (DeckBuilder && inCurrentDeck) {
                                const _cur = DeckBuilder.currentDeck[c.cardUid] ?? 0;
                                DeckBuilder.setCurrentDeck({ ...DeckBuilder.currentDeck, [c.cardUid]: _cur - 1 })
                            }
                            else if (!DeckBuilder && _count >= 0) setCollection({ ...collection, [c.cardUid]: _count })
                        }}>-</button>
                        <button onClick={() => {
                            if (DeckBuilder) {
                                const _cur = DeckBuilder.currentDeck[c.cardUid] ?? 0;
                                DeckBuilder.setCurrentDeck({ ...DeckBuilder.currentDeck, [c.cardUid]: _cur + 1 })
                            }
                            else setCollection({ ...collection, [c.cardUid]: inCollection + 1 })
                        }}>+</button>
                    </span>
                </div>
            })}
    </>
}

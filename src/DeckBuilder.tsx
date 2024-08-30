'use client'
import { ComponentProps, SetStateAction, useEffect, useState } from "react"
import { CardType, CardDatabase, playerCollection, getUniqueCardList} from "./Cards"
import { SmallCard } from "./Card"
import styles from "./DeckBuilder.module.css"
import CollectionView from "./CollectionView"
import Image from "next/image"
import Modal from "./Modal"
export type DeckBuilderProps = {
    CDB: CardDatabase
}
export type DeckBuilderOptions = {
    setCurrentDeck: (deck: playerCollection) => void,
    currentDeck: playerCollection,
    initialDeckString?: string,
    deckSaveFunction?: (deck: playerCollection)=>void
}

type userDecklist = {
    [deckName:string]: playerCollection
}
const STOREKEY = 'collectionManagerUserDecklist'
function getUserDecks(): userDecklist | null {
    const val = localStorage.getItem(STOREKEY);
    if (val) return JSON.parse(val);
    else return {};
}
function storeUserDecks(decks: userDecklist) {
    localStorage.setItem(STOREKEY, JSON.stringify(decks));
}

export default function DeckBuilder({CDB}: DeckBuilderProps) {
    const [currentDeck, _setCurrentDeck] = useState(null as null | playerCollection);
    //a wrapper to sanitize deck data (remove entries with count<1)
    const setCurrentDeck = (deck: SetStateAction<playerCollection | null>) => {
        if (deck) {
            _setCurrentDeck(Object.fromEntries(Object.entries(deck).filter(([uid,count])=>count > 0)));
        }
        else _setCurrentDeck(deck)
    }
    //used to determine if there are unsaved changes
    const [initialCurrentDeck, setInitialCurrentDeck] = useState(null as null | string);
    const [currentDeckName, setCurrentDeckName] = useState("");
    const [decks, setDecks] = useState(null as userDecklist | null);
    useEffect(() => {
        setDecks(getUserDecks);
    }, []);
    useEffect(() => {
        if (decks != null) storeUserDecks(decks)
    }, [decks]);
    useEffect(() => {
        if (initialCurrentDeck === null && currentDeck) {
            setInitialCurrentDeck(JSON.stringify(currentDeck));
        }
    },[currentDeck])
    const [modal, setModal] = useState(false);
    return <div>
        <Modal show={modal} close={() => setModal(false)}>
            test
        </Modal>
        {!currentDeck && (decks === null //wait for decks to load, or display decks to pick from
            ? <span>pls wait</span>
            : <div className={styles.deckPickerContainer}>
                <button onClick={()=>setModal(true)}>modal test</button>                
                {Object.entries(decks).map(([name, deck],i) => {
                    return <DeckPicker key={i}
                        name={name}
                        deck={deck}
                        CDB={CDB}
                        onClick={() => {
                            setCurrentDeck(deck);
                            setCurrentDeckName(name);
                        }}
                    />
                })}
                <button onClick={() => {
                    const name = prompt("Enter deck name") ?? "unitled";
                    setDecks({...decks, [name]:{}})
                }}>Make new deck</button>
            </div>)
        }
        {currentDeck && //main deckbuilding interface
            <div className={styles.deckBuilderContainer}>
                <DeckVisualizer CDB={CDB} DeckBuilder={{
                    currentDeck,
                    setCurrentDeck,
                    initialDeckString: initialCurrentDeck ?? undefined,
                    deckSaveFunction: (deck) => {
                        setDecks({ ...decks, [currentDeckName]: currentDeck });
                        setInitialCurrentDeck(JSON.stringify(currentDeck));
                    }
                }} />
                <CollectionView CDB={CDB} DeckBuilder={{
                    setCurrentDeck,
                    currentDeck,
                }} />
            </div>}
    </div>
}
type DeckPickerProps = {
    deck: playerCollection,
    name: string,
    CDB: CardDatabase
    onClick: (arg:any)=>any
}
function DeckPicker({ deck, name, CDB, ...props }: DeckPickerProps) {
    // const C1: CardType | null = CDB.byUid[Object.keys(deck)?.[0]] ?? null;
    const leader: CardType = CDB.byUid[Object.keys(deck).find(cardUid=>CDB.byUid[cardUid]?.type == 'Leader')??'']
    // const C2: CardType | null = CDB.byUid[Object.keys(deck)?.[1]] ?? null;
    const base: CardType = CDB.byUid[Object.keys(deck).find(cardUid => CDB.byUid[cardUid]?.type == 'Base') ?? '']
    return <div className={styles.deckElement}>
        <span>{name}</span>
        <div className={styles.deckFace} {...props}>
            {leader && <div className={styles.representative1}><Image height={leader.artThumbnail.height} width={leader.artThumbnail.width} src={leader.artThumbnail.url} alt="TODO ALT" /></div>}
            {base && <div className={styles.representative2}><Image height={base.artThumbnail.height} width={base.artThumbnail.width} src={base.artThumbnail.url} alt="TODO ALT" /></div>}
        </div>
    </div>
}
type DeckMeta = {
    name: string,
    leader: string,
    base: string
}


function DeckVisualizer(props: { CDB: CardDatabase, DeckBuilder: DeckBuilderOptions }) {
    const { currentDeck, setCurrentDeck, initialDeckString } = props.DeckBuilder;
    console.log(currentDeck)
    return props.CDB && <div className={styles.deckVisualizer}>
        <button
            disabled={JSON.stringify(currentDeck) == initialDeckString}
            className={styles.saveButton}
            onClick={()=>props.DeckBuilder.deckSaveFunction?.(currentDeck)}
        >SAVE</button>
        <div>
            {Object.entries(currentDeck).map(([key, val]) => {
                return <SmallCard key={key} card={props.CDB.byUid[key]} count={val} onClick={() => {
                    setCurrentDeck({ ...currentDeck, [key]: val-1})
                }}/>
            })}
        </div>
    </div>
}


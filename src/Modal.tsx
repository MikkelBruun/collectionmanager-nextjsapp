'use client'
import styles from '@/Modal.module.css'

export type ModalProps = {
    show: boolean,
    close: () => void,
    children: React.ReactNode,
}
export default function Modal(props: ModalProps) {
    return <div
        className={styles.background}
        style={{ display: props.show ? undefined : 'none' }}
        onClick={props.close}
    >
        <div className={styles.container}>
            test
        </div>

    </div>
}
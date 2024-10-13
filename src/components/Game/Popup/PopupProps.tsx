export interface PopupProps<T> {
    props: T
    onOpen: () => void
    onClose: () => void
}
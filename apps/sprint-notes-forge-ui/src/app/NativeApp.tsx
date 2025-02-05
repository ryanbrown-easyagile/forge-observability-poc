import { NativeNoteService } from "../services/nativeNoteService";
import BaseApp from "./BaseApp";

export function NativeApp() {
    const noteService = new NativeNoteService();
    return (
        <BaseApp noteService={noteService} />
    )
}

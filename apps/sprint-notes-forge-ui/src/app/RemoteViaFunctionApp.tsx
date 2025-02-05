import { RemoteViaFunctionNoteService } from "../services/removeViaFunctionNoteService";
import BaseApp from "./BaseApp";

export function RemoteViaFunctionApp() {
    const noteService = new RemoteViaFunctionNoteService();
    return (
        <BaseApp noteService={noteService} />
    )
}
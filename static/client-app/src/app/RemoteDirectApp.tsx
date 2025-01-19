import { RemoteNoteService } from "../services/remoteNoteService";
import BaseApp from "./BaseApp";

export function RemoteDirectApp() {
    const noteService = new RemoteNoteService();
    return (
        <BaseApp noteService={noteService} />
    )
}

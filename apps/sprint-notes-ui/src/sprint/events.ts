import { createEvent } from "react-event-hook";

export const { useSprintChangedListener, emitSprintChanged } = createEvent("sprintChanged")<number>();
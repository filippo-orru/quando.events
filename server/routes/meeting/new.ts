import { CalendarTimeslot } from "~/data/Meeting";
import { createMeeting } from "~/server/utils/db/meetings";

export default defineEventHandler(async (event) => {
  let meetingId = createMeeting();

  return sendRedirect(event, `/meeting/${meetingId}/name`);
})

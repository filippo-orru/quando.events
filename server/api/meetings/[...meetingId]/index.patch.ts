import { CalendarTimeslot, CalendarTimeslotSerialized } from "~/data/Meeting";
import { updateMeeting } from "~/server/utils/db/meetings";

export type UpdateMeeting = {
  title: string;
  selectedTimes: CalendarTimeslotSerialized[];
}

export default defineEventHandler(async (event) => {
  let body: UpdateMeeting = await readBody(event);
  let meetingId = event.context.params!.meetingId;
  let userId = event.context.authorizedUser.id!;

  let meeting = await updateMeeting(meetingId, userId, body);
  if (!meeting) {
    return { status: 404 };
  }
  return meeting;
})

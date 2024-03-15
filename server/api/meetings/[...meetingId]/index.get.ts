import { Meeting, getMeeting } from "~/server/utils/db/meetings";

export default defineEventHandler(async (event) => {
    let id = event.context.params!.meetingId;
    let meeting: Meeting | null = await getMeeting(id);
    
    return meeting;
});
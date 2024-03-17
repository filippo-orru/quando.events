import { MeetingSerialized } from "~/data/Meeting";
import { getMeeting } from "~/server/utils/db/meetings";


export default defineEventHandler(async (event) => {
    let id = event.context.params!.meetingId;
    let meeting: MeetingSerialized | null = await getMeeting(id);
    if (meeting) {
        return meeting;
    } else {
        return sendError(event, {
            message: "Meeting not found",
            name: "NotFound",
            statusCode: 404,
        });
    }
});
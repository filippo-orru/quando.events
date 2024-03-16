import { MeetingSerialized, serializeMeeting } from "~/data/Meeting";
import { Meeting, getMeeting } from "~/server/utils/db/meetings";


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
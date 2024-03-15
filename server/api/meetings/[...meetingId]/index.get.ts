import { MeetingMemberSerialized, MeetingSerialized, serializeCalendarTimeslot, serializeMeeting } from "~/data/Meeting";
import { Meeting, MeetingMember, getMeeting } from "~/server/utils/db/meetings";


export default defineEventHandler(async (event) => {
    let id = event.context.params!.meetingId;
    let meeting: Meeting | null = await getMeeting(id);
    if (!meeting) {
        return sendError(event, {
            message: "Meeting not found",
            name: "NotFound",
            statusCode: 404,
        });
    }

    console.log(meeting);
    return serializeMeeting(meeting);
});
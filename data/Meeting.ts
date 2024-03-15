export interface CalendarTimeslot {
    start: Date;
    end: Date;
}

export interface CalendarTimeslotSerialized {
    start: number;
    end: number;
}

export interface CalendarEntry extends CalendarTimeslot {
    id: String;
    title: string;
};

export type NewMeetingStep = {
    step: StepEnum;
    title: string;
    link: string;
}

export enum StepEnum  {
    Name, Times, Invite
}

export const NewMeetingSteps = {
    Calendar: {
        step: StepEnum.Times,
        title: 'Times',
        link: 'calendar'
    },
    Invite: {
        step: StepEnum.Invite,
        title: 'Invite',
        link: 'invite'
    }
}

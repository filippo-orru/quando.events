
export type NewMeetingStep = {
    step: StepEnum;
    title: string;
    link: string;
}

export enum StepEnum  {
    Name, Times, Invite
}

export const NewMeetingSteps = {
    Name: {
        step: StepEnum.Name,
        title: 'Name',
        link: 'name'
    },
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

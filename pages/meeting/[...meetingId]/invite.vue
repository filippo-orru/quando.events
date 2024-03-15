<script setup lang="ts">
import { NewMeetingSteps } from '~/data/Meeting';
</script>

<template>
    <NewMeetingWrapper :step="NewMeetingSteps.Invite" :padding="true">
        <section>
            Invite
        </section>
    </NewMeetingWrapper>
</template>
~/data/Meeting
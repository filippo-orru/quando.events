<script setup lang="ts">

</script>

<template>
    <NewMeetingWrapper v-slot="slotProps">
        <Calendar :props="slotProps.props" />
    </NewMeetingWrapper>
</template>
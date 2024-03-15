<script setup lang="ts">
// Redirect to /<meetingId>/calendar
let meetingId = (useRoute().params['meetingId'] as string[])[0];
navigateTo(`/meeting/${meetingId}/calendar`);
</script>
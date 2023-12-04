<template>
  <div class="wrapper">
    <div class="ma-0 pa-0">
      <BaseTabs :tabs="tabs" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseTabs from '@intake24-dietician/portal/components/common/BaseTabs.vue'
import FeedbackModules from '@intake24-dietician/portal/components/master-settings/FeedbackModules.vue'
import RecallReminders from '@intake24-dietician/portal/components/master-settings/RecallReminders.vue'
import Notifications from '@intake24-dietician/portal/components/master-settings/Notifications.vue'

console.log('HEllo')
const tabs = [
  { name: 'Feedback modules', value: 0, component: FeedbackModules },
  { name: 'Recall reminders', value: 1, component: RecallReminders },
  { name: 'Notifications', value: 2, component: Notifications },
]
</script>

<style scoped lang="scss">
.wrapper {
  background: rgb(252, 249, 244);
  background: -moz-linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  background: -webkit-linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  background: linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#fcf9f4",endColorstr="#ffffff",GradientType=1);
}
</style>

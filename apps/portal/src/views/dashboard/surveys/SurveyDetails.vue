<template>
  <v-main class="wrapper">
    <v-container>
      <v-row>
        <v-breadcrumbs :items="breadcrumbItems">
          <template v-slot:divider>
            <v-icon icon="mdi-chevron-right"></v-icon>
          </template>
        </v-breadcrumbs>
      </v-row>
      <v-row>
        <v-btn
          prepend-icon="mdi-chevron-left"
          flat
          class="text-none"
          variant="text"
          to="/dashboard/my-surveys"
        >
          Back to survey list
        </v-btn>
      </v-row>
      <v-row class="mt-6">
        <!-- <v-col cols="12" md="3"> -->
        <!-- <NavCard class="mx-sm-0 mx-auto mb-10" /> -->
        <!-- </v-col> -->
        <v-col cols="12" md="12">
          <router-view />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
// import NavCard from '@/components/surveys/NavCard.vue'
// import { useRoute } from 'vue-router'

// const { t } = useI18n<i18nOptions>()

// const router = useRouter()
// const route = useRoute()

const breadcrumbItems = ref([
  {
    title: 'My Surveys',
    disabled: false,
    href: '/dashboard/my-surveys',
  },
  {
    title: 'Survey settings',
    disabled: true,
    href: '',
  },
])

// const component = ref()

// const handleModuleUpdate = (module: ReturnType<typeof defineComponent>) => {
//   const segments = route.path.split('/')
//   segments.pop()
//   const path = segments.join('/')

//   component.value = module
//   router.push(`${path}${module}`)
// }
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

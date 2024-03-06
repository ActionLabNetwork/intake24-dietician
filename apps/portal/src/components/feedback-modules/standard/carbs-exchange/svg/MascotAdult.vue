<template>
  <svg
    :width="width ?? defaults.width"
    :height="height ?? defaults.height"
    viewBox="0 0 140 161"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse
      cx="74.602"
      cy="20.7238"
      rx="7.48538"
      ry="13.5673"
      transform="rotate(10.57 74.602 20.7238)"
      :fill="defaults.colors.lighter"
    />
    <ellipse
      cx="86.4962"
      cy="20.8042"
      rx="5.146"
      ry="9.32713"
      transform="rotate(10.57 86.4962 20.8042)"
      :fill="defaults.colors.lighter"
    />
    <ellipse
      cx="8.73826"
      cy="16.5416"
      rx="8.73826"
      ry="16.5416"
      transform="matrix(-0.983031 0.183437 0.183437 0.983031 67.4492 -1)"
      :fill="defaults.colors.lighter"
    />
    <rect
      x="10.9707"
      y="18.6484"
      width="121.637"
      height="121.637"
      rx="24"
      fill="defaults.colors.lighter"
    />
    <path
      d="M18.457 58.3926C18.457 41.422 18.457 32.9367 23.7291 27.6647C29.0012 22.3926 37.4865 22.3926 54.457 22.3926H80.8664C103.494 22.3926 114.808 22.3926 121.837 29.422C128.866 36.4515 128.866 47.7652 128.866 70.3926V88.5446C128.866 111.172 128.866 122.486 121.837 129.515C114.808 136.545 103.494 136.545 80.8664 136.545H62.457C41.7152 136.545 31.3443 136.545 24.9007 130.101C18.457 123.657 18.457 113.286 18.457 92.5446V58.3926Z"
      :fill="defaults.colors.base"
    />
    <path
      d="M64.5321 76.6489C64.5321 80.0836 63.5634 82.9858 61.7326 85.0063C59.9329 86.9923 57.0856 88.3641 52.8168 88.3641C48.548 88.3641 45.7008 86.9923 43.9011 85.0063C42.0702 82.9858 41.1016 80.0836 41.1016 76.6489C41.1016 70.1787 46.3467 64.9336 52.8168 64.9336C59.287 64.9336 64.5321 70.1787 64.5321 76.6489Z"
      fill="#2B2929"
      stroke="#2B2929"
      stroke-width="4.12507"
    />
    <circle cx="54.4781" cy="79.2457" r="4.21053" fill="white" />
    <path
      d="M102.895 76.6489C102.895 80.1943 102.106 83.0736 100.411 85.047C98.7658 86.9614 95.9706 88.3641 91.1801 88.3641C86.3896 88.3641 83.5944 86.9614 81.9495 85.047C80.2538 83.0736 79.4649 80.1943 79.4649 76.6489C79.4649 70.1787 84.71 64.9336 91.1801 64.9336C97.6503 64.9336 102.895 70.1787 102.895 76.6489Z"
      fill="#2B2929"
      stroke="#2B2929"
      stroke-width="4.12507"
    />
    <ellipse cx="93.7769" cy="79.2457" rx="4.21053" ry="4.21053" fill="white" />
    <path
      d="M61.4961 95.6191C61.4961 95.6191 64.3277 101.233 72.2563 101.233C80.1849 101.233 83.0166 95.6191 83.0166 95.6191"
      stroke="#2B2929"
      stroke-width="5"
      stroke-linecap="round"
    />
    <ellipse
      cx="5.57641"
      cy="10.7572"
      rx="5.57641"
      ry="10.7572"
      transform="matrix(0.980675 0.195645 -0.171942 0.985107 70.3477 11.1211)"
      :fill="defaults.colors.base"
    />
    <ellipse
      cx="3.83364"
      cy="7.39526"
      rx="3.83364"
      ry="7.39526"
      transform="matrix(0.980675 0.195645 -0.171942 0.985107 80.3184 14.8379)"
      :fill="defaults.colors.base"
    />
    <ellipse
      cx="6.50977"
      cy="13.1154"
      rx="6.50977"
      ry="13.1154"
      transform="matrix(-0.980675 0.195645 0.171942 0.985107 68.6504 5.54883)"
      :fill="defaults.colors.base"
    />
  </svg>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import useColorVariants from '@intake24-dietician/portal/composables/useColorVariants'

const props = defineProps<{
  height?: number
  width?: number
  fill?: string
}>()

const fill = toRefs(props).fill
const { colors } = useColorVariants(fill?.value ?? '#00DF59')

const defaults = ref({
  height: 40,
  width: 40,
  colors,
})
</script>

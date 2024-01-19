import { ComputedRef, ref } from 'vue'
import { type RouteLocationRaw, onBeforeRouteLeave } from 'vue-router'

export function useLeaveGuard(
  showDialog: () => void,
  unsavedChanges: ComputedRef<boolean>,
) {
  // const unsavedChanges = ref(false)
  const guardOn = ref(true)
  const destinationRoute = ref<RouteLocationRaw>({ name: 'My Profile' })

  onBeforeRouteLeave(async (to, from, next) => {
    if (!unsavedChanges.value) {
      next()
    } else {
      if (guardOn.value) {
        showDialog()
        destinationRoute.value = to
        next(false)
      } else {
        guardOn.value = true
        next()
      }
    }
  })

  function switchOffGuard() {
    guardOn.value = false
  }

  return {
    unsavedChanges,
    guardOn,
    destinationRoute,
    switchOffGuard,
  }
}

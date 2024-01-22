import { ref } from 'vue'
import { type RouteLocationRaw, onBeforeRouteLeave } from 'vue-router'

export function useLeaveGuard(showDialog: () => void, unsavedChanges: boolean) {
  const guardOn = ref(true)
  const destinationRoute = ref<RouteLocationRaw>({ name: 'My Profile' })
  const _unsavedChanges = ref(unsavedChanges)

  onBeforeRouteLeave(async (to, from, next) => {
    if (!_unsavedChanges.value) {
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
    _unsavedChanges,
    guardOn,
    destinationRoute,
    switchOffGuard,
  }
}

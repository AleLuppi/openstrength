import { ref } from "vue";
import { defineStore } from "pinia";

/**
 * Store info that may be useful for application management.
 */
export const useAppStore = defineStore("app", () => {
  // whether user has ever interacted with the app
  const hasInteracted = ref<boolean>(false);

  // current active element on supporting drawer
  const supportDrawerActiveElement = ref<number>();

  // display global dialogs
  const showDialogOnboarding = ref<boolean>(false);

  /**
   * Reset values in app storage.
   */
  function $reset() {
    hasInteracted.value = false;
    supportDrawerActiveElement.value = undefined;
    showDialogOnboarding.value = false;
  }

  return {
    hasInteracted,
    supportDrawerActiveElement,
    showDialogOnboarding,
    $reset,
  };
});

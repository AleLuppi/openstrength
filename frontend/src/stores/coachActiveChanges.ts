import { ref } from 'vue';
import { defineStore } from 'pinia';
import { Program } from 'src/helpers/programs/program';

/**
 * Store any unsaved changes that a coach user may have throughout the app.
 *
 * Currently stored changes:
 *  - program : program being created / updated from the builder.
 */
export const useCoachActiveChangesStore = defineStore(
  'coachActiveChanges',
  () => {
    // Current program under update
    const program = ref<Program>();
    const programChangeHistory = ref<Program[]>([]);

    /**
     * Reset values in user storage.
     */
    function $reset() {
      program.value = undefined;
      programChangeHistory.value = [];
    }

    return {
      program,
      programChangeHistory,
      $reset,
    };
  }
);

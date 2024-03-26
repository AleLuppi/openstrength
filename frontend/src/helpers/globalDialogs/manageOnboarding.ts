import { useAppStore } from "@/stores/app";
import { useCoachInfoStore } from "@/stores/coachInfo";
import { useUserStore } from "@/stores/user";
import { type User, UserRole } from "@/helpers/users/user";
import { ProgramExercise } from "@/helpers/programs/program";
import { sortExercises } from "@/helpers/exercises/listManagement";
import { defaultExerciseCollection } from "@/utils/defaultExerciseCollection";

/**
 * Actions to perform on onboarding dialog submit.
 *
 * @param data object data that shall be saved in user instance.
 */
export async function onOnboardingSubmit(data: { [key: string]: any }) {
  // Load stores
  const appStore = useAppStore();
  const user = useUserStore();
  const coachInfo = useCoachInfoStore();

  // Ensure dialog is not visible anymore
  appStore.showDialogOnboarding = false;

  // Save user info
  Object.assign(user.baseUser as User, data);
  user.saveUser();

  // Assign default exercise library to new coach
  if (user.role === UserRole.coach) {
    coachInfo.loadExercises(undefined, true, {
      onSuccess: (exercises?: ProgramExercise[]) => {
        if (exercises == undefined || exercises.length <= 0) {
          defaultExerciseCollection.forEach((exercise) =>
            exercise.variants?.forEach((variant) => variant.saveNew()),
          );
          coachInfo.exercises = defaultExerciseCollection;
          sortExercises(coachInfo.exercises, true);
        }
      },
    });
  }
}

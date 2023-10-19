<template>
  <!-- Show coming soon in case of athlete -->
  <div
    v-if="user.role == UserRole.athlete"
    class="q-mx-auto q-px-md q-py-lg limit-max-width text-center"
  >
    <img :src="logoFullImage" alt="Logo" />
    <h2>
      {{ $t("comingsoon.title") }}
    </h2>
    <p>
      {{ $t("comingsoon.subtitle") }}
    </p>
  </div>

  <!-- Show homepage in case of coach -->
  <div v-else-if="user.role == UserRole.coach">
    <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
      <h2 class="text-center">
        {{
          user.displayName
            ? $t("homepage.welcome_with_name", {
                name: user.displayName?.trim(),
              })
            : $t("homepage.welcome_without_name")
        }}
      </h2>
    </div>

    <!-- Show common actions -->
    <div class="row q-gutter-lg justify-center items-center">
      <router-link
        v-for="buttonInfo in buttonsInfo"
        :key="buttonInfo.to"
        :to="{ name: buttonInfo.to }"
        class="link-child"
      >
        <q-card
          class="q-pa-lg column items-center justify-center square-card q-hoverable text-center"
        >
          <!-- Animate when on -->
          <span class="q-focus-helper"></span>

          <!-- Show icon, title, and subtitle -->
          <q-icon :name="buttonInfo.icon" size="6em" color="icon-color" />
          <h4>
            {{ $t(buttonInfo.title) }}
          </h4>
          <p class="q-px-md text-weight-light">
            {{ $t(buttonInfo.subtitle) }}
          </p>
        </q-card>
      </router-link>
    </div>
  </div>

  <!-- Show call to action to unsigner user -->
  <div
    v-else-if="!user.isSignedIn"
    class="q-mx-auto q-px-md q-py-lg limit-max-width text-center"
  >
    <!-- Title and subtitle-->
    <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
      <h2 class="text-center">
        {{ $t("homepage.welcome_unsigned_user") }}
      </h2>
    </div>

    <!-- Show common actions -->
    <div class="row q-gutter-lg justify-center items-center">
      <router-link
        v-for="buttonUnsignedUser in buttonsUnsignedUser"
        :key="buttonUnsignedUser.to"
        :to="{ name: buttonUnsignedUser.to }"
        class="link-child"
      >
        <q-card
          class="q-pa-lg column items-center justify-center square-card q-hoverable text-center"
        >
          <!-- Animate when on -->
          <span class="q-focus-helper"></span>

          <!-- Show icon, title, and subtitle -->
          <q-icon
            :name="buttonUnsignedUser.icon"
            size="6em"
            color="icon-color"
          />
          <h4>
            {{ $t(buttonUnsignedUser.title) }}
          </h4>
          <p class="q-px-md text-weight-light">
            {{ $t(buttonUnsignedUser.subtitle) }}
          </p>
        </q-card>
      </router-link>
    </div>
  </div>

  <!-- Show call to action to signed user with no role -->
  <div
    v-else-if="
      user.isSignedIn &&
      (user.role == undefined || user.role == UserRole.unknown)
    "
    class="q-mx-auto q-px-md q-py-lg limit-max-width text-center"
  >
    <!-- Title and subtitle-->
    <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
      <h2 class="text-center">
        {{ $t("homepage.welcome_unknown_user") }}
      </h2>
    </div>

    <!-- Show common actions -->
    <div class="row q-gutter-lg justify-center items-center">
      <q-card
        @click="onCardClick"
        class="q-pa-lg column items-center justify-center square-card q-hoverable text-center"
      >
        <q-card-section>
          <!-- Animate when on -->
          <span class="q-focus-helper"></span>

          <!-- Show icon, title, and subtitle -->
          <q-icon name="question_answer" size="6em" color="icon-color" />
          <h4>
            {{ $t("homepage.actions.to_onboarding") }}
          </h4>
          <p class="q-px-md text-weight-light">
            {{ $t("homepage.actions.to_onboarding_caption") }}
          </p>
        </q-card-section>
      </q-card>

      <q-dialog v-model="showDialogOnboarding" persistent>
        <UserOnboarding></UserOnboarding>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { logoFullImage } from "@/assets/sources";
import { UserRole } from "@/helpers/users/user";
import UserOnboarding from "@/components/forms/UserOnboarding.vue";

// Get user state
const user = useUserStore();

// Get onboarding visibility
const showDialogOnboarding = ref(false);

function onCardClick() {
  showDialogOnboarding.value = true;
}

// Set action buttons
const buttonsInfo = [
  {
    to: "athletes",
    icon: "person_add",
    title: "homepage.actions.to_athletes",
    subtitle: "homepage.actions.to_athletes_caption",
  },
  {
    to: "library",
    icon: "edit_calendar",
    title: "homepage.actions.to_library",
    subtitle: "homepage.actions.to_library_caption",
  },
  {
    to: "schedule",
    icon: "rocket_launch",
    title: "homepage.actions.to_schedule",
    subtitle: "homepage.actions.to_schedule_caption",
  },
];

const buttonsUnsignedUser = [
  {
    to: "login",
    icon: "fa-solid fa-right-to-bracket",
    title: "homepage.actions.to_login_unsigned",
    subtitle: "homepage.actions.to_login_unsigned_caption",
  },
];
</script>

<style scoped lang="scss">
.square-card {
  width: 300px;
  /* Set your desired width for the square card */
  height: 300px;
  /* Set your desired height for the square card */
  border-radius: 16px;
  background: var(--bg-1, #fff);
  box-shadow: 0px 8px 32px 0px rgba(51, 38, 174, 0.08);
}
</style>

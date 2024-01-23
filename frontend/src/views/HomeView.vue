<template>
  <q-page
    class="q-mx-auto q-px-md q-py-lg text-center column justify-center items-stretch"
  >
    <div v-if="user.role == UserRole.athlete">
      <!-- Show coming soon in case of athlete -->
      <img :src="logoFullImage" :srcset="logoFullImage + ' 1.2x'" alt="Logo" />
      <h2 class="text-center">
        {{ $t("comingsoon.title") }}
      </h2>
      <p>
        {{ $t("comingsoon.subtitle") }}
      </p>
    </div>

    <div v-else-if="user.role == UserRole.coach">
      <!-- Show homepage in case of coach -->
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

      <!-- Common actions -->
      <div class="row q-gutter-lg justify-center items-center">
        <router-link
          v-for="buttonInfo in buttonsCoachAction"
          :key="buttonInfo.to"
          :to="{ name: buttonInfo.to }"
          class="link-child"
        >
          <q-card
            class="column items-center justify-center square-card q-hoverable text-center"
            :class="
              $q.screen.lt.sm
                ? 'q-pa-xs square-card-mobile'
                : 'q-pa-lg square-card'
            "
          >
            <!-- Animate when on -->
            <span class="q-focus-helper"></span>

            <!-- Icon, title, and subtitle -->
            <div class="column justify-center items-center">
              <q-icon
                :name="buttonInfo.icon"
                :size="$q.screen.lt.sm ? '3em' : '5em'"
                color="icon-color"
              />
              <h4 class="text-center">
                {{ $t(buttonInfo.title) }}
              </h4>
              <p class="q-px-md text-weight-light">
                {{ $t(buttonInfo.subtitle) }}
              </p>
            </div>
          </q-card>
        </router-link>
      </div>
    </div>

    <div v-else-if="!user.isSignedIn">
      <!-- Show call to action to unsigner user -->
      <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
        <h2 class="text-center">
          {{ $t("homepage.welcome_unsigned_user") }}
        </h2>
      </div>

      <!-- Common actions -->
      <div class="row q-gutter-lg justify-center items-center">
        <router-link
          v-for="buttonUnsignedUser in buttonsUnsigedAction"
          :key="buttonUnsignedUser.to"
          :to="{ name: buttonUnsignedUser.to }"
          class="link-child"
        >
          <q-card
            class="q-pa-lg column items-center justify-center square-card q-hoverable text-center"
          >
            <!-- Animate when on -->
            <span class="q-focus-helper"></span>

            <!-- Icon, title, and subtitle -->
            <q-icon
              :name="buttonUnsignedUser.icon"
              size="5em"
              color="icon-color"
            />
            <h4 class="text-center'">
              {{ $t(buttonUnsignedUser.title) }}
            </h4>
            <p class="q-px-md text-weight-light">
              {{ $t(buttonUnsignedUser.subtitle) }}
            </p>
          </q-card>
        </router-link>
      </div>
    </div>

    <div v-else>
      <!-- Show something else in all other cases -->
      <div class="q-pa-md q-pb-lg q-mx-auto limit-max-width">
        <h2 class="text-center">
          {{ $t("homepage.welcome_unknown_user") }}
        </h2>
      </div>

      <!-- Action -->
      <div class="row q-gutter-lg justify-center items-center">
        <q-card
          class="q-pa-lg column items-center justify-center square-card q-hoverable text-center cursor-pointer"
          clickable
          v-ripple
          @click="$emit('request-global-dialog', 'onboarding')"
        >
          <!-- Animate when on -->
          <span class="q-focus-helper"></span>

          <!-- Icon, title, and subtitle -->
          <q-icon
            name="fa-regular fa-circle-play"
            :size="$q.screen.lt.sm ? '3em' : '5em'"
            color="icon-color"
          />
          <p
            :class="
              $q.screen.lt.md ? 'text-center text-h6' : 'text-center text-h4'
            "
          >
            {{ $t("homepage.onboarding_title") }}
          </p>
          <p class="q-px-md text-weight-light">
            {{ $t("homepage.onboarding_subtitle") }}
          </p>
        </q-card>
      </div>
    </div>

    <!-- Show dialog for 12Feb deadline -->
    <q-dialog v-model="showDialogPresaleDeadline">
      <q-card class="q-pa-sm">
        <q-card-section class="q-pb-none">
          <h3 class="text-primary">
            Ancora pochi giorni per provare OpenStrength!
          </h3>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="light-dark"
            v-close-popup
            style="position: absolute; top: 0; right: 0"
          />
        </q-card-section>
        <q-card-section>
          <p class="q-pb-md text-md">
            Hai tempo fino al 12 Febbraio per provare liberamente OpenStrength,
            poi limiteremo gli accessi per qualche mese.
          </p>
          <p class="q-pb-md text-md">
            Vuoi continuare ad usare l'app?
            <span class="text-bold">Scrivici!</span>
          </p>

          <div
            v-for="[name, email, whatsapp, instagram] in [
              [
                'Lorenzo Amadori',
                'lorenzo.amadori1996@gmail.com',
                '393405489016',
                'amalo96',
              ],
              [
                'Lorenzo Boffa',
                'lorenzo.boffa06@gmail.com',
                '393468660263',
                'loreboffa',
              ],
            ]"
            class="row justify-between items-center q-col-gutter-md q-mb-md"
            :key="name"
          >
            <div class="col">
              <p class="text-bold" style="font-size: 1.1em">{{ name }}:</p>
            </div>
            <div>
              <a
                :href="
                  'mailto:' +
                  email +
                  '?subject=OpenStrength: informazioni accesso piattaforma&body=Ciao, vorrei avere più informazioni.'
                "
              >
                {{ email }}
              </a>
            </div>
            <div>
              <q-btn
                icon="fab fah fa-whatsapp"
                round
                :href="
                  'https://wa.me/' +
                  whatsapp +
                  '?text=Ciao!%20Vorrei%20qualche%20informazione%20in%20più%20riguardo%20a%20OpenStrength'
                "
                target="_blank"
                style="background-color: #25d366 !important"
              ></q-btn>
            </div>
            <div>
              <q-btn
                icon="fab fah fa-instagram"
                round
                :href="'https://www.instagram.com/' + instagram"
                target="_blank"
                style="background-color: #e1306c !important"
              ></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { logoFullImage } from "@/assets/sources";
import { UserRole } from "@/helpers/users/user";
import { onMounted, ref } from "vue";

// Define emits
defineEmits<{
  "request-global-dialog": [which: string];
}>();

// Get user state
const user = useUserStore();

// Show deadline dialog
const showDialogPresaleDeadline = ref(false);
onMounted(() => {
  setTimeout(() => {
    showDialogPresaleDeadline.value = true;
  }, 3000);
});

// Set coach action buttons
const buttonsCoachAction = [
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
    to: "program",
    icon: "rocket_launch",
    title: "homepage.actions.to_program",
    subtitle: "homepage.actions.to_program_caption",
  },
];

// Set unsigned user action buttons
const buttonsUnsigedAction = [
  {
    to: "login",
    icon: "fa-solid fa-right-to-bracket",
    title: "homepage.actions.to_login",
    subtitle: "homepage.actions.to_login_caption",
  },
];
</script>

<style scoped lang="scss">
.square-card {
  width: 270px;
  height: 270px;
  border-radius: 16px;
  background: var(--bg-1, #fff);
  box-shadow: 0px 8px 32px 0px rgba(51, 38, 174, 0.08);
}

.square-card-mobile {
  width: 300px;
  height: 150px;
  border-radius: 16px;
  background: var(--bg-1, #fff);
  box-shadow: 0px 8px 32px 0px rgba(51, 38, 174, 0.08);
}
</style>

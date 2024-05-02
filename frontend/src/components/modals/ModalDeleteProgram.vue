<template>
         <q-card class="q-pa-sm dialog-min-width">
          <q-card-section class="row items-center q-pb-none">
            <p>
              {{
                $t("coach.program_management.list.delete_program_confirm", {
                  program: props.deletingProgram?.name,
                })
              }}
            </p>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn          
              flat
              :label="$t('common.cancel')"
              @click="store.closeModal"
              color="button-negative"
            />
            <q-btn
              v-close-popup
              :label="$t('coach.program_management.list.delete_proceed')"
              color="button-negative"
              @click="if (props.deletingProgram) deleteProgram(props.deletingProgram);"
            />
          </q-card-actions>
        </q-card>
</template>

<script setup lang="ts">
import useModalStore from "@/stores/useModalStore";
import useProgramAssignment from 'src/composables/useProgramAssignment';
import { Program } from 'src/helpers/programs/program';
import { AthleteUser } from 'src/helpers/users/user';


const props = defineProps<{ deletingProgram: Program | undefined, 
    athlete: AthleteUser }>();

const store = useModalStore();
const {
        deleteProgram, 
        } = useProgramAssignment(props.athlete)


</script>


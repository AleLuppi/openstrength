import osButtonSupport from "@/components/basic/osButtonSupport.vue";
import osField from "@/components/basic/osField.vue";
import osInput from "@/components/basic/osInput.vue";
import osInputDate from "@/components/basic/osInputDate.vue";
import osSelect from "@/components/basic/osSelect.vue";
import osSelectInline from "@/components/basic/osSelectInline.vue";
import osTable from "@/components/basic/osTable.vue";
import osTableSheet from "@/components/basic/osTableSheet.vue";
import osTextCopyable from "@/components/basic/osTextCopyable.vue";
import osToggleButtons from "@/components/basic/osToggleButtons.vue";
import osVariableElement from "@/components/basic/osVariableElement.vue";
import osWrapWithçines from "@/components/basic/osWrapWithçines.vue";
import { QIntersection } from "quasar";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    osButtonSupport: typeof osButtonSupport;
    osField: typeof osField;
    osInput: typeof osInput;
    osInputDate: typeof osInputDate;
    osLazy: typeof QIntersection;
    osSelect: typeof osSelect;
    osSelectInline: typeof osSelectInline;
    osTable: typeof osTable;
    osTableSheet: typeof osTableSheet;
    osTextCopyable: typeof osTextCopyable;
    osToggleButtons: typeof osToggleButtons;
    osVariableElement: typeof osVariableElement;
    osWrapWithçines: typeof osWrapWithçines;
  }
}

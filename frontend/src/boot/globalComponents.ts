import { boot } from "quasar/wrappers";
// Custom components to register
import osButtonSupport from "@/components/basic/osButtonSupport.vue";
import osField from "@/components/basic/osField.vue";
import osInput from "@/components/basic/osInput.vue";
import osInputDate from "@/components/basic/osInputDate.vue";
import osLazy from "@/components/basic/osLazy.vue";
import osSelect from "@/components/basic/osSelect.vue";
import osSocialSharingItems from "@/components/basic/osSocialSharingItems.vue";
import osTable from "@/components/basic/osTable.vue";
import osTableSheet from "@/components/basic/osTableSheet.vue";
import osTextCopyable from "@/components/basic/osTextCopyable.vue";
import osToggleButtons from "@/components/basic/osToggleButtons.vue";
import osVariableElement from "@/components/basic/osVariableElement.vue";
import osWrapWithLines from "@/components/basic/osWrapWithLines.vue";

export default boot(async ({ app }) => {
  // Register components
  app.component("osButtonSupport", osButtonSupport);
  app.component("osField", osField);
  app.component("osInput", osInput);
  app.component("osInputDate", osInputDate);
  app.component("osLazy", osLazy);
  app.component("osSelect", osSelect);
  app.component("osSocialSharingItems", osSocialSharingItems);
  app.component("osTable", osTable);
  app.component("osTableSheet", osTableSheet);
  app.component("osTextCopyable", osTextCopyable);
  app.component("osToggleButtons", osToggleButtons);
  app.component("osVariableElement", osVariableElement);
  app.component("osWrapWithLines", osWrapWithLines);
});

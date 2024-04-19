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
  app.component("OsButtonSupport", osButtonSupport);
  app.component("OsField", osField);
  app.component("OsInput", osInput);
  app.component("OsInputDate", osInputDate);
  app.component("OsLazy", osLazy);
  app.component("OsSelect", osSelect);
  app.component("OsSocialSharingItems", osSocialSharingItems);
  app.component("OsTable", osTable);
  app.component("OsTableSheet", osTableSheet);
  app.component("OsTextCopyable", osTextCopyable);
  app.component("OsToggleButtons", osToggleButtons);
  app.component("OsVariableElement", osVariableElement);
  app.component("OsWrapWithLines", osWrapWithLines);
});

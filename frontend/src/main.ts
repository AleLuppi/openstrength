/***** Imports *****/
// Vue and related plugins
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Additional styling and frontend management
import { Quasar } from 'quasar'
import PrimeVue from 'primevue/config';
import quasarUserOptions from './quasar-user-options'
import i18n from './i18n'

// Additional import for PrimeVue
import "primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css"; /* Deprecated */
import "primeicons/primeicons.css";


import AutoComplete from 'primevue/autocomplete';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Badge from 'primevue/badge';
import BadgeDirective from "primevue/badgedirective";
import BlockUI from 'primevue/blockui';
import Button from 'primevue/button';
import Breadcrumb from 'primevue/breadcrumb';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import CascadeSelect from 'primevue/cascadeselect';
import Carousel from 'primevue/carousel';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import Chips from 'primevue/chips';
import ColorPicker from 'primevue/colorpicker';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmPopup from 'primevue/confirmpopup';
import ConfirmationService from 'primevue/confirmationservice';
import ContextMenu from 'primevue/contextmenu';
import DataTable from 'primevue/datatable';
import DataView from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
import DeferredContent from 'primevue/deferredcontent';
import Dialog from 'primevue/dialog';
import DialogService from 'primevue/dialogservice'
import Divider from 'primevue/divider';
import Dock from 'primevue/dock';
import Dropdown from 'primevue/dropdown';
import DynamicDialog from 'primevue/dynamicdialog';
import Fieldset from 'primevue/fieldset';
import FileUpload from 'primevue/fileupload';
import FocusTrap from 'primevue/focustrap';
import Galleria from 'primevue/galleria';
import Image from 'primevue/image';
import InlineMessage from 'primevue/inlinemessage';
import Inplace from 'primevue/inplace';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import Knob from 'primevue/knob';
import Listbox from 'primevue/listbox';
import MegaMenu from 'primevue/megamenu';
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import Message from 'primevue/message';
import MultiSelect from 'primevue/multiselect';
import OrderList from 'primevue/orderlist';
import OrganizationChart from 'primevue/organizationchart';
import OverlayPanel from 'primevue/overlaypanel';
import Paginator from 'primevue/paginator';
import Panel from 'primevue/panel';
import PanelMenu from 'primevue/panelmenu';
import Password from 'primevue/password';
import PickList from 'primevue/picklist';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Rating from 'primevue/rating';
import RadioButton from 'primevue/radiobutton';
import Ripple from 'primevue/ripple';
import Row from 'primevue/row';
import SelectButton from 'primevue/selectbutton';
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import Skeleton from 'primevue/skeleton';
import Slider from 'primevue/slider';
import Sidebar from 'primevue/sidebar';
import SpeedDial from 'primevue/speeddial';
import SplitButton from 'primevue/splitbutton';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Steps from 'primevue/steps';
import StyleClass from 'primevue/styleclass';
import TabMenu from 'primevue/tabmenu';
import TieredMenu from 'primevue/tieredmenu';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Toolbar from 'primevue/toolbar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Terminal from 'primevue/terminal';
import Timeline from 'primevue/timeline';
import ToggleButton from 'primevue/togglebutton';
import Tooltip from 'primevue/tooltip';
import Tree from 'primevue/tree';
import TreeSelect from 'primevue/treeselect';
import TreeTable from 'primevue/treetable';
import TriStateCheckbox from 'primevue/tristatecheckbox';
import VirtualScroller from 'primevue/virtualscroller';



/***** Set constant global properties *****/
export const appGlobals = {
};


/***** Build and start the application *****/
// Create the app
const app = createApp(App);

// Add global variables to be used in components
app.provide("appGlobals", appGlobals);
app.config.globalProperties.$appGlobals = appGlobals;

// Add plugins and start the application
app.use(Quasar, quasarUserOptions);
app.use(PrimeVue, { ripple: true });
app.use(ConfirmationService);
app.use(ToastService);
app.use(DialogService);
app.use(i18n);
app.use(router);

app.directive('tooltip', Tooltip);
app.directive('badge', BadgeDirective);
app.directive('ripple', Ripple);
app.directive('styleclass', StyleClass);
app.directive('focustrap', FocusTrap);

app.component('PrimeAccordion', Accordion);
app.component('PrimeAccordionTab', AccordionTab);
app.component('PrimeAutoComplete', AutoComplete);
app.component('PrimeAvatar', Avatar);
app.component('PrimeAvatarGroup', AvatarGroup);
app.component('PrimeBadge', Badge);
app.component('PrimeBlockUI', BlockUI);
app.component('PrimeBreadcrumb', Breadcrumb);
app.component('PrimeButton', Button);
app.component('PrimeCalendar', Calendar);
app.component('PrimeCard', Card);
app.component('PrimeCarousel', Carousel);
app.component('PrimeCascadeSelect', CascadeSelect);
app.component('PrimeCheckbox', Checkbox);
app.component('PrimeChip', Chip);
app.component('PrimeChips', Chips);
app.component('PrimeColorPicker', ColorPicker);
app.component('PrimeColumn', Column);
app.component('PrimeColumnGroup', ColumnGroup);
app.component('PrimeConfirmDialog', ConfirmDialog);
app.component('PrimeConfirmPopup', ConfirmPopup);
app.component('PrimeContextMenu', ContextMenu);
app.component('PrimeDataTable', DataTable);
app.component('PrimeDataView', DataView);
app.component('PrimeDataViewLayoutOptions', DataViewLayoutOptions);
app.component('PrimeDeferredContent', DeferredContent);
app.component('PrimeDialog', Dialog);
app.component('PrimeDivider', Divider);
app.component('PrimeDock', Dock);
app.component('PrimeDropdown', Dropdown);
app.component('PrimeDynamicDialog', DynamicDialog);
app.component('PrimeFieldset', Fieldset);
app.component('PrimeFileUpload', FileUpload);
app.component('PrimeGalleria', Galleria);
app.component('PrimeImage', Image);
app.component('PrimeInlineMessage', InlineMessage);
app.component('PrimeInplace', Inplace);
app.component('PrimeInputMask', InputMask);
app.component('PrimeInputNumber', InputNumber);
app.component('PrimeInputSwitch', InputSwitch);
app.component('PrimeInputText', InputText);
app.component('PrimeKnob', Knob);
app.component('PrimeListbox', Listbox);
app.component('PrimeMegaMenu', MegaMenu);
app.component('PrimeMenu', Menu);
app.component('PrimeMenubar', Menubar);
app.component('PrimeMessage', Message);
app.component('PrimeMultiSelect', MultiSelect);
app.component('PrimeOrderList', OrderList);
app.component('PrimeOrganizationChart', OrganizationChart);
app.component('PrimeOverlayPanel', OverlayPanel);
app.component('PrimePaginator', Paginator);
app.component('PrimePanel', Panel);
app.component('PrimePanelMenu', PanelMenu);
app.component('PrimePassword', Password);
app.component('PrimePickList', PickList);
app.component('PrimeProgressBar', ProgressBar);
app.component('PrimeProgressSpinner', ProgressSpinner);
app.component('PrimeRadioButton', RadioButton);
app.component('PrimeRating', Rating);
app.component('PrimeRow', Row);
app.component('PrimeSelectButton', SelectButton);
app.component('PrimeScrollPanel', ScrollPanel);
app.component('PrimeScrollTop', ScrollTop);
app.component('PrimeSlider', Slider);
app.component('PrimeSidebar', Sidebar);
app.component('PrimeSkeleton', Skeleton);
app.component('PrimeSpeedDial', SpeedDial);
app.component('PrimeSplitButton', SplitButton);
app.component('PrimeSplitter', Splitter);
app.component('PrimeSplitterPanel', SplitterPanel);
app.component('PrimeSteps', Steps);
app.component('PrimeTabMenu', TabMenu);
app.component('PrimeTabView', TabView);
app.component('PrimeTabPanel', TabPanel);
app.component('PrimeTag', Tag);
app.component('PrimeTextarea', Textarea);
app.component('PrimeTerminal', Terminal);
app.component('PrimeTieredMenu', TieredMenu);
app.component('PrimeTimeline', Timeline);
app.component('PrimeToast', Toast);
app.component('PrimeToolbar', Toolbar);
app.component('PrimeToggleButton', ToggleButton);
app.component('PrimeTree', Tree);
app.component('PrimeTreeSelect', TreeSelect);
app.component('PrimeTreeTable', TreeTable);
app.component('PrimeTriStateCheckbox', TriStateCheckbox);
app.component('PrimeVirtualScroller', VirtualScroller);


app.mount('#app');



import type { ComponentConstructor } from "quasar";
import { QBtn, QTab, QTabs, QTabPanels } from "quasar";

// Set default props
export default () => {
  setQuasarComponentDefaultPropValues(QBtn, {
    noCaps: true,
    color: "primary",
  });
  setQuasarComponentDefaultPropValues(QTabs, {
    narrowIndicator: true,
    dense: true,
    align: "left",
  });
  setQuasarComponentDefaultPropValues(QTab, {
    noCaps: true,
    ripple: false,
  });
  setQuasarComponentDefaultPropValues(QTabPanels, {
    animated: true,
  });
};

// Define useful type
type ExtractComponentProps<T> = T extends ComponentConstructor<infer X>
  ? X["$props"]
  : never;

/**
 * Set default properties for a quasar component
 *
 * @param component quasar component whose props shall be set
 * @param propDefaults props to set as default
 */
const setQuasarComponentDefaultPropValues = <T extends ComponentConstructor>(
  component: T,
  propDefaults: {
    [K in keyof Partial<ExtractComponentProps<T>>]: ExtractComponentProps<T>[K];
  },
) => {
  for (const key in propDefaults) {
    const prop = component.props[key];
    switch (typeof prop) {
      case "object":
        prop.default = propDefaults[key];
        break;
      case "function":
        component.props[key] = {
          type: prop,
          default: propDefaults[key],
        };
        break;
      case "undefined":
        throw new Error("unknown prop: " + key);
      default:
        throw new Error("unhandled type: " + typeof prop);
    }
  }
};

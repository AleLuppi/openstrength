import { store } from "quasar/wrappers";
import { createPinia } from "pinia";
import { Router } from "vue-router";

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module "pinia" {
  export interface PiniaCustomProperties {
    readonly router: Router;
  }
}

/*
 * If not building with SSR mode, it is possible
 * to directly export the Store instantiation;
 *
 * The function below can be async too (use async
 * or return a Promise).
 */

export default store((/* { ssrContext } */) => {
  const pinia = createPinia();

  // Add Pinia plugins here
  //   pinia.use(SomePiniaPlugin)

  return pinia;
});

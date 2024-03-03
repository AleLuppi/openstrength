import { Config } from "@/boot/config";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties extends Config {}
}

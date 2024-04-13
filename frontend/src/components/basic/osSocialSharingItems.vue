<template>
  <q-list>
    <q-item
      v-for="network in networks"
      :key="network.network"
      class="q-pa-none"
    >
      <ShareNetwork
        :network="network.network"
        :url="network.url"
        :title="network.title"
        :description="network.description"
        :quote="network.quote"
        :hashtags="network.hashtags"
        :twitter-user="network.twitterUser"
        :media="network.media"
        class="social-grid-item no-decoration"
      >
        <div class="column items-center">
          <q-icon
            :name="network.icon"
            size="2em"
            color="white"
            :style="{
              backgroundColor: network.color,
            }"
            class="social-icon"
          />
          <span v-if="displayNames" class="social-grid-text">{{
            network.name
          }}</span>
        </div>
      </ShareNetwork>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Define network interface
const allNetworks = [
  "whatsapp",
  "telegram",
  "messenger",
  "sms",
  "facebook",
  "twitter",
  "email",
] as const;
type Networks = {
  network: (typeof allNetworks)[number];
  name: string;
  icon: string;
  color: string;
  url: string;
  title?: string;
  description?: string;
  quote?: string;
  hashtags?: string;
  twitterUser?: string;
  media?: string;
}[];

// Define props
const props = defineProps<{
  // Network-related props
  url: string | Record<Networks[number]["network"], string>;
  title?: string | Record<Networks[number]["network"], string>;
  description?: string | Record<Networks[number]["network"], string>;
  quote?: string | Record<Networks[number]["network"], string>;
  hashtags?: string | Record<Networks[number]["network"], string>;
  twitterUser?: string | Record<Networks[number]["network"], string>;
  media?: string | Record<Networks[number]["network"], string>;

  // Network-related props that shall not be set
  name?: Record<Networks[number]["network"], string>;
  icon?: Record<Networks[number]["network"], string>;
  color?: Record<Networks[number]["network"], string>;

  // Custom props
  networks?: Networks[number]["network"][];
  excludeNetworks?: Networks[number]["network"][];
  displayNames?: boolean;
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | string;
}>();

// Set networks values
const networks = computed<Networks>(() => {
  return (props.networks ?? allNetworks)
    .filter((network) => !props.excludeNetworks?.includes(network))
    .map((network) => {
      // Set basic info
      let name = "",
        icon = "",
        color = "";
      switch (network) {
        case "whatsapp":
          name = "Whatsapp";
          icon = "fab fah fa-whatsapp";
          color = "#25d366";
          break;
        case "telegram":
          name = "Telegram";
          icon = "fab fah fa-telegram-plane";
          color = "#0088cc";
          break;
        case "messenger":
          name = "Messenger";
          icon = "fab fah fa-facebook-messenger";
          color = "#0084ff";
          break;
        case "sms":
          name = "SMS";
          icon = "far fah fa-comment-dots";
          color = "#36e234";
          break;
        case "facebook":
          name = "Facebook";
          icon = "fab fah fa-facebook-f";
          color = "#1877f2";
          break;
        case "twitter":
          name = "Twitter";
          icon = "fab fah fa-twitter";
          color = "#1da1f2";
          break;
        case "email":
          name = "Email";
          icon = "far fah fa-envelope";
          color = "#f14336";
          break;
      }
      name = props.name?.[network] ?? name;
      icon = props.icon?.[network] ?? icon;
      color = props.color?.[network] ?? color;

      // Complete the object
      return {
        network: network,
        name: name,
        icon: icon,
        color: color,
        url: typeof props.url === "string" ? props.url : props.url[network],
        title:
          typeof props.title === "string"
            ? props.title
            : props.title?.[network],
        description:
          typeof props.description === "string"
            ? props.description
            : props.description?.[network],
        quote:
          typeof props.quote === "string"
            ? props.quote
            : props.quote?.[network],
        hashtags:
          typeof props.hashtags === "string"
            ? props.hashtags
            : props.hashtags?.[network],
        twitterUser:
          typeof props.twitterUser === "string"
            ? props.twitterUser
            : props.twitterUser?.[network],
        media:
          typeof props.media === "string"
            ? props.media
            : props.media?.[network],
      };
    });
});
</script>

<style scoped lang="scss">
.social-icon {
  background-color: #778890;
  padding: 0.3em;
  border-radius: 0.3em;
}

.social-grid-text {
  font-weight: normal;
  margin-block-start: 2px;
}

.social-grid-item {
  padding: 2px;
  border-radius: 5px;

  &[class^="share-network"] {
    outline: none;

    &:hover {
      background-color: inherit;
    }

    &:focus {
      background-color: #ddd;
    }
  }
}
</style>

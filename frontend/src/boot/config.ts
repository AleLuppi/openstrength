export type Config = {
  $appProperties: {
    name: string;
    version: string;
  };
};

const config: Config = {
  $appProperties: {
    name: "OpenStrength",
    version: "v0.5.7",
  },
};

export default config;

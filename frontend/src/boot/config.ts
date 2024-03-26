export type Config = {
  $appProperties: {
    name: string;
    version: string;
  };
};

const config: Config = {
  $appProperties: {
    name: "OpenStrength",
    version: "v0.5.3",
  },
};

export default config;

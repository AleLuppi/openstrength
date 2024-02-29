export type Config = {
  $appProperties: {
    name: string;
    version: string;
  };
};

const config: Config = {
  $appProperties: {
    name: "OpenStrength",
    version: "v0.3.4",
  },
};

export default config;

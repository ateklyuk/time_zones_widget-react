import log4js from "log4js";

log4js.configure({
  appenders: {
    out: {
      type: "stdout",
      layout: {
        type: "pattern",
        pattern: "%d %p %f:%l %m%n",
      },
    },
    everything: {
      type: "file",
      filename: "./logs/logs.log",
      maxLogSize: 1024000,
      layout: {
        type: "pattern",
        pattern: "%d %p %f:%l %m%n",
      },
    },
  },
  categories: {
    default: { appenders: ["everything", "out"], level: "debug", enableCallStack: true },
  },
});
export const mainLogger = log4js.getLogger();

export const getUserLogger = (subdomain: string | null) => {
  log4js.configure({
    appenders: {
      out: {
        type: "stdout",
        layout: {
          type: "pattern",
          pattern: "%d %p %f:%l %m%n",
        },
      },
      everything: {
        type: "file",
        filename: `./logs/${subdomain}/logs.log`,
        maxLogSize: 1024000,
        layout: {
          type: "pattern",
          pattern: "%d %p %f:%l %m%n",
        },
      },
    },
    categories: {
      default: { appenders: ["everything", "out"], level: "debug", enableCallStack: true },
    },
  });

  return log4js.getLogger();
}

import { style, Color } from "jsr:@liavbarsheshet/styled-terminal";

const print = (level: "info" | "error" | "warn" | "completed" | "task", message: string) => {
  const colors = {
    info: Color.blue,
    error: Color.red,
    warn: Color.yellow,
    task: Color.cyan,
    completed: Color.green,
  };

  let logger = console.log;

  if (level === "error") logger = console.error;
  if (level === "warn") logger = console.warn;

  const now = new Date();
  const timestamp = now.toISOString();

  const formattedTime = timestamp.replace("T", " ").replace("Z", "").slice(0, 19).replace(/-/g, "/");

  logger(style.fg(Color.magenta)(`[${formattedTime}]`), style.fg(colors[level])(`${level.toUpperCase()}:`), message);
};

export default {
  info: (message: string) => print("info", message),
  error: (message: string) => print("error", message),
  warn: (message: string) => print("warn", message),
  completed: (message: string) => print("completed", message),
  task: (message: string) => print("task", message),
};

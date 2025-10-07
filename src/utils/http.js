export const isAbortError = (error) => {
  if (!error) {
    return false;
  }

  const name = error.name || error.constructor?.name;
  if (name && name.toLowerCase().includes("abort")) {
    return true;
  }

  const code = typeof error.code === "string" ? error.code.toUpperCase() : "";
  if (code === "ERR_CANCELED" || code === "ECONNABORTED") {
    return true;
  }

  const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
  return message.includes("aborted") || message.includes("canceled");
};

export default { isAbortError };

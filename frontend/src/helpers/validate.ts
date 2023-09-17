/**
 * Check if string is a valid email address.
 *
 * @param email string to check
 * @returns true if string is a valid email address.
 */
export function validateEmail(email: string): Boolean {
  return Boolean(
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      ),
  );
}

/**
 * Check if string is a valid password.
 * @param password string to check.
 * @returns true if string is a valid password.
 */
export function validatePassword(password: string): Boolean {
  return Boolean(
    String(password).match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
  );
}

/**
 * Check if string is a valid HTTP/HTTPS url
 *
 * @param url string to check.
 * @returns true if string is a valid url.
 */
export function validateUrlHttp(url: string): Boolean {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$", // validate fragment locator
    "i",
  );
  return !!urlPattern.test(url);
}

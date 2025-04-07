// src/utils/generateRandomUuid.js

export function generateRandomUuid(length = 5) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let uuid = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uuid += characters[randomIndex];
  }
  return uuid;
}

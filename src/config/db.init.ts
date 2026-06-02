import { initDB } from "../db/index";

const main = async () => {
  try {
    await initDB();
    console.log("DB initialization complete.");
    process.exit(0);
  } catch (err) {
    console.error("DB init failed:", err);
    process.exit(1);
  }
};

main();

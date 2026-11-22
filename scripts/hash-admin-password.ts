import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { hash } from "bcryptjs";

async function main() {
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    const password = await prompt.question("Admin password (input is visible): ");
    if (password.length < 12) {
      throw new Error("Choose an admin password with at least 12 characters.");
    }
    console.log(await hash(password, 12));
  } finally {
    prompt.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Could not create password hash.");
  process.exitCode = 1;
});

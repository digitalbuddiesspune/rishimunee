import "dotenv/config";
import readline from "readline";
import { connectDatabase } from "../config/db.js";
import { Admin } from "../models/Admin.js";
import { USER_ROLES } from "../utils/constants.js";

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = { email: null, password: null, force: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--email" || a === "-e") out.email = args[++i];
    else if (a === "--password" || a === "-p") out.password = args[++i];
    else if (a === "--force" || a === "-f") out.force = true;
  }
  return out;
};

const askHidden = (query) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const onData = (char) => {
      char = char + "";
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          process.stdout.write("\n");
          process.stdin.removeListener("data", onData);
          break;
        default:
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(query + Array(rl.line.length + 1).join("*"));
          break;
      }
    };
    process.stdin.on("data", onData);
    rl.question(query, (value) => {
      rl.history = rl.history.slice(1);
      rl.close();
      resolve(value);
    });
  });

const run = async () => {
  const { email: argEmail, password: argPassword, force } = parseArgs();
  const email = argEmail || process.env.SUPERADMIN_EMAIL;
  let password = argPassword || process.env.SUPERADMIN_PASSWORD;

  if (!email) {
    console.error("Missing email. Pass with --email or set SUPERADMIN_EMAIL.");
    process.exit(1);
  }
  if (!password) {
    password = await askHidden("Enter superadmin password: ");
  }
  if (!password || password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  await connectDatabase();

  const existing = await Admin.findOne({ email }).select("+password role");
  if (existing) {
    if (!force) {
      console.error(`Admin already exists for ${email}. Use --force to reset password.`);
      process.exit(1);
    }
    existing.password = password;
    if (existing.role !== USER_ROLES.SUPERADMIN) existing.role = USER_ROLES.SUPERADMIN;
    await existing.save();
    console.log(`Updated password and role for ${email} (now superadmin).`);
    process.exit(0);
  }

  const admin = await Admin.create({ email, password, role: USER_ROLES.SUPERADMIN });
  console.log(`Created superadmin: ${admin.email}`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to create superadmin:", err.message);
  process.exit(1);
});


import { connectDb } from "../config/db";
import { User } from "../models/User";
import { Category } from "../models/Category";

const categories = [
  "Naruto",
  "One Piece",
  "Tokyo Ghoul",
  "Demon Slayer",
  "Dragon Ball",
  "Attack on Titan"
];

const seed = async () => {
  await connectDb();

  await Category.deleteMany({});
  await User.deleteMany({});

  await Category.insertMany(categories.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-") })));

  await User.create({
    name: "Admin",
    email: "admin@morfyx.studio",
    password: "Admin@12345",
    role: "admin"
  });

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { prisma } from "../src/lib/prisma.js";

async function main() {

    //create test users
    const user1 = await prisma.user.create({
        data: {
            id: "user1",
            name: "John Doe", 
            email: "john@example.com",
            username: "johndoe",
        },
    });

    const user2 = await prisma.user.create({
        data: {
            id: "user2",
            name: "Jane Smith",
            email: "jane@example.com",
            username: "janesmith",
        },
    });

    await prisma.post.createMany({
        data: [
            {
                userId: user1.id,
                content: "This is the first test post",
                score: 10,
            },
            {
                userId: user2.id,
                content: "This is the second post.",
                score: 25,
            },
            {
                userId: user1.id,
                content: "This is the third post.",
                score: 15,
            },
        ],
    });

    console.log("Database seeded successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
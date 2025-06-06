import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import { sendWelcomeEmail } from "./lib/email"; 

 
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Google],
    events: {
        async createUser({ user }) {
            if (user.email) {
            await sendWelcomeEmail(user.email);
            }
        },
    },
});
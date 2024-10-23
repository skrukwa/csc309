import emailValidator from "email-validator";
import { compare } from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === "POST") {
        await handlePost(req, res);
    } else {
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}

async function handlePost(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Invalid fields" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION },
    );
    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION },
    );

    res.status(201).json({
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            avatar: user.avatar,
            templates: user.templates,
            posts: user.posts,
            comments: user.comments,
            reports: user.reports,
        },
        accessToken,
        refreshToken,
    });
}

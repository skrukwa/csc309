import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === "POST") {
        await handlePost(req, res);
    } else {
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}

async function handlePost(req, res) {
    const token = req.headers.authorization?.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
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
        res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
        res.status(401).json({ message: "Unauthorized" });
    }
}

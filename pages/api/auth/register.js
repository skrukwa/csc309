import emailValidator from "email-validator";
import { hash } from "bcrypt";
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
    const { firstName, lastName, email, phone, isAdmin, avatar, password } =
        req.body;

    if (
        !firstName ||
        firstName.length > 100 ||
        !lastName ||
        lastName.length > 100 ||
        !email ||
        !phone ||
        !password
    ) {
        return res.status(400).json({ message: "Invalid fields" });
    }

    if (!emailValidator.validate(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }

    if (!phone.match(/^\d{10}$/)) {
        return res.status(400).json({ message: "Invalid phone number" });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            phone,
            isAdmin,
            avatar,
            password: hashedPassword,
        },
    });

    const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" },
    );
    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" },
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

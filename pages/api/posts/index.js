import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { average, sort_by_ordering } from "@/utils/array_manipulations";

export default async function handler(req, res) {
    if (req.method === "GET") {
        // Get list of posts
        // Permission required: none
        let {
            token,
            title,
            content,
            tags,
            templates,
            sortby,
            page_size,
            page_number,
        } = req.query;

        //validate data:
        page_size = parseInt(page_size);
        page_number = parseInt(page_number);
        if (!page_size || page_size < 1) {
            page_size = 1;
        }
        if (!page_number || page_number < 1) {
            page_number = 1;
        }

        if (!title || typeof title !== "string") {
            title = "";
        }
        if (!content || typeof content !== "string") {
            content = "";
        }
        if (!tags || !Array.isArray(templates)) {
            tags = [];
        }
        if (!templates || !Array.isArray(templates)) {
            templates = [];
        }

        let decoded_token = verify_access_token(token);
        let userId = null;
        if (decoded_token) {
            userId === decoded_token.userId;
        }

        let ordering = (a, b) => a > b;

        if (sortby === "highest") {
            // sort by highest rating
            ordering = (a, b) => sum(a.rating.rating) > sum(b.rating.rating);
        } else if (sortby === "lowest") {
            // sort by lowest rating
            ordering = (a, b) => sum(a.rating.rating) < sum(b.rating.rating);
        } else if (sortby === "controversial") {
            // sort by most controversial
            ordering = (a, b) =>
                Math.abs(average(a.rating.rating)) <
                Math.abs(average(b.rating.rating));
        } else if (sortby === "reports") {
            // sort by most reports
            if (decoded_token !== null && decoded_token.isAdmin) {
                ordering = (a, b) => a.reports.length > b.reports.length;
            } else {
                return res
                    .status(403)
                    .json({ error: "You must be an admin to sort by reports" });
            }
        } else if (sortby === "newest") {
            // sort by newest
            ordering = (a, b) => a.createdAt > b.createdAt;
        } else {
            return res.status(400).json({
                error: 'Invalid sortby parameter, sortby must be, "highest", "lowest", "controversial", "reports", or "newest"',
            });
        }

        let unsorted_posts = await search_posts(
            userId,
            title,
            content,
            tags,
            templates,
        );
        let sorted_posts = sort_by_ordering(unsorted_posts, ordering);
        return res.status(200).json({
            posts: paginateArray(sorted_posts, page_size, page_number),
        });
    } else if (req.method === "POST") {
        // Create a new post
        // Permission required: logged in
        let { token, title, description, content, tags, templates } = req.body;
        let decoded_token = verify_access_token(token);
        if (decoded_token === null || !decoded_token || !decoded_token.id) {
            return res
                .status(403)
                .json({ error: "You must be logged in to create a post" });
        }
        //validate data:
        if (!title || typeof title !== "string") {
            return res.status(400).json({ error: "Title is required" });
        }
        if (!description || typeof description !== "string") {
            return res.status(400).json({ error: "Description is required" });
        }
        if (!content) {
            return res.status(400).json({ error: "Content is required" });
        }
        if (!tags || !Array.isArray(tags)) {
            tags = [];
        }
        if (!templates || !Array.isArray(templates)) {
            templates = [];
        }
        // create post
        let post = await prisma.post.create({
            data: {
                title: title,
                content: content,
                tags: {
                    connect: tags.map((tag) => {
                        return { name: tag };
                    }),
                },
                description: description,
                templates: {
                    connect: templates.map((template) => {
                        return { name: template };
                    }),
                },
                user: {
                    connect: { id: parseInt(decoded_token.id) },
                },
            },
        });
        return res
            .status(200)
            .json({ message: "Post created successfully", post: post });
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}

async function search_posts(user, title, content, tags, templates) {
    //Search posts
    let query = { where: {} };
    if (title) {
        query.Where.title = {
            contains: title,
        };
    }
    if (content) {
        query.Where.content = {
            contains: content,
        };
    }
    if (user !== null) {
        query.Where.OR = [
            {
                user: {
                    id: user,
                },
            },
            {
                user: {
                    hidden: false,
                },
            },
        ];
    } else {
        query.where.hidden = false;
    }
    let all_unsorted_posts = await prisma.post.findMany(query);
    return all_unsorted_posts;
}

function verify_access_token(token) {
    //Verify access token
    // TODO implement
    return token;
}

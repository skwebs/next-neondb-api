import { z } from "zod";

export const createUserSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name too long"),

    email: z
        .email("Invalid email address")
        .toLowerCase()
});

export const updateUserSchema = z.object({
    id: z.string(),

    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100)
        .optional(),

    email: z
        .email("Invalid email address")
        .toLowerCase()
}).refine(
    (data) => data.email,
    {
        message: "At least one field (name or email) is required"
    }
);

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// import { z } from "zod";

// export const createUserSchema = z.object({
//     name: z
//         .string()
//         .min(2, "Name must be at least 2 characters")
//         .max(100, "Name too long"),

//     email: z
//         .email("Invalid email format"),
// });

// export type CreateUserInput = z.infer<typeof createUserSchema>;
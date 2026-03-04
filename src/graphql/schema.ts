import { makeExecutableSchema } from "@graphql-tools/schema";
import { prisma } from "@/lib/prisma";
import { GraphQLError } from "graphql";

import {
    createUserSchema,
    updateUserSchema,
    CreateUserInput,
    UpdateUserInput
} from "@/validations/user.validation";

type UserArgs = {
    id: string;
};

const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String, email: String!): User!
    updateUser(id: ID!, name: String, email: String): User!
    deleteUser(id: ID!): Boolean!
  }
`;

const resolvers = {
    Query: {
        users: async () => {
            return prisma.user.findMany({
                orderBy: { createdAt: "asc" }
            });
        },

        user: async (_: unknown, args: UserArgs) => {
            return prisma.user.findUnique({
                where: { id: Number(args.id) }
            });
        }
    },

    Mutation: {

        // CREATE USER
        createUser: async (_: unknown, args: CreateUserInput) => {

            const result = createUserSchema.safeParse(args);

            if (!result.success) {
                throw new GraphQLError(result.error.issues[0].message, {
                    extensions: { code: "BAD_USER_INPUT" }
                });
            }

            try {
                return await prisma.user.create({
                    data: result.data
                });

            } catch (error: unknown) {

                if (
                    typeof error === "object" &&
                    error !== null &&
                    "code" in error &&
                    (error as { code?: string }).code === "P2002"
                ) {
                    throw new GraphQLError("Email already exists", {
                        extensions: { code: "BAD_USER_INPUT" }
                    });
                }

                throw new GraphQLError("Internal server error", {
                    extensions: { code: "INTERNAL_SERVER_ERROR" }
                });
            }
        },


        // UPDATE USER
        updateUser: async (_: unknown, args: UpdateUserInput) => {

            const result = updateUserSchema.safeParse(args);

            if (!result.success) {
                throw new GraphQLError(result.error.issues[0].message, {
                    extensions: { code: "BAD_USER_INPUT" }
                });
            }

            const { id, ...data } = result.data;

            try {
                return await prisma.user.update({
                    where: { id: Number(id) },
                    data
                });

            } catch (error: unknown) {

                if (
                    typeof error === "object" &&
                    error !== null &&
                    "code" in error
                ) {
                    const err = error as { code?: string };

                    if (err.code === "P2002") {
                        throw new GraphQLError("Email already exists", {
                            extensions: { code: "BAD_USER_INPUT" }
                        });
                    }

                    if (err.code === "P2025") {
                        throw new GraphQLError("User not found", {
                            extensions: { code: "BAD_USER_INPUT" }
                        });
                    }
                }

                throw new GraphQLError("Internal server error", {
                    extensions: { code: "INTERNAL_SERVER_ERROR" }
                });
            }
        },


        // DELETE USER
        deleteUser: async (_: unknown, args: UserArgs): Promise<boolean> => {

            try {

                await prisma.user.delete({
                    where: { id: Number(args.id) }
                });

                return true;

            } catch {

                throw new GraphQLError("User not found", {
                    extensions: { code: "BAD_USER_INPUT" }
                });
            }
        }
    }
};

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

// import { makeExecutableSchema } from "@graphql-tools/schema";
// import { prisma } from "@/lib/prisma";
// import { GraphQLError } from "graphql";
// import { createUserSchema } from "@/validations/user.validation";

// type UserArgs = {
//     id: string;
// };

// type CreateUserArgs = {
//     name: string;
//     email: string;
// };

// type UpdateUserArgs = {
//     id: string;
//     name?: string;
//     email?: string;
// };

// const typeDefs = /* GraphQL */ `
//   type User {
//     id: ID!
//     name: String!
//     email: String!
//     createdAt: String!
//   }

//   type Query {
//     users: [User!]!
//     user(id: ID!): User
//   }

//   type Mutation {
//     createUser(name: String!, email: String!): User!
//     updateUser(id: ID!, name: String, email: String): User!
//     deleteUser(id: ID!): Boolean!
//   }
// `;

// const resolvers = {
//     Query: {
//         users: async () => {
//             return prisma.user.findMany();
//         },

//         user: async (_: unknown, args: UserArgs) => {
//             return prisma.user.findUnique({
//                 where: { id: Number(args.id) },
//             });
//         },
//     },

//     Mutation: {
//         // CREATE
//         createUser: async (_: unknown, args: CreateUserArgs) => {
//             const result = createUserSchema.safeParse(args);

//             if (!result.success) {
//                 throw new GraphQLError(result.error.issues[0].message, {
//                     extensions: { code: "BAD_USER_INPUT" },
//                 });
//             }

//             try {
//                 return await prisma.user.create({
//                     data: result.data,
//                 });
//             } catch (error: unknown) {
//                 if (
//                     typeof error === "object" &&
//                     error !== null &&
//                     "code" in error &&
//                     (error as { code?: string }).code === "P2002"
//                 ) {
//                     throw new GraphQLError("Email already exists", {
//                         extensions: { code: "BAD_USER_INPUT" },
//                     });
//                 }

//                 throw new GraphQLError("Internal server error", {
//                     extensions: { code: "INTERNAL_SERVER_ERROR" },
//                 });
//             }
//         },

//         // UPDATE
//         updateUser: async (_: unknown, args: UpdateUserArgs) => {
//             const { id, name, email } = args;

//             if (!name && !email) {
//                 throw new GraphQLError("At least one field (name or email) is required", {
//                     extensions: { code: "BAD_USER_INPUT" },
//                 });
//             }

//             try {
//                 return await prisma.user.update({
//                     where: { id: Number(id) },
//                     data: {
//                         ...(name && { name }),
//                         ...(email && { email }),
//                     },
//                 });
//             } catch (error: unknown) {
//                 if (
//                     typeof error === "object" &&
//                     error !== null &&
//                     "code" in error
//                 ) {
//                     const err = error as { code?: string };

//                     if (err.code === "P2002") {
//                         throw new GraphQLError("Email already exists", {
//                             extensions: { code: "BAD_USER_INPUT" },
//                         });
//                     }

//                     if (err.code === "P2025") {
//                         throw new GraphQLError("User not found", {
//                             extensions: { code: "BAD_USER_INPUT" },
//                         });
//                     }
//                 }

//                 throw new GraphQLError("Internal server error", {
//                     extensions: { code: "INTERNAL_SERVER_ERROR" },
//                 });
//             }
//         },

//         // DELETE
//         deleteUser: async (_: unknown, args: UserArgs): Promise<boolean> => {
//             try {
//                 await prisma.user.delete({
//                     where: { id: Number(args.id) },
//                 });

//                 return true;
//             } catch {
//                 throw new GraphQLError("User not found", {
//                     extensions: { code: "BAD_USER_INPUT" },
//                 });
//             }
//         },
//     },
// };

// export const schema = makeExecutableSchema({
//     typeDefs,
//     resolvers,
// });
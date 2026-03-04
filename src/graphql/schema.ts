import { makeExecutableSchema } from "@graphql-tools/schema"
import { prisma } from "@/lib/prisma"

type UserArgs = {
    id: string;
};

type CreateUserArgs = {
    name: string;
    email: string;
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
    createUser(name: String!, email: String!): User!
    deleteUser(id: ID!): Boolean!
  }
`

const resolvers = {
    Query: {
        users: () => prisma.user.findMany(),

        user: (_parent: unknown, args: { id: string }) => {
            return prisma.user.findUnique({
                where: { id: Number(args.id) }
            })
        }
    },

    Mutation: {
        createUser: (_parent: unknown, args: CreateUserArgs) => {
            return prisma.user.create({
                data: {
                    name: args.name,
                    email: args.email
                }
            });
        },

        deleteUser: async (_parent: unknown, args: UserArgs): Promise<boolean> => {
            await prisma.user.delete({
                where: { id: Number(args.id) },
            });

            return true;
        }
    }
};



export const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})
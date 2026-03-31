export const typeDefs = /* GraphQL */ `
  type User {
    id: String!
    email: String!
    role: String!
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Tag {
    id: String!
    name: String!
    posts: [Post!]!
  }

  type Post {
    id: String!
    title: String!
    content: String!
    published: Boolean!
    author: User!
    tags: [Tag!]!
    comments: [Comment!]!
  }

  type Comment {
    id: String!
    text: String!
    createdAt: String!
    author: User!
    post: Post!
  }

  type Query {
    hello: String
    users: [User!]!
    myPosts: [Post!]!
    feed(skip: Int, take: Int, filter: String): [Post!]!
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
  }

  input CreatePostInput {
    title: String!
    content: String!
    tags: [String!]
  }

  type Mutation {
    register(email: String!, password: String!, role: String): User!
    login(email: String!, password: String!): String!
    createPost(data: CreatePostInput!): Post!
    publishPost(id: String!): Post!
    updatePost(id: String!, data: UpdatePostInput!): Post!
    deletePost(id: String!): Post!
    createComment(postId: String!, text: String!): Comment!
  }
`;
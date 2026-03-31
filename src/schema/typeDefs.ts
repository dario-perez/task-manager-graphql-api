export const typeDefs = `#graphql
  # Represents a system user with their assigned role [cite: 6]
  type User {
    id: ID!
    email: String!
    role: String!
    tasks: [Task!]!
  }

  # Task entity including the mandatory completion state 
  type Task {
    id: ID!
    title: String!
    completed: Boolean! # Mandatory state field (pending/completed) 
    author: User!
  }

  type Query {
    # Returns the authenticated user profile
    me: User
    # Fetches tasks belonging exclusively to the authenticated user [cite: 15]
    myTasks: [Task!]!
    # Administrative query to retrieve all tasks in the system [cite: 16]
    allTasks: [Task!]! 
  }

  type Mutation {
    # User registration and authentication [cite: 9]
    register(email: String!, password: String!, role: String): User!
    login(email: String!, password: String!): String! # Returns a signed JWT [cite: 10]

    # Task management mutations [cite: 15]
    createTask(title: String!): Task!
    # Allows users to toggle the "completed" state of their tasks [cite: 15]
    updateTask(id: ID!, completed: Boolean!): Task!
    # Authorized deletion logic: Users can delete own, ADMIN can delete any [cite: 15, 16]
    deleteTask(id: ID!): Task!
  }
`;
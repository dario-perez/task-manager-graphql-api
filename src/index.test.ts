import { expect, test } from 'vitest';
import supertest from 'supertest';

const request = supertest('http://localhost:3000');

test('Should block access to allTasks if user is not ADMIN', async () => {
  const query = {
    query: '{ allTasks { id } }',
  };

  const response = await request
    .post('/graphql')
    .set('Content-Type', 'application/json')
    .send(query);

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors[0].message).toContain('Administrator access only');
});

test('Should not allow registering as ADMIN', async () => {
  const query = {
    query: `
      mutation {
        register(email: "hacker@test.com", password: "password123") {
          role
        }
      }
    `,
  };

  const response = await request
    .post('/graphql')
    .set('Content-Type', 'application/json')
    .send(query);

  expect(response.body.data.register.role).toBe('USER');
});
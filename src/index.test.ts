import { expect, test } from 'vitest';
import supertest from 'supertest';

// Apuntamos a tu servidor (asegurate de que esté corriendo)
const request = supertest('http://localhost:4000');

test('Debe bloquear el acceso a la lista de usuarios si no soy ADMIN', async () => {
  const query = {
    query: '{ users { email } }'
  };

  const response = await request
    .post('/graphql')
    .send(query);

  expect(response.body.errors).toBeDefined();
  
  expect(response.body.errors[0].message).toContain('Administrator permissions required');
});
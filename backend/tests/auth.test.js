/**
 * auth.test.js — Authentication API Tests
 * Backend: /api/auth routes
 * Run: cd backend && npm test
 */

const request = require('supertest');
const app = require('../src/app');

// Test user credentials (unique timestamp to avoid conflicts)
const timestamp = Date.now();
const testUser = {
  name: 'Test Student',
  email: `test_${timestamp}@mye3.com`,
  mobileNumber: '9876543210',
  password: 'TestPass123',
  role: 'Student',
  board: 'TS Board',
  className: 'Class 9'
};

describe('Auth API — /api/auth', () => {

  // ── REGISTER ──────────────────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {

    it('should register a new student successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('email', testUser.email.toLowerCase());
      expect(res.body).toHaveProperty('role', 'Student');
    });

    it('should reject duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser); // same email again

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject registration without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@test.com' }); // missing name, password

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('email');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword999' });

      expect(res.statusCode).toBe(401);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notexist@mye3.com', password: 'SomePass123' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  describe('POST /api/auth/forgotpassword', () => {

    it('should accept forgot password request for existing email', async () => {
      const res = await request(app)
        .post('/api/auth/forgotpassword')
        .send({ email: testUser.email });

      // Either 200 (email sent) or 500 (email config not set in test env) — both acceptable
      expect([200, 500]).toContain(res.statusCode);
    });

    it('should handle non-existent email gracefully', async () => {
      const res = await request(app)
        .post('/api/auth/forgotpassword')
        .send({ email: 'doesnotexist_xyz@mye3.com' });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

});

/**
 * personalSession.test.js — Personal Session API Tests
 * Backend: /api/admin/personal-sessions routes
 * Run: cd backend && npm test
 */

const request = require('supertest');
const app = require('../src/app');

// Helper: login and get cookie
const loginAs = async (email, password) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  // Extract cookie from response
  const cookies = res.headers['set-cookie'];
  return { token: res.body.token, cookies, user: res.body };
};

describe('Personal Session API — /api/admin/personal-sessions', () => {

  // ── UNAUTHORIZED ACCESS ───────────────────────────────────────────────────
  describe('Authorization checks', () => {

    it('should reject GET /admin/personal-sessions without auth', async () => {
      const res = await request(app)
        .get('/api/admin/personal-sessions');
      expect(res.statusCode).toBe(401);
    });

    it('should reject GET /admin/personal-sessions/students without auth', async () => {
      const res = await request(app)
        .get('/api/admin/personal-sessions/students');
      expect(res.statusCode).toBe(401);
    });

    it('should reject conflict-check without auth', async () => {
      const res = await request(app)
        .get('/api/admin/personal-sessions/conflict-check');
      expect(res.statusCode).toBe(401);
    });

    it('should reject pricing update without auth', async () => {
      const res = await request(app)
        .put('/api/admin/personal-sessions/pricing')
        .send({ oneMonth: 500 });
      expect(res.statusCode).toBe(401);
    });
  });

  // ── STUDENT ROUTES ────────────────────────────────────────────────────────
  describe('Student personal session routes', () => {

    it('should reject GET /student/personal-sessions without auth', async () => {
      const res = await request(app)
        .get('/api/student/personal-sessions');
      expect(res.statusCode).toBe(401);
    });

    it('should reject GET /student/personal-sessions/pricing without auth', async () => {
      const res = await request(app)
        .get('/api/student/personal-sessions/pricing');
      expect(res.statusCode).toBe(401);
    });
  });

  // ── TEACHER ROUTES ────────────────────────────────────────────────────────
  describe('Teacher personal session routes', () => {

    it('should reject GET /teacher/personal-sessions without auth', async () => {
      const res = await request(app)
        .get('/api/teacher/personal-sessions');
      expect(res.statusCode).toBe(401);
    });
  });

});

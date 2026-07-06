const request = require('supertest');

jest.mock('../src/db', () => ({
  query: jest.fn(),
}));

const pool = require('../src/db');
const app  = require('../src/app');

describe('GET /health', () => {
  it('ควรตอบ status ok และมี version', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('version');
  });
});

describe('GET /api/computers', () => {
  it('ควรตอบ array ของเครื่องคอมพิวเตอร์', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, asset_code: 'PC-001', brand_model: 'Dell OptiPlex' }],
    });
    const res = await request(app).get('/api/computers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/computers/:id', () => {
  it('ควรตอบ 404 ถ้าไม่พบ id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/computers/999');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/computers', () => {
  it('ควรตอบ 400 ถ้าไม่ส่ง asset_code', async () => {
    const res = await request(app).post('/api/computers').send({ brand_model: 'Dell' });
    expect(res.statusCode).toBe(400);
  });
});
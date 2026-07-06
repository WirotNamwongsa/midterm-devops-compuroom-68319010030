require('dotenv').config();
const pool = require('./src/db');
const app  = require('./src/app');

const PORT = process.env.PORT || 3001;

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS computers (
      id          SERIAL PRIMARY KEY,
      asset_code  VARCHAR(50)  NOT NULL UNIQUE,
      brand_model VARCHAR(100) NOT NULL,
      cpu         VARCHAR(100) DEFAULT '',
      ram_gb      INTEGER      DEFAULT 0,
      room        VARCHAR(50)  DEFAULT '',
      status      VARCHAR(20)  NOT NULL DEFAULT 'ใช้งาน',
      created_at  TIMESTAMPTZ  DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `);
  console.log('✅ Table computers ready');

  const { rows } = await pool.query('SELECT COUNT(*) FROM computers');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO computers (asset_code, brand_model, cpu, ram_gb, room, status) VALUES
      ('PC-001', 'Dell OptiPlex 3080', 'Intel i5-10500', 8,  'ห้องปฏิบัติการ 1', 'ใช้งาน'),
      ('PC-002', 'HP ProDesk 400 G6',  'Intel i5-9500',  8,  'ห้องปฏิบัติการ 1', 'ใช้งาน'),
      ('PC-003', 'Lenovo ThinkCentre M720', 'Intel i7-9700', 16, 'ห้องปฏิบัติการ 2', 'ส่งซ่อม'),
      ('PC-004', 'Acer Veriton X4660G', 'Intel i3-9100', 4,  'ห้องปฏิบัติการ 2', 'จำหน่าย')
    `);
    console.log('🌱 Seed data inserted (4 computers)');
  }
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 CompuRoom API running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ DB init failed:', err.message);
    process.exit(1);
  });
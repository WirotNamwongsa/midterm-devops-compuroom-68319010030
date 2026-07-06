<template>
  <div class="app-shell">
    <header class="hero-card">
      <div>
        <p class="eyebrow">CompuRoom Dashboard</p>
        <h1>จัดการข้อมูลเครื่องคอมพิวเตอร์ให้ดูเท่และเรียบง่ายขึ้น</h1>
        <p class="hero-copy">
          ระบบบันทึกข้อมูลเครื่องในห้องคอมพิวเตอร์ที่ออกแบบให้มืด ๆ โมเดิร์น ๆ
          เหมาะกับการดูแลสถานะเครื่องแบบทันสมัยและสบายตา
        </p>
      </div>
      <div class="hero-badge">⚡ Live • Status Sync</div>
    </header>

    <section class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">รวมทั้งหมด</span>
        <strong>{{ totalComputers }}</strong>
      </div>
      <div class="stat-card active">
        <span class="stat-label">กำลังใช้งาน</span>
        <strong>{{ activeComputers }}</strong>
      </div>
      <div class="stat-card repair">
        <span class="stat-label">ต้องซ่อม</span>
        <strong>{{ repairComputers }}</strong>
      </div>
    </section>

    <section class="content-grid">
      <div class="form-card">
        <div class="section-head">
          <h3>{{ editingId ? '✏️ แก้ไขข้อมูลเครื่อง' : '✨ เพิ่มเครื่องใหม่' }}</h3>
          <p>กรอกข้อมูลให้ครบและจัดการสถานะเครื่องแบบรวดเร็ว</p>
        </div>

        <div class="form-grid">
          <input v-model="form.asset_code" placeholder="รหัสครุภัณฑ์ (asset_code)" />
          <input v-model="form.brand_model" placeholder="ยี่ห้อและรุ่น" />
          <input v-model="form.cpu" placeholder="สเปก CPU" />
          <input v-model.number="form.ram_gb" type="number" placeholder="RAM (GB)" />
          <input v-model="form.room" placeholder="ห้องที่ติดตั้ง" />
          <select v-model="form.status">
            <option value="ใช้งาน">ใช้งาน</option>
            <option value="ส่งซ่อม">ส่งซ่อม</option>
            <option value="จำหน่าย">จำหน่าย</option>
          </select>
        </div>

        <div class="form-actions">
          <button @click="saveComputer" class="save-btn">
            {{ editingId ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล' }}
          </button>
          <button v-if="editingId" @click="cancelEdit" class="cancel-btn">ยกเลิก</button>
        </div>
      </div>

      <aside class="side-card">
        <div class="filter-bar">
          <label for="statusFilter">ตัวกรองสถานะ</label>
          <select id="statusFilter" v-model="filterStatus" @change="loadComputers">
            <option value="">ทุกสถานะ</option>
            <option value="ใช้งาน">ใช้งาน</option>
            <option value="ส่งซ่อม">ส่งซ่อม</option>
            <option value="จำหน่าย">จำหน่าย</option>
          </select>
        </div>

        <div class="tip-box">
          <h4>💡 Tip of the day</h4>
          <p>กรองสถานะเครื่องเพื่อเช็กความพร้อมก่อนเข้าเรียนหรือก่อนเปิดห้องคอมพิวเตอร์</p>
        </div>
      </aside>
    </section>

    <div v-if="loading" class="loading">กำลังโหลดข้อมูล...</div>
    <div v-else class="item-list">
      <div v-for="item in computers" :key="item.id" class="item-card" :class="statusClass(item.status)">
        <div class="item-info">
          <span class="status-badge">{{ item.status }}</span>
          <h3>{{ item.asset_code }} — {{ item.brand_model }}</h3>
          <p>CPU: {{ item.cpu }} | RAM: {{ item.ram_gb }} GB | ห้อง: {{ item.room }}</p>
        </div>
        <div class="item-actions">
          <button class="edit-btn" @click="editComputer(item)">แก้ไข</button>
          <button class="del-btn" @click="deleteComputer(item.id)">ลบ</button>
        </div>
      </div>
      <p v-if="computers.length === 0" class="empty">ไม่มีข้อมูลในตอนนี้</p>
    </div>

    <footer class="footer">
      นายวิโรจน์ นามวงษา · รหัสนักศึกษา 68319010030 · DevOps 30901-2008 วิทยาลัยเทคนิคเลย
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const computers = ref([])
const loading = ref(false)
const filterStatus = ref('')
const editingId = ref(null)

const totalComputers = computed(() => computers.value.length)
const activeComputers = computed(() => computers.value.filter((item) => item.status === 'ใช้งาน').length)
const repairComputers = computed(() => computers.value.filter((item) => item.status === 'ส่งซ่อม').length)

const emptyForm = () => ({
  asset_code: '', brand_model: '', cpu: '', ram_gb: null, room: '', status: 'ใช้งาน',
})
const form = ref(emptyForm())

function statusClass(status) {
  if (status === 'ใช้งาน') return 'ok'
  if (status === 'ส่งซ่อม') return 'repair'
  return 'disposed'
}

async function loadComputers() {
  loading.value = true
  const params = filterStatus.value ? `?status=${filterStatus.value}` : ''
  const res = await fetch(`${API}/api/computers${params}`)
  computers.value = await res.json()
  loading.value = false
}

async function saveComputer() {
  if (!form.value.asset_code.trim() || !form.value.brand_model.trim()) {
    alert('กรุณาระบุรหัสครุภัณฑ์และยี่ห้อรุ่น')
    return
  }
  if (editingId.value) {
    await fetch(`${API}/api/computers/${editingId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
  } else {
    await fetch(`${API}/api/computers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
  }
  cancelEdit()
  loadComputers()
}

function editComputer(item) {
  editingId.value = item.id
  form.value = { ...item }
}

function cancelEdit() {
  editingId.value = null
  form.value = emptyForm()
}

async function deleteComputer(id) {
  if (!confirm('ลบข้อมูลเครื่องนี้?')) return
  await fetch(`${API}/api/computers/${id}`, { method: 'DELETE' })
  loadComputers()
}

onMounted(loadComputers)
</script>

<style scoped>
:global(body) {
  margin: 0;
  background: linear-gradient(135deg, #020617 0%, #111827 45%, #1f2937 100%);
  color: #f8fafc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

* {
  box-sizing: border-box;
}

.app-shell {
  min-height: 100vh;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.hero-card,
.form-card,
.side-card,
.item-card,
.stat-card {
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 12px 40px rgba(2, 6, 23, 0.35);
  backdrop-filter: blur(20px);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.4rem 1.5rem;
  border-radius: 24px;
  margin-bottom: 1.2rem;
}

.eyebrow {
  margin: 0 0 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.28rem;
  font-size: 0.75rem;
  color: #8b5cf6;
}

.hero-card h1 {
  margin: 0;
  font-size: clamp(1.35rem, 2.2vw, 2rem);
  line-height: 1.3;
}

.hero-copy {
  margin: 0.5rem 0 0;
  color: #cbd5e1;
  max-width: 620px;
}

.hero-badge {
  padding: 0.7rem 0.95rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #8b5cf6, #3b82f6);
  color: white;
  font-weight: 700;
  white-space: nowrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 1.1rem;
}

.stat-card {
  border-radius: 18px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-card.active {
  border-color: rgba(34, 197, 94, 0.3);
}

.stat-card.repair {
  border-color: rgba(249, 115, 22, 0.3);
}

.stat-label {
  color: #94a3b8;
  font-size: 0.85rem;
}

.stat-card strong {
  font-size: 1.45rem;
  color: #f8fafc;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-card,
.side-card {
  border-radius: 22px;
  padding: 1rem;
}

.section-head h3 {
  margin: 0;
  font-size: 1.1rem;
}

.section-head p {
  margin: 0.35rem 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0 0.9rem;
}

.form-grid input,
.form-grid select,
.filter-bar select {
  width: 100%;
  padding: 0.72rem 0.8rem;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(2, 6, 23, 0.7);
  color: #f8fafc;
  outline: none;
}

.form-grid input::placeholder {
  color: #64748b;
}

.form-actions {
  display: flex;
  gap: 0.6rem;
}

.save-btn,
.cancel-btn,
.edit-btn,
.del-btn {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.save-btn:hover,
.cancel-btn:hover,
.edit-btn:hover,
.del-btn:hover {
  transform: translateY(-1px);
}

.save-btn {
  background: linear-gradient(90deg, #8b5cf6, #3b82f6);
  color: white;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.28);
}

.cancel-btn {
  background: rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-bar label {
  color: #cbd5e1;
  font-size: 0.9rem;
}

.tip-box {
  margin-top: 1rem;
  border-radius: 16px;
  padding: 0.9rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(168, 85, 247, 0.16));
  border: 1px solid rgba(129, 140, 248, 0.24);
}

.tip-box h4 {
  margin: 0 0 0.35rem;
  font-size: 0.98rem;
}

.tip-box p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.item-card {
  border-radius: 18px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.item-card.ok {
  border-left: 4px solid #22c55e;
}

.item-card.repair {
  border-left: 4px solid #f59e0b;
}

.item-card.disposed {
  border-left: 4px solid #94a3b8;
}

.status-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.24rem 0.5rem;
  border-radius: 999px;
  background: rgba(129, 140, 248, 0.18);
  color: #c4b5fd;
}

.item-info h3 {
  margin: 0.45rem 0 0.3rem;
  font-size: 1rem;
}

.item-info p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.item-actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.18);
  color: #bfdbfe;
}

.del-btn {
  background: rgba(248, 113, 113, 0.18);
  color: #fecaca;
}

.loading,
.empty {
  text-align: center;
  color: #94a3b8;
  padding: 1.6rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.55);
}

.footer {
  margin-top: 1.4rem;
  text-align: center;
  font-size: 0.84rem;
  color: #64748b;
  padding-top: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

@media (max-width: 800px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .item-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-actions {
    width: 100%;
  }

  .item-actions button {
    flex: 1;
  }
}
</style>
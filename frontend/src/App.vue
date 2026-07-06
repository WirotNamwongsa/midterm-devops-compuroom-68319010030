<template>
  <div class="container">
    <h1>🖥️ CompuRoom — ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ประจำห้อง</h1>

    <div class="form-card">
      <h3>{{ editingId ? '✏️ แก้ไขข้อมูลเครื่อง' : '+ เพิ่มเครื่องใหม่' }}</h3>
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

    <div class="filter-bar">
      <select v-model="filterStatus" @change="loadComputers">
        <option value="">ทุกสถานะ</option>
        <option value="ใช้งาน">ใช้งาน</option>
        <option value="ส่งซ่อม">ส่งซ่อม</option>
        <option value="จำหน่าย">จำหน่าย</option>
      </select>
    </div>

    <div v-if="loading" class="loading">กำลังโหลด...</div>
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
      <p v-if="computers.length === 0" class="empty">ไม่มีข้อมูล</p>
    </div>

    <footer class="footer">
      นายวิโรจน์ นามวงษา · รหัสนักศึกษา 68319010030 · DevOps 30901-2008 วิทยาลัยเทคนิคเลย
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const computers    = ref([])
const loading      = ref(false)
const filterStatus = ref('')
const editingId    = ref(null)

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
.container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; }
h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }
.form-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; margin-bottom: 1.5rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .5rem; margin-bottom: .75rem; }
.form-grid input, .form-grid select { padding: .5rem; border: 1px solid #ccc; border-radius: 6px; }
.form-actions { display: flex; gap: .5rem; }
.save-btn { background: #0ea5e9; color: #fff; border: none; padding: .5rem 1rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
.cancel-btn { background: #e2e8f0; border: none; padding: .5rem 1rem; border-radius: 6px; cursor: pointer; }
.filter-bar { margin-bottom: 1rem; }
.item-list { display: flex; flex-direction: column; gap: .75rem; }
.item-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.item-card.ok { border-left: 4px solid #10b981; }
.item-card.repair { border-left: 4px solid #f59e0b; }
.item-card.disposed { border-left: 4px solid #94a3b8; }
.status-badge { font-size: .72rem; font-weight: 700; padding: .1rem .4rem; border-radius: 4px; background: #f1f5f9; }
.item-info h3 { margin: .25rem 0; font-size: 1rem; }
.item-info p { font-size: .85rem; color: #64748b; margin: 0; }
.item-actions { display: flex; flex-direction: column; gap: .35rem; flex-shrink: 0; }
.edit-btn { background: #e0f2fe; color: #0369a1; border: none; border-radius: 6px; padding: .3rem .6rem; cursor: pointer; font-weight: 700; }
.del-btn { background: #fee2e2; color: #b91c1c; border: none; border-radius: 6px; padding: .3rem .6rem; cursor: pointer; font-weight: 700; }
.loading, .empty { text-align: center; color: #64748b; padding: 2rem; }
.footer { margin-top: 2rem; text-align: center; font-size: .8rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
</style>
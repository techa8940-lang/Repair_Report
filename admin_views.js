// ==========================================================================
// admin_views.js - Views for Admin (Screen 5: Dashboard & Screen 6: Manage Techs)
// ==========================================================================

let adminTechSearch = '';
let adminTechStatusFilter = 'all'; // 'all' | 'available' | 'busy'
let adminDashboardPeriod = 'month';

window.setAdminTechFilter = function(s) {
  adminTechStatusFilter = s;
  render();
};

window.setAdminTechSearch = function(q) {
  adminTechSearch = (q || '').toLowerCase();
  render();
};

window.setDashboardPeriod = function(p) {
  adminDashboardPeriod = p;
  render();
};

window.goToAllWithFilter = function(filterKey) {
  fil = filterKey || 'all';
  setTab('all');
};

// Screen 5: Dashboard ภาพรวม
function vDashboard() {
  const myT = JSON.parse(localStorage.getItem('myT') || '[]');
  const allTickets = [...(T || [])];
  myT.forEach(mt => {
    if (mt.no && !allTickets.some(x => x.id === mt.no)) {
      allTickets.push({
        id: mt.no,
        title: mt.title,
        status: mt.status || 'accepted',
        cat: mt.type,
        created_at: mt.date,
        items: [{ item: mt.title, sym: mt.details || '', asset: mt.asset_no || mt.asset || '' }]
      });
    }
  });

  const validList = allTickets.filter(t => t.status !== 'deleted');
  const total = validList.length;
  const done = validList.filter(t => t.status === 'done' || t.status === 'closed').length;
  const doing = validList.filter(t => t.status === 'doing' || t.status === 'checking').length;
  const pending = validList.filter(t => t.status === 'accepted' || t.status === 'pending' || !t.status || (!['doing', 'checking', 'done', 'closed', 'deleted'].includes(t.status))).length;

  const donePct = total > 0 ? Math.round((done / total) * 100) : 0;
  const doingPct = total > 0 ? Math.round((doing / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;

  // Real Top Issues from allTickets
  const issueCounts = {};
  allTickets.forEach(t => {
    const item = t.items?.[0]?.item || t.cat || 'งานทั่วไป';
    issueCounts[item] = (issueCounts[item] || 0) + 1;
  });
  const topIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Real Category breakdown from allTickets
  const catCounts = {};
  allTickets.forEach(t => {
    const c = t.cat || (t.types?.[0]) || 'งานซ่อม';
    catCounts[c] = (catCounts[c] || 0) + 1;
  });
  const catEntries = Object.entries(catCounts);

  return `
    <!-- Screen 5 Header -->
    <div class="card-header-row" style="margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:22px; font-weight:800; display:flex; align-items:center; gap:8px;">
        <span>📊</span> Dashboard ภาพรวม
      </h2>
      <div style="display:flex; align-items:center; gap:8px;">
        <button type="button" class="btn btn-outline" style="font-weight:700; font-size:14px; background:#fff; height:42px; border-radius:8px;" onclick="setTab('asset_check')">
          🏷️ ตรวจสอบประวัติครุภัณฑ์
        </button>
        <select class="form-control" style="width:auto; font-weight:700; font-size:15px; height:42px;" onchange="setDashboardPeriod(this.value)">
          <option value="month" ${adminDashboardPeriod === 'month' ? 'selected' : ''}>ช่วงเวลา: เดือนนี้ ∨</option>
          <option value="quarter" ${adminDashboardPeriod === 'quarter' ? 'selected' : ''}>ช่วงเวลา: ไตรมาสนี้ ∨</option>
          <option value="year" ${adminDashboardPeriod === 'year' ? 'selected' : ''}>ช่วงเวลา: ปีนี้ ∨</option>
        </select>
      </div>
    </div>

    <!-- 4 KPI Summary Cards (กดสถานะจะเด้งไปที่หน้าสรุปงานซ่อมในสถานะนั้นทันที) -->
    <div class="kpi-grid">
      <div class="kpi-card" onclick="goToAllWithFilter('all')" style="cursor:pointer;" title="คลิกเพื่อดูสรุปงานซ่อมทั้งหมด">
        <div class="kpi-icon-box kpi-icon-blue">🔧</div>
        <div class="kpi-info-box">
          <div class="kpi-label">งานทั้งหมด</div>
          <div class="kpi-value-row">
            <span class="kpi-value">${total}</span>
            <span class="kpi-unit">รายการ</span>
          </div>
        </div>
      </div>

      <div class="kpi-card" onclick="goToAllWithFilter('done')" style="cursor:pointer;" title="คลิกเพื่อดูสรุปงานซ่อมที่เสร็จสิ้น">
        <div class="kpi-icon-box kpi-icon-green">✅</div>
        <div class="kpi-info-box">
          <div class="kpi-label">เสร็จสิ้น</div>
          <div class="kpi-value-row">
            <span class="kpi-value">${done}</span>
            <span class="kpi-unit">รายการ</span>
          </div>
          <div class="kpi-subtext" style="color:var(--success); font-size:14px;">${donePct}%</div>
        </div>
      </div>

      <div class="kpi-card" onclick="goToAllWithFilter('doing')" style="cursor:pointer;" title="คลิกเพื่อดูสรุปงานซ่อมที่กำลังดำเนินการ">
        <div class="kpi-icon-box kpi-icon-orange">🕒</div>
        <div class="kpi-info-box">
          <div class="kpi-label">กำลังดำเนินการ</div>
          <div class="kpi-value-row">
            <span class="kpi-value">${doing}</span>
            <span class="kpi-unit">รายการ</span>
          </div>
          <div class="kpi-subtext" style="color:var(--warning); font-size:14px;">${doingPct}%</div>
        </div>
      </div>

      <div class="kpi-card" onclick="goToAllWithFilter('accepted')" style="cursor:pointer;" title="คลิกเพื่อดูสรุปงานซ่อมที่รอดำเนินการ">
        <div class="kpi-icon-box kpi-icon-red">❗</div>
        <div class="kpi-info-box">
          <div class="kpi-label">รอดำเนินการ</div>
          <div class="kpi-value-row">
            <span class="kpi-value">${pending}</span>
            <span class="kpi-unit">รายการ</span>
          </div>
          <div class="kpi-subtext" style="color:var(--danger); font-size:14px;">${pendingPct}%</div>
        </div>
      </div>
    </div>

    <!-- 3 Chart Columns: Monthly Line Chart | Donut Chart | Top Issues -->
    <div class="admin-grid-charts">
      <!-- 1. Monthly Summary Card -->
      <div class="chart-card">
        <div class="card-header-row" style="margin-bottom:8px;">
          <div class="chart-header" style="margin:0; font-size:17px;">สถิติการดำเนินการ</div>
        </div>

        <div style="padding:16px 8px; text-align:center;">
          ${total > 0 ? `
            <div style="display:flex; flex-direction:column; gap:14px; text-align:left;">
              <div onclick="goToAllWithFilter('done')" style="cursor:pointer;" title="คลิกเพื่อดูสรุปงานซ่อมที่เสร็จสิ้น">
                <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:4px;">
                  <span>งานเสร็จสิ้น (${done} รายการ)</span>
                  <span style="color:var(--success);">${donePct}%</span>
                </div>
                <div style="background:#e2e8f0; border-radius:999px; height:12px; overflow:hidden;">
                  <div style="background:var(--success); width:${donePct}%; height:100%;"></div>
                </div>
              </div>

              <div onclick="goToAllWithFilter('doing')" style="cursor:pointer;" title="คลิกเพื่อดูสรุปงานซ่อมที่กำลังดำเนินการ">
                <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:4px;">
                  <span>กำลังดำเนินการ (${doing} รายการ)</span>
                  <span style="color:var(--warning);">${doingPct}%</span>
                </div>
                <div style="background:#e2e8f0; border-radius:999px; height:12px; overflow:hidden;">
                  <div style="background:var(--warning); width:${doingPct}%; height:100%;"></div>
                </div>
              </div>

              <div onclick="goToAllWithFilter('accepted')" style="cursor:pointer;" title="คลิกเพื่อดูสรุปงานซ่อมที่รอดำเนินการ">
                <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:4px;">
                  <span>รอดำเนินการ (${pending} รายการ)</span>
                  <span style="color:var(--danger);">${pendingPct}%</span>
                </div>
                <div style="background:#e2e8f0; border-radius:999px; height:12px; overflow:hidden;">
                  <div style="background:var(--danger); width:${pendingPct}%; height:100%;"></div>
                </div>
              </div>
            </div>
          ` : `
            <div class="mut" style="padding:32px; font-size:15px;">ยังไม่มีข้อมูลใบแจ้งซ่อมในระบบ</div>
          `}
        </div>
      </div>

      <!-- 2. Donut / Breakdown Chart: หมวดหมู่งาน -->
      <div class="chart-card">
        <div class="chart-header" style="font-size:17px;">สัดส่วนหมวดหมู่งาน</div>
        <div style="display:flex; flex-direction:column; gap:10px; padding:12px 6px;">
          ${catEntries.length ? catEntries.map(([c, count]) => {
            const pct = Math.round((count / total) * 100);
            return `
              <div>
                <div style="display:flex; justify-content:space-between; font-weight:600; font-size:15px; margin-bottom:3px;">
                  <span>● ${esc(c)}</span>
                  <span><b>${count}</b> รายการ (${pct}%)</span>
                </div>
                <div style="background:#e2e8f0; border-radius:999px; height:8px; overflow:hidden;">
                  <div style="background:var(--primary); width:${pct}%; height:100%;"></div>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="mut" style="text-align:center; padding:32px; font-size:15px;">ยังไม่มีข้อมูลหมวดหมู่งาน</div>
          `}
        </div>
      </div>

      <!-- 3. Top Issues (Ranked List) -->
      <div class="chart-card">
        <div class="chart-header" style="font-size:17px;">งานยอดนิยม</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${topIssues.length ? topIssues.map(([item, count], idx) => `
            <div class="ranked-item" style="font-size:15px;">
              <span class="ranked-num">${idx + 1}</span>
              <span style="flex:1; font-weight:600;">${esc(item)}</span>
              <span class="badge badge-normal" style="font-size:13.5px;">${count} ครั้ง</span>
            </div>
          `).join('') : `
            <div class="mut" style="text-align:center; padding:32px; font-size:15px;">ยังไม่มีข้อมูลสถิติงาน</div>
          `}
        </div>
      </div>
    </div>
  `;
}

// Screen 6: จัดการช่างและมอบหมายงาน
function vTechsManage() {
  const allTechs = techs || [];

  let filtered = allTechs;
  if (adminTechStatusFilter === 'available') filtered = allTechs.filter(t => t.status === 'available');
  if (adminTechStatusFilter === 'busy') filtered = allTechs.filter(t => t.status === 'busy');
  if (adminTechSearch) {
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(adminTechSearch) ||
      (t.role_desc || '').toLowerCase().includes(adminTechSearch) ||
      (t.skill || '').toLowerCase().includes(adminTechSearch)
    );
  }

  const totalJobs = T.length;
  const completedJobs = T.filter(t => t.status === 'done').length;
  const fixRate = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) + '%' : '0%';

  return `
    <!-- Screen 6 Header -->
    <div class="card-header-row" style="margin-bottom:20px; flex-wrap:wrap; gap:10px;">
      <h2 style="font-size:22px; font-weight:800; display:flex; align-items:center; gap:8px;">
        <span>👥</span> จัดการช่างและมอบหมายงาน
      </h2>
    </div>

    <div class="admin-techs-grid">
      <!-- Left (2/3): Search, Filter & Technicians Table / Cards -->
      <div class="content-card">
        <div class="filter-bar" style="flex-wrap:wrap; gap:10px;">
          <div class="search-input-wrap" style="flex:1; min-width:200px;">
            <span class="search-icon">🔍</span>
            <input class="form-control" placeholder="ค้นหาช่าง..." value="${esc(adminTechSearch)}" oninput="setAdminTechSearch(this.value)" style="font-size:16px;">
          </div>

          <div style="display:flex; gap:8px; width:100%; max-width:100%;">
            <select class="form-control" style="flex:1; font-weight:700; font-size:15px;" onchange="setAdminTechFilter(this.value)">
              <option value="all" ${adminTechStatusFilter === 'all' ? 'selected' : ''}>สถานะ: ทั้งหมด ∨</option>
              <option value="available" ${adminTechStatusFilter === 'available' ? 'selected' : ''}>สถานะ: ว่าง</option>
              <option value="busy" ${adminTechStatusFilter === 'busy' ? 'selected' : ''}>สถานะ: ไม่ว่าง</option>
            </select>

            <button class="btn btn-primary" style="white-space:nowrap; padding:10px 16px;" onclick="openAddTechModal()">+ เพิ่มช่าง</button>
          </div>
        </div>

        <!-- Desktop View Table -->
        <div class="nusp-table-wrapper desktop-only-table" style="margin-top:16px;">
          <table class="nusp-table">
            <thead>
              <tr>
                <th>ชื่อ-สกุล</th>
                <th>ตำแหน่ง</th>
                <th>ความเชี่ยวชาญ</th>
                <th>สถานะ</th>
                <th>จำนวนงานที่รับ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length ? filtered.map(t => `
                <tr>
                  <td style="font-weight:700; font-size:16px;">${esc(t.name)}</td>
                  <td style="font-size:15px;">${esc(t.role_desc || 'ช่างเทคนิค')}</td>
                  <td style="color:var(--text-muted); font-size:15px;">${esc(t.skill || 'ทั่วไป')}</td>
                  <td>
                    ${t.status === 'busy' 
                      ? '<span class="badge badge-busy">ไม่ว่าง</span>' 
                      : '<span class="badge badge-avail">ว่าง</span>'}
                  </td>
                  <td style="font-weight:700; text-align:center; font-size:16px;">${t.jobs || 0} งาน</td>
                  <td>
                    <button class="btn btn-primary btn-sm" onclick="openAssignModal('${t.id}')">มอบหมาย</button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" class="mut" style="text-align:center; padding:36px; font-size:16px;">
                    ยังไม่มีข้อมูลช่างในระบบ สามารถกดปุ่ม <b>"+ เพิ่มช่างใหม่"</b> ด้านบนเพื่อลงทะเบียนช่างได้ทันที
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Mobile View Cards -->
        <div class="mobile-only-cards" style="display:none; flex-direction:column; gap:12px; margin-top:14px;">
          ${filtered.length ? filtered.map(t => `
            <div style="background:var(--bg-subtle); border:1.5px solid var(--border); border-radius:var(--radius-md); padding:14px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <b style="font-size:16.5px; color:var(--text-main);">${esc(t.name)}</b>
                ${t.status === 'busy' 
                  ? '<span class="badge badge-busy">ไม่ว่าง</span>' 
                  : '<span class="badge badge-avail">ว่าง</span>'}
              </div>

              <div style="display:flex; flex-direction:column; gap:3px; font-size:14.5px; color:var(--text-muted);">
                <div>💼 ตำแหน่ง: <b style="color:var(--text-main);">${esc(t.role_desc || 'ช่างเทคนิค')}</b></div>
                <div>🛠️ ความเชี่ยวชาญ: <span>${esc(t.skill || 'ทั่วไป')}</span></div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--border); padding-top:10px; margin-top:4px;">
                <span style="font-size:14.5px; font-weight:700; color:var(--text-main);">
                  📋 รับแล้ว: <span style="color:var(--primary); font-size:16px;">${t.jobs || 0}</span> งาน
                </span>
                <button class="btn btn-primary btn-sm" style="min-height:38px; padding:6px 16px;" onclick="openAssignModal('${t.id}')">
                  มอบหมายงาน
                </button>
              </div>
            </div>
          `).join('') : `
            <div style="text-align:center; padding:28px 16px; color:var(--text-muted); font-size:15px; background:var(--bg-subtle); border-radius:var(--radius-md);">
              ยังไม่มีข้อมูลช่างในระบบ สามารถกดปุ่ม <b>"+ เพิ่มช่าง"</b> ด้านบนเพื่อลงทะเบียนช่างได้ทันที
            </div>
          `}
        </div>
      </div>

      <!-- Right (1/3): Summary & Performance -->
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="chart-card">
          <div class="chart-header" style="font-size:17px;">สรุปทีมช่าง</div>
          <div style="padding:16px 8px; font-size:16px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between;">
              <span class="mut">จำนวนช่างทั้งหมด:</span>
              <b style="color:var(--primary); font-size:18px;">${allTechs.length} ท่าน</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span class="mut">ช่างที่พร้อมรับงาน:</span>
              <b style="color:var(--success); font-size:18px;">${allTechs.filter(t => t.status !== 'busy').length} ท่าน</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span class="mut">งานที่มอบหมายแล้ว:</span>
              <b style="font-size:18px;">${T.filter(t => t.tech_name).length} งาน</b>
            </div>
          </div>
        </div>

        <div style="background:var(--success-bg); border:1px solid #a7f3d0; border-radius:var(--radius-lg); padding:20px; display:flex; align-items:center; gap:16px;">
          <div style="font-size:32px;">✅</div>
          <div>
            <div style="font-size:14px; color:#065f46; font-weight:700;">อัตราการแก้ไขสำเร็จรวม</div>
            <div style="font-size:26px; font-weight:800; color:#047857;">${fixRate}</div>
            <div style="font-size:13px; color:#065f46;">(เสร็จ ${completedJobs} จาก ${totalJobs} งาน)</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.openAddTechModal = function() {
  $('#dlg').innerHTML = `
    <h3 style="font-size:17px; margin-bottom:14px;">+ เพิ่มข้อมูลช่างเทคนิคใหม่</h3>
    <form onsubmit="saveNewTech(event)">
      <div class="form-group" style="margin-bottom:10px;">
        <label>ชื่อ - สกุล</label>
        <input class="form-control" name="name" required placeholder="เช่น นายสมเกียรติ มั่นคง">
      </div>
      <div class="form-group" style="margin-bottom:10px;">
        <label>ตำแหน่ง</label>
        <input class="form-control" name="role_desc" required placeholder="เช่น ช่างไฟฟ้า, ช่างประปา">
      </div>
      <div class="form-group" style="margin-bottom:14px;">
        <label>ความเชี่ยวชาญ</label>
        <input class="form-control" name="skill" required placeholder="เช่น ไฟฟ้า, แสงสว่าง, เครื่องปรับอากาศ">
      </div>
      <div class="row sp" style="border-top:1px solid var(--border); padding-top:12px;">
        <button type="button" class="btn btn-outline" onclick="$('#dlg').close()">ยกเลิก</button>
        <button type="submit" class="btn btn-primary">บันทึกข้อมูลช่าง</button>
      </div>
    </form>
  `;
  $('#dlg').showModal();
};

window.saveNewTech = async function(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const name = f.get('name').trim();
  const role_desc = f.get('role_desc').trim();
  const skill = f.get('skill').trim();

  techs.unshift({ id: 't_' + Date.now(), name, role_desc, skill, status: 'available', jobs: 0 });
  $('#dlg').close();
  render();
  toast('เพิ่มข้อมูลช่างเรียบร้อยแล้ว');
};

window.openAssignModal = function(techId) {
  const pendingTickets = T.filter(t => t.status === 'accepted' || !t.tech_name);
  if (!pendingTickets.length) return toast('ไม่มีใบงานที่รอการมอบหมายในขณะนี้');

  $('#dlg').innerHTML = `
    <h3 style="font-size:17px; margin-bottom:14px;">📋 เลือกงานเพื่อมอบหมายให้ช่าง</h3>
    <div style="max-height:240px; overflow-y:auto; margin-bottom:14px;">
      ${pendingTickets.map(t => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--border);">
          <div>
            <b>${esc(t.id)}</b> - ${esc(t.items?.[0]?.item || 'แจ้งซ่อม')}
            <div class="mut" style="font-size:14.5px;">อาคาร ${esc(t.bld || '-')} ชั้น ${esc(t.flr || '-')}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="confirmAssignDirect('${t.id}', '${techId}')">มอบหมายงานนี้</button>
        </div>
      `).join('')}
    </div>
    <div style="text-align:right;">
      <button class="btn btn-outline" onclick="$('#dlg').close()">ปิด</button>
    </div>
  `;
  $('#dlg').showModal();
};

window.confirmAssignDirect = async function(ticketId, techId) {
  const p = techs.find(x => x.id === techId);
  const t = T.find(x => x.id === ticketId);
  const updateData = { tech_name: p ? p.name : 'ช่างเทคนิค', status: 'doing', history: logh(t, 'doing') };
  if (typeof isUUID === 'function' && isUUID(techId)) {
    updateData.tech_id = techId;
  }
  
  try {
    await sb.from('tickets').update(updateData).eq('id', ticketId);
  } catch (err) {}
  if (t) {
    Object.assign(t, updateData);
    if (!updateData.tech_id) t.tech_id = techId;
  }
  if (p) p.jobs = (p.jobs || 0) + 1;
  $('#dlg').close();
  go();
  toast(`มอบหมายงาน ${ticketId} ให้ ${p ? p.name : 'ช่าง'} เรียบร้อยแล้ว!`);
};

// Screen: สรุปงานซ่อม (All Tickets Management)
function vAll() {
  const myT = JSON.parse(localStorage.getItem('myT') || '[]');
  const allTickets = [...(T || [])];
  myT.forEach(mt => {
    if (mt.no && !allTickets.some(x => x.id === mt.no)) {
      allTickets.push({
        id: mt.no,
        title: mt.title,
        status: mt.status || 'accepted',
        cat: mt.type,
        created_at: mt.date,
        items: [{ item: mt.title, sym: mt.details || '', asset: mt.asset_no || mt.asset || '' }]
      });
    }
  });

  const validTickets = allTickets.filter(t => t.status !== 'deleted');

  let L = allTickets;
  if (fil === 'all') {
    L = validTickets;
  } else if (fil === 'done') {
    L = allTickets.filter(t => t.status === 'done' || t.status === 'closed');
  } else if (fil === 'doing') {
    L = allTickets.filter(t => t.status === 'doing');
  } else if (fil === 'checking') {
    L = allTickets.filter(t => t.status === 'checking');
  } else if (fil === 'accepted') {
    L = allTickets.filter(t => t.status === 'accepted' || t.status === 'pending' || !t.status || (!['doing', 'checking', 'done', 'closed', 'deleted'].includes(t.status)));
  } else {
    L = allTickets.filter(t => t.status === fil);
  }

  const acceptedCount = allTickets.filter(t => t.status === 'accepted' || t.status === 'pending' || !t.status || (!['doing', 'checking', 'done', 'closed', 'deleted'].includes(t.status))).length;
  const doingCount = allTickets.filter(t => t.status === 'doing').length;
  const checkingCount = allTickets.filter(t => t.status === 'checking').length;
  const doneCount = allTickets.filter(t => t.status === 'done' || t.status === 'closed').length;
  const deletedCount = allTickets.filter(t => t.status === 'deleted').length;

  return `
    <div class="content-card">
      <div class="card-header-row">
        <h2 style="font-size:20px; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>📋</span> สรุปงานซ่อมทั้งหมด
        </h2>
      </div>

      <div class="filter-pills" style="margin-bottom:18px;">
        <button class="filter-pill ${fil === 'all' ? 'active' : ''}" onclick="setFil('all')">
          ทั้งหมด (${validTickets.length})
        </button>
        <button class="filter-pill ${fil === 'accepted' ? 'active' : ''}" onclick="setFil('accepted')">
          รับเรื่องแล้ว (${acceptedCount})
        </button>
        <button class="filter-pill ${fil === 'doing' ? 'active' : ''}" onclick="setFil('doing')">
          กำลังดำเนินการ (${doingCount})
        </button>
        <button class="filter-pill ${fil === 'checking' ? 'active' : ''}" onclick="setFil('checking')">
          ตรวจสอบงาน (${checkingCount})
        </button>
        <button class="filter-pill ${fil === 'done' ? 'active' : ''}" onclick="setFil('done')">
          เสร็จสิ้น (${doneCount})
        </button>
        <button class="filter-pill ${fil === 'deleted' ? 'active' : ''}" onclick="setFil('deleted')">
          ยกเลิก/ลบ (${deletedCount})
        </button>
      </div>

      <div style="margin-top:12px;">
        ${L.map(t => card(t, fil === 'deleted' ? '' : `
          <div class="row" style="margin-top:12px; gap:8px;">
            ${fil !== 'done' ? `
              <select id="a_${t.id}" class="form-control" style="flex:1; max-width:240px; font-size:15px;">
                <option value="">-- เลือกมอบหมายช่าง --</option>
                ${techs.map(p => `<option value="${p.id}" ${p.id === t.tech_id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
              </select>
              <button class="btn btn-primary btn-sm" onclick="assign('${t.id}')">มอบหมาย</button>
            ` : ''}
            <button class="btn btn-outline btn-sm" style="color:var(--danger); border-color:var(--border);" onclick="del('${t.id}')">ลบงาน</button>
          </div>
        `)).join('') || '<div class="mut" style="text-align:center; padding:32px;">ไม่มีรายการในสถานะนี้</div>'}
      </div>
    </div>
  `;
}

window.assign = async function (id) { 
  const sel = document.getElementById('a_' + id);
  const v = sel ? sel.value : '', p = techs.find(x => x.id === v); 
  const t = T.find(x => x.id === id);
  const updateData = { tech_name: p ? p.name : null };
  if (typeof isUUID === 'function' && isUUID(v)) {
    updateData.tech_id = v;
  } else if (!v) {
    updateData.tech_id = null;
  }
  if (v && t && t.status === 'accepted') {
    updateData.status = 'doing';
    updateData.history = logh(t, 'doing');
  }
  try {
    await sb.from('tickets').update(updateData).eq('id', id);
  } catch (err) {}
  if (t) {
    Object.assign(t, updateData);
    if (v && !updateData.tech_id) t.tech_id = v;
  }
  toast(v ? `มอบหมายงานให้ ${p ? p.name : 'ช่าง'} แล้ว (สถานะ: กำลังดำเนินการ)` : 'ยกเลิกการมอบหมายแล้ว');
  if (typeof broadcastTicketUpdate === 'function') broadcastTicketUpdate();
  go(); 
};

window.del = async function (id) {
  if (armed !== id) { 
    armed = id; 
    toast('กด “ลบงาน” อีกครั้งเพื่อยืนยัน'); 
    setTimeout(() => { if (armed === id) armed = '' }, 4000); 
    return; 
  }
  armed = ''; 
  const t = T.find(x => x.id === id);
  const updateData = { status: 'deleted', deleted_at: new Date().toISOString(), deleted_by: me?.name || 'แอดมิน', history: logh(t, 'deleted') };
  try {
    await sb.from('tickets').update(updateData).eq('id', id);
  } catch (err) {}
  if (t) Object.assign(t, updateData);
  toast('ลบงานเรียบร้อยแล้ว');
  if (typeof broadcastTicketUpdate === 'function') broadcastTicketUpdate();
  go();
};

// Screen: วัสดุที่เบิก (Stock Usage & CSV export)
function vStock() {
  const r = fT ? U.filter(u => u.tech_name === fT) : U, tn = [...new Set(U.map(u => u.tech_name).filter(Boolean))], tot = {}, byT = {};
  r.forEach(u => { 
    const k = u.name + ' (' + (u.unit || 'ชิ้น') + ')'; 
    const q = Number(u.qty) || 0; 
    tot[k] = (tot[k] || 0) + q; 
    if (u.tech_name) (byT[u.tech_name] ??= {})[k] = (byT[u.tech_name][k] || 0) + q;
  });

  return `
    <div class="content-card">
      <div class="card-header-row" style="flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <h2 style="font-size:20px; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>📦</span> รายการวัสดุที่เบิกใช้
        </h2>
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <select class="form-control" style="width:auto; font-size:15px; font-weight:700; min-height:44px;" onchange="setFT(this.value)">
            <option value="">ช่างทั้งหมด</option>
            ${tn.map(x => `<option ${x === fT ? 'selected' : ''}>${esc(x)}</option>`).join('')}
          </select>
          <button class="btn btn-primary btn-sm" onclick="csv()" style="white-space:nowrap;">📥 ดาวน์โหลด CSV</button>
        </div>
      </div>

      <!-- สรุปยอด: stack เป็น 1 คอลัมน์บนมือถือ -->
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; margin-bottom:20px;">
        <div class="chart-card">
          <div class="chart-header" style="font-size:16px;">สรุปยอดตามชนิดวัสดุ</div>
          <div class="nusp-table-wrapper">
            <table class="nusp-table">
              <thead><tr><th>วัสดุ (หน่วย)</th><th>จำนวนรวม</th></tr></thead>
              <tbody>
                ${Object.entries(tot).map(([k, v]) => `<tr><td>${esc(k)}</td><td style="font-weight:700; color:var(--primary);">${v}</td></tr>`).join('') || '<tr><td colspan="2" class="mut" style="text-align:center;padding:16px;">ยังไม่มีรายการ</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header" style="font-size:16px;">สรุปตามช่างผู้เบิก</div>
          <div class="nusp-table-wrapper">
            <table class="nusp-table">
              <thead><tr><th>ช่าง</th><th>รายการ</th></tr></thead>
              <tbody>
                ${Object.entries(byT).map(([t, m]) => `<tr><td style="font-weight:600;">${esc(t)}</td><td>${Object.entries(m).map(([n, v]) => esc(n) + ' × ' + v).join('<br>')}</td></tr>`).join('') || '<tr><td colspan="2" class="mut" style="text-align:center;padding:16px;">ยังไม่มีรายการ</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ตารางรายละเอียดทั้งหมด -->
      <div style="font-weight:700; font-size:16px; margin-bottom:10px; color:var(--text-main);">📋 รายการเบิกทั้งหมด (${r.length} รายการ)</div>
      <div class="nusp-table-wrapper">
        <table class="nusp-table">
          <thead>
            <tr><th>วันที่</th><th>ช่าง</th><th>เลขที่ใบงาน</th><th>วัสดุ</th><th>จำนวน</th></tr>
          </thead>
          <tbody>
            ${r.map(u => `
              <tr>
                <td style="color:var(--text-muted); font-size:14px; white-space:nowrap;">${fmt(u.created_at)}</td>
                <td style="font-weight:600; white-space:nowrap;">${esc(u.tech_name)}</td>
                <td style="font-weight:700; color:var(--primary); white-space:nowrap;">${esc(u.ticket_id)}</td>
                <td>${esc(u.name)}</td>
                <td style="font-weight:700; white-space:nowrap;">${u.qty} ${esc(u.unit || 'ชิ้น')}</td>
              </tr>
            `).join('') || '<tr><td colspan="5" class="mut" style="text-align:center; padding:24px;">ยังไม่มีการเบิกวัสดุ</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.csv = function () {
  const c = s => '"' + String(s ?? '').replace(/"/g, '""') + '"', r = fT ? U.filter(u => u.tech_name === fT) : U;
  const txt = '\uFEFFวันที่,ช่าง,ใบงาน,วัสดุ,จำนวน,หน่วย\n' + r.map(u => [fmt(u.created_at), u.tech_name, u.ticket_id, u.name, u.qty, u.unit || 'ชิ้น'].map(c).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv' })); a.download = 'material-usage.csv'; a.click();
};

// ==========================================================================
// Screen: ตรวจสอบประวัติการซ่อมครุภัณฑ์ (Asset Maintenance History Checker)
// ==========================================================================
let assetSearchKeyword = '';
window.assetSearchKeyword = assetSearchKeyword;

window.searchAsset = function(val) {
  assetSearchKeyword = (val || '').trim();
  render();
};

window.resetAssetSearch = function() {
  assetSearchKeyword = '';
  render();
};

function vAssetCheck() {
  const myT = JSON.parse(localStorage.getItem('myT') || '[]');
  const allTickets = [...(T || [])];
  myT.forEach(mt => {
    if (mt.no && !allTickets.some(x => x.id === mt.no)) {
      allTickets.push({
        id: mt.no,
        title: mt.title,
        status: mt.status || 'accepted',
        cat: mt.type,
        created_at: mt.date,
        items: [{ item: mt.title, sym: mt.details || '', asset: mt.asset_no || mt.asset || '' }]
      });
    }
  });

  // รวบรวมหมายเลขครุภัณฑ์ที่มีทั้งหมดในระบบ
  const assetMap = new Map();
  allTickets.forEach(t => {
    const a = (t.items?.[0]?.asset || t.asset_no || t.asset || '').trim();
    if (a && a !== '-' && a !== 'ไม่ได้ระบุ') {
      const list = assetMap.get(a) || [];
      list.push(t);
      assetMap.set(a, list);
    }
  });

  const knownAssets = Array.from(assetMap.entries()).map(([code, tickets]) => {
    const latestTicket = tickets[0];
    const equipName = (typeof getTicketTitle === 'function' ? getTicketTitle(latestTicket) : (latestTicket.items?.[0]?.item || latestTicket.title || 'ครุภัณฑ์'));
    return {
      code,
      name: equipName,
      location: `อาคาร ${latestTicket.bld || '-'} ชั้น ${latestTicket.flr || '-'} (${latestTicket.room || '-'})`,
      count: tickets.length,
      tickets
    };
  });

  let searchResults = null;
  const hasSearched = Boolean(assetSearchKeyword);

  if (hasSearched) {
    const cleanKey = assetSearchKeyword.toLowerCase();
    searchResults = allTickets.filter(t => {
      const a = (t.items?.[0]?.asset || t.asset_no || t.asset || '').trim().toLowerCase();
      return a && (a === cleanKey || a.includes(cleanKey));
    });
  }

  // คำนวณสรุปข้อมูลหากพบประวัติ
  let assetSummary = null;
  if (searchResults && searchResults.length > 0) {
    searchResults.sort((a, b) => {
      const tA = new Date(a.created_at || a.done_at || 0).getTime();
      const tB = new Date(b.created_at || b.done_at || 0).getTime();
      return tB - tA;
    });

    const first = searchResults[0];
    const matchedAssetCode = first.items?.[0]?.asset || first.asset_no || first.asset || assetSearchKeyword;
    const equipName = (typeof getTicketTitle === 'function' ? getTicketTitle(first) : (first.items?.[0]?.item || first.title || first.sub_type || first.cat || 'ครุภัณฑ์'));
    const totalBudget = searchResults.reduce((sum, t) => sum + (Number(t.budget || t.cost || 0)), 0);
    const allTechs = [...new Set(searchResults.map(t => t.tech_name).filter(Boolean))];
    const ticketIds = searchResults.map(t => t.id);
    const usedMats = (typeof U !== 'undefined' ? U : []).filter(u => ticketIds.includes(u.ticket_id));

    assetSummary = {
      code: matchedAssetCode,
      name: equipName,
      cat: first.cat || first.sub_type || 'ทั่วไป',
      location: `อาคาร ${first.bld || '-'} ชั้น ${first.flr || '-'} (ห้อง/บริเวณ ${first.room || '-'})`,
      repairsCount: searchResults.length,
      totalBudget: totalBudget,
      techs: allTechs.length ? allTechs.join(', ') : 'ช่างซ่อมบำรุง',
      materials: usedMats
    };
  }

  return `
    <div class="content-card">
      <div class="card-header-row" style="flex-wrap:wrap; gap:8px; margin-bottom:14px;">
        <h2 style="font-size:22px; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>🏷️</span> ตรวจสอบประวัติการซ่อมครุภัณฑ์
        </h2>
        <span class="badge badge-doing" style="font-size:14.5px; padding:6px 14px;">
          มีครุภัณฑ์ที่บันทึกแล้ว ${knownAssets.length} รายการ
        </span>
      </div>

      <!-- กล่องค้นหาหมายเลขครุภัณฑ์ -->
      <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:14px; padding:18px; margin-bottom:20px;">
        <label style="font-size:15px; font-weight:700; color:#0b2545; display:block; margin-bottom:8px;">
          🔍 ระบุหมายเลขครุภัณฑ์ที่ต้องการตรวจสอบ:
        </label>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <input type="text" id="asset_search_input" class="form-control" 
                 value="${esc(assetSearchKeyword)}" 
                 placeholder="กรอกหมายเลขครุภัณฑ์ เช่น 7440-001-0001/67..." 
                 style="flex:1; min-width:260px; height:46px; font-size:16px; font-weight:700; border:2px solid #94a3b8; border-radius:10px;"
                 onkeydown="if(event.key==='Enter') searchAsset(this.value)">
          <button type="button" class="btn btn-primary" style="height:46px; padding:0 24px; font-size:15.5px; font-weight:800; border-radius:10px;" onclick="searchAsset(document.getElementById('asset_search_input').value)">
            🔍 ตรวจสอบ
          </button>
          ${hasSearched ? `
            <button type="button" class="btn btn-outline" style="height:46px; padding:0 18px; font-size:15px; border-radius:10px;" onclick="resetAssetSearch()">
              ล้างค่า
            </button>
          ` : ''}
        </div>

        ${knownAssets.length ? `
          <div style="margin-top:14px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:13px; font-weight:700; color:#64748b;">ครุภัณฑ์ที่มีประวัติในระบบ:</span>
            ${knownAssets.slice(0, 8).map(a => `
              <button type="button" class="btn btn-outline btn-sm" style="font-size:13px; padding:3px 10px; border-radius:6px; font-family:monospace; font-weight:700; background:#fff;" onclick="searchAsset('${esc(a.code)}')">
                🏷️ ${esc(a.code)} (${esc(a.name)})
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- ผลลัพธ์การค้นหา -->
      ${hasSearched ? (
        searchResults && searchResults.length > 0 ? `
          <!-- พบคลังข้อมูลครุภัณฑ์ -->
          <!-- 1. การ์ดสรุปข้อมูลครุภัณฑ์ -->
          <div style="background:#ffffff; border:1.5px solid #fed7aa; border-radius:14px; padding:20px; margin-bottom:20px; box-shadow:0 4px 12px rgba(234,88,12,0.06);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; border-bottom:1px solid #fed7aa; padding-bottom:14px; margin-bottom:16px;">
              <div>
                <span class="badge" style="background:#fff7ed; color:#ea580c; border:1.5px solid #fed7aa; font-family:monospace; font-size:16px; font-weight:800; padding:4px 12px;">
                  🏷️ หมายเลขครุภัณฑ์: ${esc(assetSummary.code)}
                </span>
                <h3 style="font-size:20px; font-weight:800; color:#0b2545; margin:10px 0 4px 0;">
                  ${esc(assetSummary.name)}
                </h3>
                <div style="font-size:14.5px; color:#64748b;">
                  <b>หมวดหมู่งาน:</b> ${esc(assetSummary.cat)} | <b>สถานที่ตั้ง:</b> ${esc(assetSummary.location)}
                </div>
              </div>
              <span class="badge badge-done" style="font-size:15px; padding:6px 14px;">
                พบประวัติการซ่อม ${assetSummary.repairsCount} ครั้ง
              </span>
            </div>

            <!-- กล่องสถิติ 4 ช่อง -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px;">
                <div style="font-size:12.5px; color:#64748b; font-weight:700;">จำนวนครั้งที่เคยซ่อม</div>
                <div style="font-size:20px; font-weight:800; color:#0b2545; margin-top:4px;">${assetSummary.repairsCount} ครั้ง</div>
              </div>
              <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 14px;">
                <div style="font-size:12.5px; color:#166534; font-weight:700;">งบประมาณที่ใช้รวม</div>
                <div style="font-size:20px; font-weight:800; color:#15803d; margin-top:4px;">
                  ${assetSummary.totalBudget > 0 ? assetSummary.totalBudget.toLocaleString() + ' บาท' : 'เบิกตามพัสดุ'}
                </div>
              </div>
              <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:12px 14px;">
                <div style="font-size:12.5px; color:#1e40af; font-weight:700;">วัสดุที่เคยเบิกใช้</div>
                <div style="font-size:20px; font-weight:800; color:#2563eb; margin-top:4px;">${assetSummary.materials.length} รายการ</div>
              </div>
              <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:12px 14px;">
                <div style="font-size:12.5px; color:#ea580c; font-weight:700;">ช่างที่เคยดำเนินการ</div>
                <div style="font-size:16px; font-weight:800; color:#c2410c; margin-top:6px;">👨‍🔧 ${esc(assetSummary.techs)}</div>
              </div>
            </div>
          </div>

          <!-- 2. ตารางรายการวัสดุที่เคยเบิกในการซ่อมครุภัณฑ์นี้ -->
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:18px; margin-bottom:20px;">
            <h4 style="font-size:17px; font-weight:800; color:#0b2545; margin:0 0 12px 0; display:flex; align-items:center; gap:8px;">
              <span>📦</span> รายการวัสดุอุปกรณ์ที่เคยเบิกใช้ในการซ่อมครุภัณฑ์นี้ (${assetSummary.materials.length} รายการ)
            </h4>
            <div class="nusp-table-wrapper">
              <table class="nusp-table">
                <thead>
                  <tr>
                    <th>วันที่เบิก</th>
                    <th>ใบงานที่เบิก</th>
                    <th>ชื่อวัสดุ</th>
                    <th>จำนวน</th>
                    <th>ช่างผู้เบิก</th>
                  </tr>
                </thead>
                <tbody>
                  ${assetSummary.materials.length ? assetSummary.materials.map(u => `
                    <tr>
                      <td style="color:var(--text-muted); font-size:14px; white-space:nowrap;">${fmt(u.created_at)}</td>
                      <td style="font-weight:700; color:var(--primary); white-space:nowrap;">${esc(u.ticket_id)}</td>
                      <td style="font-weight:700; color:#0f172a;">${esc(u.name)}</td>
                      <td style="font-weight:800; color:#0284c7; white-space:nowrap;">${u.qty} ${esc(u.unit || 'ชิ้น')}</td>
                      <td style="font-weight:600; white-space:nowrap;">${esc(u.tech_name || '-')}</td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="5" style="text-align:center; padding:24px; color:#64748b;">ไม่มีประวัติการเบิกวัสดุสำหรับครุภัณฑ์นี้</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. รายละเอียดประวัติการซ่อมแต่ละครั้ง (Timeline) -->
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:18px;">
            <h4 style="font-size:17px; font-weight:800; color:#0b2545; margin:0 0 16px 0; display:flex; align-items:center; gap:8px;">
              <span>🗓️</span> ประวัติการซ่อมแต่ละช่วงเวลา (${searchResults.length} ครั้ง)
            </h4>

            <div style="display:flex; flex-direction:column; gap:16px;">
              ${searchResults.map((t, idx) => {
                const ticketMats = (typeof U !== 'undefined' ? U : []).filter(u => u.ticket_id === t.id);
                const reqDate = t.date || (t.created_at ? fmt(t.created_at) : '-');
                const doneDate = t.done_at ? fmt(t.done_at) : (t.status === 'done' || t.status === 'closed' ? 'เสร็จสิ้นแล้ว' : 'กำลังดำเนินการ');

                return `
                  <div style="border:1.5px solid #e2e8f0; border-radius:12px; padding:16px; background:#f8fafc;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="background:#0b2545; color:#fff; border-radius:999px; width:26px; height:26px; display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:800;">
                          ${searchResults.length - idx}
                        </span>
                        <span style="font-weight:800; color:#ea580c; font-size:16px;">ใบแจ้งซ่อม: ${esc(t.id)}</span>
                        ${(typeof ST !== 'undefined' && ST[t.status]) ? `
                          <span class="badge" style="background:#fff7ed; color:${ST[t.status][1]}; border:1px solid ${ST[t.status][1]}; font-size:12px;">
                            ${ST[t.status][0]}
                          </span>
                        ` : ''}
                      </div>

                      <div style="font-size:14px; color:#475569;">
                        <b>ช่วงเวลา:</b> แจ้งเมื่อ ${esc(reqDate)} ${t.done_at ? `| เสร็จสิ้น: <span style="color:#10b981; font-weight:700;">${esc(doneDate)}</span>` : ''}
                      </div>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; font-size:14.5px; line-height:1.6; margin-bottom:10px;">
                      <div><b>หัวข้อปัญหา:</b> <span style="color:#0b2545; font-weight:700;">${esc(getTicketTitle(t))}</span></div>
                      <div><b>ช่างผู้ดำเนินการ:</b> <span style="color:#0284c7; font-weight:700;">👨‍🔧 ${esc(t.tech_name || 'ช่างซ่อมบำรุง')}</span></div>
                      <div><b>งบประมาณที่ใช้:</b> <span style="color:#15803d; font-weight:700;">${t.budget ? Number(t.budget).toLocaleString() + ' บาท' : 'เบิกตามพัสดุ'}</span></div>
                      <div><b>ผู้แจ้งซ่อม:</b> ${esc(t.name || '-')}</div>
                    </div>

                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-size:14.5px; margin-bottom:10px;">
                      <b style="color:#0b2545;">อาการ / รายละเอียดการซ่อม:</b>
                      <div style="margin-top:2px; color:#334155;">${esc(getTicketDesc(t))}</div>
                    </div>

                    <!-- วัสดุที่เบิกในครั้งนี้ -->
                    <div style="font-size:14px;">
                      <b>📦 วัสดุที่เบิกใช้ในครั้งนี้:</b>
                      ${ticketMats.length ? `
                        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
                          ${ticketMats.map(m => `
                            <span class="badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:13px; padding:3px 10px;">
                              ${esc(m.name)}: <b>${m.qty} ${esc(m.unit || 'ชิ้น')}</b> (โดย ${esc(m.tech_name)})
                            </span>
                          `).join('')}
                        </div>
                      ` : `
                        <span style="color:#94a3b8; margin-left:6px;">ไม่มีการเบิกวัสดุในครั้งนี้</span>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <!-- ค้นหาแล้วไม่พบข้อมูล: ขึ้นข้อความไม่มีประวัติในการซ่อม ตามคำขอ -->
          <div style="background:#ffffff; border:1.5px dashed #ef4444; border-radius:14px; padding:48px 24px; text-align:center; margin-top:10px;">
            <div style="font-size:56px; line-height:1; margin-bottom:14px;">🔍🚫</div>
            <h3 style="font-size:22px; font-weight:800; color:#b91c1c; margin:0 0 10px 0;">
              ไม่มีประวัติในการซ่อม
            </h3>
            <p style="font-size:16px; color:#64748b; margin:0 auto 20px; max-width:520px; line-height:1.5;">
              ไม่พบประวัติการแจ้งซ่อม หรือไม่มีข้อมูลการซ่อมบำรุงสำหรับหมายเลขครุภัณฑ์ 
              <b style="color:#0b2545; font-family:monospace; background:#fee2e2; padding:2px 8px; border-radius:4px;">"${esc(assetSearchKeyword)}"</b> ในระบบ
            </p>
            <button type="button" class="btn btn-outline" style="min-width:140px; font-weight:700;" onclick="resetAssetSearch()">
              ล้างการค้นหา
            </button>
          </div>
        `
      ) : `
        <!-- หน้าเริ่มต้น: ตารางรายการครุภัณฑ์ที่มีประวัติทั้งหมดในระบบ -->
        <div style="font-weight:700; font-size:16.5px; margin-bottom:12px; color:#0b2545;">
          📋 ทะเบียนครุภัณฑ์ที่มีประวัติการซ่อมในระบบ (${knownAssets.length} รายการ)
        </div>
        <div class="nusp-table-wrapper">
          <table class="nusp-table">
            <thead>
              <tr>
                <th>หมายเลขครุภัณฑ์</th>
                <th>ชื่อ / ชนิดอุปกรณ์</th>
                <th>สถานที่ตั้ง</th>
                <th>จำนวนครั้งที่เคยซ่อม</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              ${knownAssets.length ? knownAssets.map(a => `
                <tr>
                  <td style="font-weight:800; color:var(--primary); font-family:monospace; font-size:15px; white-space:nowrap;">
                    🏷️ ${esc(a.code)}
                  </td>
                  <td style="font-weight:700; color:#0f172a; font-size:15px;">
                    ${esc(a.name)}
                  </td>
                  <td style="color:#475569; font-size:14px;">
                    ${esc(a.location)}
                  </td>
                  <td>
                    <span class="badge badge-done" style="font-size:13.5px; font-weight:700;">
                      ${a.count} ครั้ง
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm" style="font-weight:700;" onclick="searchAsset('${esc(a.code)}')">
                      🔎 ดูประวัติการซ่อม
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" style="text-align:center; padding:36px; color:#64748b;">
                    ยังไม่มีข้อมูลหมายเลขครุภัณฑ์ในระบบ (สามารถระบุเลขครุภัณฑ์ในใบงานเพื่อเริ่มเก็บประวัติได้)
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

window.vDashboard = vDashboard;
window.vTechsManage = vTechsManage;
window.vAll = vAll;
window.vStock = vStock;
window.vAssetCheck = vAssetCheck;

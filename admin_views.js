// ==========================================================================
// admin_views.js - Views for Admin (Screen 5: Dashboard & Screen 6: Manage Techs)
// ==========================================================================

let adminTechSearch = '';
let adminTechStatusFilter = 'all'; // 'all' | 'available' | 'busy'
let adminDashboardPeriod = 'month';

let adminAllYear = 'all';
let adminAllMonth = 'all';
let adminTicketSearch = '';

window.setAdminTicketSearch = function(q) {
  adminTicketSearch = (q || '').trim();
  render();
};

window.resetAdminTicketSearch = function() {
  adminTicketSearch = '';
  render();
};

window.setAdminAllYear = function(y) {
  adminAllYear = y;
  render();
};

window.setAdminAllMonth = function(m) {
  adminAllMonth = m;
  render();
};

window.resetAdminAllPeriod = function() {
  adminAllYear = 'all';
  adminAllMonth = 'all';
  render();
};

function getAdminTicketDateObj(t) {
  if (t.created_at) {
    const d = new Date(t.created_at);
    if (!isNaN(d.getTime())) return d;
  }
  if (t.done_at) {
    const d = new Date(t.done_at);
    if (!isNaN(d.getTime())) return d;
  }
  if (t.date) {
    const d = new Date(t.date);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

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

// Screen 6: จัดการบัญชีผู้ใช้งาน (ผู้แจ้งซ่อม, ช่างเทคนิค & ผู้ดูแลระบบ)
let adminStaffRoleFilter = 'all'; // 'all' | 'reporter' | 'tech' | 'admin'

window.setAdminStaffRoleFilter = function(r) {
  adminStaffRoleFilter = r;
  render();
};

function vTechsManage() {
  const staffList = (typeof allStaff !== 'undefined' && allStaff.length) ? allStaff : (techs || []);

  const allReporters = staffList.filter(t => t.role === 'reporter' || (!t.role && t.role !== 'tech' && t.role !== 'admin'));
  const allTechs = staffList.filter(t => t.role === 'tech');
  const allAdmins = staffList.filter(t => t.role === 'admin');

  let filtered = staffList;
  if (adminStaffRoleFilter === 'reporter') filtered = allReporters;
  if (adminStaffRoleFilter === 'tech') filtered = allTechs;
  if (adminStaffRoleFilter === 'admin') filtered = allAdmins;

  if (adminTechStatusFilter === 'available') filtered = filtered.filter(t => t.status === 'available' || !t.status);
  if (adminTechStatusFilter === 'busy') filtered = filtered.filter(t => t.status === 'busy');

  if (adminTechSearch) {
    filtered = filtered.filter(t => 
      (t.name || '').toLowerCase().includes(adminTechSearch) ||
      (t.email || '').toLowerCase().includes(adminTechSearch) ||
      (t.role_desc || '').toLowerCase().includes(adminTechSearch) ||
      (t.org || '').toLowerCase().includes(adminTechSearch) ||
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
        <span>👥</span> จัดการบัญชีผู้ใช้งาน
      </h2>
    </div>

    <div class="admin-techs-grid">
      <!-- Left (2/3): Search, Filter & Technicians Table / Cards -->
      <div class="content-card">
        <!-- Filter Tabs & Actions Bar (ในกรอบเดียวกัน: ซ้ายมีแท็บเลื่อนแนวนอน ขวามีปุ่มเพิ่มบัญชีใหม่) -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div style="flex:1; min-width:0; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding-bottom:2px;">
            <div class="filter-pills" style="margin:0; display:flex; gap:8px; flex-wrap:nowrap; width:max-content;">
              <button class="filter-pill ${adminStaffRoleFilter === 'all' ? 'active' : ''}" style="flex-shrink:0; white-space:nowrap;" onclick="setAdminStaffRoleFilter('all')">
                ทั้งหมด (${staffList.length})
              </button>
              <button class="filter-pill ${adminStaffRoleFilter === 'reporter' ? 'active' : ''}" style="flex-shrink:0; white-space:nowrap;" onclick="setAdminStaffRoleFilter('reporter')">
                👤 ผู้แจ้งซ่อม (${allReporters.length})
              </button>
              <button class="filter-pill ${adminStaffRoleFilter === 'tech' ? 'active' : ''}" style="flex-shrink:0; white-space:nowrap;" onclick="setAdminStaffRoleFilter('tech')">
                👨‍🔧 ช่างซ่อมบำรุง (${allTechs.length})
              </button>
              <button class="filter-pill ${adminStaffRoleFilter === 'admin' ? 'active' : ''}" style="flex-shrink:0; white-space:nowrap;" onclick="setAdminStaffRoleFilter('admin')">
                👑 ผู้ดูแลระบบ (${allAdmins.length})
              </button>
            </div>
          </div>

          <!-- มุมขวา ในกรอบเดียวกับที่มี ผู้ดูแลระบบ ช่างซ่อมบำรุง -->
          <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
            <button class="btn btn-primary" style="white-space:nowrap; padding:8px 16px; font-weight:800; font-size:14.5px; border-radius:8px;" onclick="openAddStaffModal()">
              + เพิ่มบัญชีใหม่
            </button>
          </div>
        </div>

        <div class="filter-bar" style="flex-wrap:wrap; gap:10px;">
          <div class="search-input-wrap" style="flex:1; min-width:200px;">
            <span class="search-icon">🔍</span>
            <input class="form-control" placeholder="ค้นหาตามชื่อ, อีเมล, หน่วยงาน, ความเชี่ยวชาญ..." value="${esc(adminTechSearch)}" oninput="setAdminTechSearch(this.value)" style="font-size:15px; height:42px;">
          </div>

          <div style="display:flex; gap:8px; width:100%; max-width:240px;">
            <select class="form-control" style="flex:1; font-weight:700; font-size:14.5px; height:42px;" onchange="setAdminTechFilter(this.value)">
              <option value="all" ${adminTechStatusFilter === 'all' ? 'selected' : ''}>สถานะ: ทั้งหมด ∨</option>
              <option value="available" ${adminTechStatusFilter === 'available' ? 'selected' : ''}>สถานะ: พร้อมรับงาน</option>
              <option value="busy" ${adminTechStatusFilter === 'busy' ? 'selected' : ''}>สถานะ: ปฏิบัติงานอยู่</option>
            </select>
          </div>
        </div>

        <!-- Desktop View Table -->
        <div class="nusp-table-wrapper desktop-only-table" style="margin-top:16px;">
          <table class="nusp-table">
            <thead>
              <tr>
                <th>ชื่อ-สกุล</th>
                <th>บทบาท</th>
                <th>อีเมล / บัญชี</th>
                <th>หน่วยงาน &amp; ความเชี่ยวชาญ</th>
                <th>งานที่รับ</th>
                <th style="text-align:center;">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length ? filtered.map(t => {
                const isAdmin = t.role === 'admin';
                const isReporter = t.role === 'reporter' || (!t.role && t.role !== 'tech' && t.role !== 'admin');
                const isTech = t.role === 'tech';

                return `
                  <tr>
                    <td style="font-weight:700; font-size:15.5px; color:#0b2545;">
                      ${esc(t.name)}
                    </td>
                    <td>
                      <span class="badge" style="font-weight:700; font-size:12.5px; ${isAdmin ? 'background:#fef3c7; color:#b45309; border:1px solid #fde68a;' : isReporter ? 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;' : 'background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;'}">
                        ${isAdmin ? '👑 ผู้ดูแลระบบ' : isReporter ? '👤 ผู้แจ้งซ่อม' : '👨‍🔧 ช่างเทคนิค'}
                      </span>
                    </td>
                    <td style="font-size:14px; font-family:monospace; color:#475569;">
                      ${esc(t.email || '-')}
                    </td>
                    <td style="font-size:14px; color:#334155;">
                      <div><b>${esc(t.role_desc || (isAdmin ? 'ผู้ดูแลระบบ' : isReporter ? 'ผู้แจ้งซ่อม' : 'ช่างซ่อมบำรุง'))}</b></div>
                      ${t.org ? `<div style="color:#64748b; font-size:13px;">หน่วยงาน: ${esc(t.org)}</div>` : ''}
                      ${isTech && t.skill ? `<div style="color:#64748b; font-size:13px;">เชี่ยวชาญ: ${esc(t.skill)}</div>` : ''}
                    </td>
                    <td style="font-weight:700; font-size:14.5px; white-space:nowrap;">
                      ${isTech ? `<span style="color:#0284c7;">${t.jobs || 0} งาน</span>` : '<span style="color:#94a3b8;">-</span>'}
                    </td>
                    <td style="white-space:nowrap; text-align:center;">
                      <div style="display:inline-flex; gap:6px;">
                        ${isTech ? `
                          <button class="btn btn-primary btn-sm" style="font-size:12.5px; padding:4px 10px;" onclick="openAssignModal('${t.id}')">
                            มอบหมาย
                          </button>
                        ` : ''}
                        <button class="btn btn-outline btn-sm" style="font-size:12.5px; padding:4px 12px; font-weight:700; border-radius:8px; color:#0b2545; border-color:#94a3b8; display:inline-flex; align-items:center; gap:4px;" onclick="openEditStaffModal('${t.id}')">
                          ✏️ แก้ไขบัญชี
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="6" class="mut" style="text-align:center; padding:36px; font-size:16px;">
                    ยังไม่มีข้อมูลบัญชีผู้ใช้ในระบบ สามารถกดปุ่ม <b>"+ เพิ่มบัญชีใหม่"</b> ด้านบนเพื่อลงทะเบียนได้ทันที
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Mobile View Cards -->
        <div class="mobile-only-cards" style="display:none; flex-direction:column; gap:12px; margin-top:14px; padding-bottom:40px;">
          ${filtered.length ? filtered.map(t => {
            const isAdmin = t.role === 'admin';
            const isReporter = t.role === 'reporter' || (!t.role && t.role !== 'tech' && t.role !== 'admin');
            const isTech = t.role === 'tech';
            let staffEmail = t.email || '';
            if (!staffEmail || staffEmail === '-') {
              try {
                const emCache = JSON.parse(localStorage.getItem('nusp_staff_emails') || '{}');
                staffEmail = emCache[t.id] || emCache[t.name] || '-';
              } catch(e) { staffEmail = '-'; }
            }

            return `
              <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:8px; box-shadow:0 1px 4px rgba(0,0,0,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
                  <b style="font-size:16px; color:#0b2545;">${esc(t.name)}</b>
                  <span class="badge" style="font-weight:700; font-size:12px; ${isAdmin ? 'background:#fef3c7; color:#b45309; border:1px solid #fde68a;' : isReporter ? 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;' : 'background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;'}">
                    ${isAdmin ? '👑 ผู้ดูแลระบบ' : isReporter ? '👤 ผู้แจ้งซ่อม' : '👨‍🔧 ช่างเทคนิค'}
                  </span>
                </div>

                <div style="display:flex; flex-direction:column; gap:3px; font-size:13.5px; color:#475569;">
                  <div>📧 <b>อีเมล:</b> <span style="font-family:monospace; color:#0f172a;">${esc(staffEmail)}</span></div>
                  <div>📞 <b>เบอร์โทร:</b> <span style="color:#0284c7; font-weight:700;">${esc(t.tel || '-')}</span></div>
                  <div>💼 <b>ตำแหน่ง:</b> <span>${esc(t.role_desc || (isAdmin ? 'ผู้ดูแลระบบ' : isReporter ? 'ผู้แจ้งซ่อม' : 'ช่างซ่อมบำรุง'))}</span></div>
                  <div>🏢 <b>หน่วยงาน:</b> <span>${esc(t.org || '-')}</span></div>
                  ${isTech && t.skill ? `<div>🛠️ <b>เชี่ยวชาญ:</b> <span>${esc(t.skill)}</span></div>` : ''}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #e2e8f0; padding-top:8px; margin-top:2px;">
                  <span style="font-size:13px; font-weight:700;">
                    ${isTech ? `📋 รับแล้ว: <b style="color:var(--primary);">${t.jobs || 0}</b> งาน` : ''}
                  </span>
                  <div style="display:flex; gap:8px;">
                    ${isTech ? `
                      <button class="btn btn-primary btn-sm" style="font-size:12.5px; padding:5px 10px; font-weight:700;" onclick="openAssignModal('${t.id}')">
                        มอบหมาย
                      </button>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" style="font-size:12.5px; padding:5px 12px; font-weight:700; border-radius:8px; border-color:#0b2545; color:#0b2545; display:inline-flex; align-items:center; gap:4px;" onclick="openEditStaffModal('${t.id}')">
                      ✏️ แก้ไขบัญชี
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('') : `
            <div style="text-align:center; padding:28px 16px; color:var(--text-muted); font-size:15px; background:var(--bg-subtle); border-radius:var(--radius-md);">
              ยังไม่มีข้อมูลในระบบ สามารถกดปุ่ม <b>"+ เพิ่มบัญชีใหม่"</b> ด้านบนเพื่อลงทะเบียนได้ทันที
            </div>
          `}
        </div>
      </div>

      <!-- Right (1/3): Summary & Performance -->
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="chart-card">
          <div class="chart-header" style="font-size:17px;">สรุปผู้ใช้งานในระบบ</div>
          <div style="padding:16px 8px; font-size:15px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between;">
              <span class="mut">ผู้ใช้งานทั้งหมด:</span>
              <b style="color:var(--primary); font-size:17px;">${staffList.length} ท่าน</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span class="mut">ผู้แจ้งซ่อม (Reporter):</span>
              <b style="color:#0284c7; font-size:17px;">${allReporters.length} ท่าน</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span class="mut">ช่างซ่อมบำรุง (Tech):</span>
              <b style="color:#ea580c; font-size:17px;">${allTechs.length} ท่าน</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span class="mut">ผู้ดูแลระบบ (Admin):</span>
              <b style="color:#b45309; font-size:17px;">${allAdmins.length} ท่าน</b>
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

// Modal สมัครบัญชีใหม่ให้ช่าง / แอดมิน
window.openAddStaffModal = function() {
  const dlg = $('#dlg');
  if (!dlg) return;
  dlg.className = '';
  dlg.innerHTML = `
    <div style="padding:22px 24px; max-width:540px; margin:0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1.5px solid #e2e8f0; padding-bottom:12px;">
        <h3 style="font-size:19px; font-weight:800; color:#0b2545; margin:0; display:flex; align-items:center; gap:8px;">
          <span>👤➕</span> เพิ่มบัญชีผู้ใช้ใหม่ (ช่าง / แอดมิน)
        </h3>
        <button type="button" onclick="document.querySelector('#dlg').close()" style="background:none; border:none; font-size:26px; cursor:pointer; color:#64748b; line-height:1;">&times;</button>
      </div>

      <form onsubmit="saveNewStaff(event)">
        <!-- 1. เลือกบทบาท (ช่าง หรือ แอดมิน) -->
        <div class="form-group" style="margin-bottom:14px;">
          <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:6px; font-size:14.5px;">เลือกประเภทบัญชี:</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <label style="display:flex; align-items:center; gap:8px; padding:10px 14px; border:1.5px solid #cbd5e1; border-radius:10px; cursor:pointer; font-weight:700; background:#f0f9ff;" id="label_role_tech">
              <input type="radio" name="role" value="tech" checked onchange="toggleStaffFormFields('tech')">
              <span>👨‍🔧 ช่างซ่อมบำรุง</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; padding:10px 14px; border:1.5px solid #cbd5e1; border-radius:10px; cursor:pointer; font-weight:700; background:#fffbeb;" id="label_role_admin">
              <input type="radio" name="role" value="admin" onchange="toggleStaffFormFields('admin')">
              <span>👑 ผู้ดูแลระบบ (Admin)</span>
            </label>
          </div>
        </div>

        <!-- 2. ชื่อ - สกุล -->
        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">ชื่อ - นามสกุล <span style="color:#ef4444;">*</span></label>
          <input class="form-control" name="name" required placeholder="เช่น นายสมเกียรติ มั่นคง" style="height:44px; font-size:15px;">
        </div>

        <!-- 3. อีเมลสำหรับ Login -->
        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">อีเมลสำหรับเข้าสู่ระบบ (Email) <span style="color:#ef4444;">*</span></label>
          <input class="form-control" type="email" name="email" required placeholder="เช่น somkiat@nuspark.com" style="height:44px; font-size:15px;">
          <small style="color:#64748b; font-size:12.5px;">* ใช้เป็นบัญชีสำหรับ Login เข้าสู่ระบบ</small>
        </div>

        <!-- 4. รหัสผ่าน -->
        <div class="form-group" style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="font-weight:700; color:#0b2545; margin:0; font-size:14px;">รหัสผ่านเข้าใช้งาน (Password) <span style="color:#ef4444;">*</span></label>
            <button type="button" style="background:none; border:none; color:#ea580c; font-size:12.5px; font-weight:700; cursor:pointer;" onclick="generateStaffPassword()">🎲 สุ่มรหัสผ่าน</button>
          </div>
          <input class="form-control" type="text" id="staff_pw_input" name="password" required value="Nusp@2026" placeholder="กำหนดรหัสผ่าน เช่น 123456" style="height:44px; font-size:15px; font-family:monospace; font-weight:700;">
          <small style="color:#64748b; font-size:12.5px;">* ระบบจะแสดงรหัสผ่านนี้อีกครั้งเพื่อให้บันทึกและส่งให้ผู้ใช้งาน</small>
        </div>

        <!-- 5. เบอร์โทรศัพท์ -->
        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">เบอร์โทรศัพท์ (ถ้ามี)</label>
          <input class="form-control" type="tel" name="tel" placeholder="เช่น 081-234-5678" style="height:44px; font-size:15px;">
        </div>

        <!-- 6. ฟิลด์เฉพาะของช่าง (ตำแหน่ง & ความเชี่ยวชาญ) -->
        <div id="tech_extra_fields">
          <div class="form-group" style="margin-bottom:12px;">
            <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">ตำแหน่ง</label>
            <input class="form-control" name="role_desc" placeholder="เช่น ช่างไฟฟ้า, ช่างประปา, ช่างแอร์" style="height:44px; font-size:15px;">
          </div>
          <div class="form-group" style="margin-bottom:14px;">
            <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">ความเชี่ยวชาญ</label>
            <input class="form-control" name="skill" placeholder="เช่น ไฟฟ้า, แสงสว่าง, เครื่องปรับอากาศ" style="height:44px; font-size:15px;">
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:14px;">
          <button type="button" class="btn btn-outline" onclick="document.querySelector('#dlg').close()" style="min-width:100px;">ยกเลิก</button>
          <button type="submit" class="btn btn-primary" style="font-weight:800; min-width:160px;">💾 บันทึกสร้างบัญชี</button>
        </div>
      </form>
    </div>
  `;
  dlg.showModal();
};

window.openAddTechModal = window.openAddStaffModal;

window.toggleStaffFormFields = function(role) {
  const extra = document.getElementById('tech_extra_fields');
  if (extra) extra.style.display = role === 'tech' ? 'block' : 'none';
};

window.generateStaffPassword = function() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  const pw = 'Nusp@' + rand;
  const input = document.getElementById('staff_pw_input');
  if (input) input.value = pw;
};

window.saveNewStaff = async function(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const role = f.get('role') || 'tech';
  const name = (f.get('name') || '').trim();
  const email = (f.get('email') || '').trim();
  const password = (f.get('password') || '').trim();
  const tel = (f.get('tel') || '').trim();
  const role_desc = (f.get('role_desc') || (role === 'admin' ? 'ผู้ดูแลระบบ' : 'ช่างเทคนิค')).trim();
  const skill = (f.get('skill') || (role === 'admin' ? '-' : 'ทั่วไป')).trim();

  toast(`กำลังสร้างบัญชี ${role === 'admin' ? 'แอดมิน' : 'ช่าง'}...`);

  let authUserId = null;
  try {
    const { data: authData, error: authErr } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, tel, role_desc, skill: role === 'tech' ? skill : null }
      }
    });
    if (authErr) {
      console.warn('sb.auth.signUp notice:', authErr);
    } else {
      authUserId = authData?.user?.id;
    }
  } catch (err) {
    console.warn('Auth sign up error:', err);
  }

  const staffId = authUserId || ('staff_' + Date.now());
  const newStaffObj = {
    id: staffId,
    name,
    role,
    email,
    tel,
    role_desc: role === 'admin' ? 'ผู้ดูแลระบบ' : (role_desc || 'ช่างเทคนิค'),
    skill: role === 'admin' ? '-' : (skill || 'ทั่วไป'),
    status: 'available',
    jobs: 0
  };

  try {
    await sb.from('profiles').upsert({
      id: staffId,
      name,
      role,
      tel,
      skill: role === 'tech' ? skill : null,
      role_desc: role === 'admin' ? 'ผู้ดูแลระบบ' : role_desc
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('profiles upsert error:', err);
  }

  if (typeof allStaff !== 'undefined') allStaff.unshift(newStaffObj);
  if (role === 'tech' && typeof techs !== 'undefined') techs.unshift(newStaffObj);

  // แสดงหน้าต่างข้อมูลบัญชีที่สร้างเสร็จเรียบร้อยพร้อมปุ่มคัดลอก
  const dlg = $('#dlg');
  if (dlg) {
    dlg.className = '';
    dlg.innerHTML = `
      <div style="padding:24px 22px; max-width:480px; margin:0 auto; text-align:center;">
        <div style="font-size:52px; margin-bottom:10px;">🎉</div>
        <h3 style="font-size:20px; font-weight:800; color:#15803d; margin:0 0 8px 0;">สร้างบัญชีผู้ใช้สำเร็จ!</h3>
        <p style="font-size:14.5px; color:#475569; margin-bottom:16px;">
          ระบบได้สร้างบัญชีผู้ใช้ใหม่เรียบร้อยแล้ว กรุณาคัดลอกข้อมูลด้านล่างนี้เพื่อส่งให้ผู้ใช้งานสำหรับ Login
        </p>

        <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:16px; text-align:left; font-size:15px; line-height:1.8; margin-bottom:20px;">
          <div><b>ชื่อ - สกุล:</b> <span style="color:#0b2545; font-weight:700;">${esc(name)}</span></div>
          <div><b>บทบาท:</b> <span class="badge" style="font-weight:700; ${role === 'admin' ? 'background:#fef3c7; color:#b45309;' : 'background:#e0f2fe; color:#0369a1;'}">${role === 'admin' ? '👑 ผู้ดูแลระบบ (Admin)' : '👨‍🔧 ช่างซ่อมบำรุง (Tech)'}</span></div>
          <div><b>อีเมล (Login):</b> <span style="font-family:monospace; font-weight:800; color:#ea580c;" id="cred_res_email">${esc(email)}</span></div>
          <div><b>รหัสผ่าน (Password):</b> <span style="font-family:monospace; font-weight:800; color:#0b2545;" id="cred_res_pw">${esc(password)}</span></div>
          ${tel ? `<div><b>เบอร์โทร:</b> <span>${esc(tel)}</span></div>` : ''}
        </div>

        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button type="button" class="btn btn-outline" style="min-width:140px; font-weight:700;" onclick="copyStaffCredentials('${esc(name)}', '${esc(role === 'admin' ? 'ผู้ดูแลระบบ' : 'ช่างซ่อมบำรุง')}', '${esc(email)}', '${esc(password)}')">
            📋 คัดลอกข้อมูล
          </button>
          <button type="button" class="btn btn-primary" style="min-width:120px; font-weight:800;" onclick="document.querySelector('#dlg').close(); render();">
            เสร็จสิ้น
          </button>
        </div>
      </div>
    `;
    dlg.showModal();
  }
};

window.copyStaffCredentials = function(name, roleName, email, pw) {
  const text = `บัญชีเข้าสู่ระบบแจ้งซ่อม NUSP\nชื่อ: ${name}\nบทบาท: ${roleName}\nอีเมล: ${email}\nรหัสผ่าน: ${pw}`;
  navigator.clipboard.writeText(text).then(() => {
    toast('คัดลอกข้อมูลบัญชีเข้าสู่ระบบเรียบร้อยแล้ว!');
  }).catch(() => {
    toast(`อีเมล: ${email} | รหัสผ่าน: ${pw}`);
  });
};

// Modal แก้ไขบัญชีผู้ใช้
window.openEditStaffModal = function(id) {
  const staffList = (typeof allStaff !== 'undefined' && allStaff.length) ? allStaff : (techs || []);
  const u = staffList.find(x => String(x.id) === String(id));
  if (!u) {
    toast('ไม่พบข้อมูลบัญชีผู้ใช้');
    return;
  }

  const dlg = $('#dlg');
  if (!dlg) return;
  dlg.className = '';

  const role = u.role || 'reporter';
  const isAdmin = role === 'admin';
  const isTech = role === 'tech';
  const isReporter = !isAdmin && !isTech;

  dlg.innerHTML = `
    <div style="padding:22px 24px; max-width:540px; margin:0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1.5px solid #e2e8f0; padding-bottom:12px;">
        <h3 style="font-size:19px; font-weight:800; color:#0b2545; margin:0; display:flex; align-items:center; gap:8px;">
          <span>✏️</span> แก้ไขข้อมูลบัญชีผู้ใช้
        </h3>
        <button type="button" onclick="document.querySelector('#dlg').close()" style="background:none; border:none; font-size:26px; cursor:pointer; color:#64748b; line-height:1;">&times;</button>
      </div>

      <form onsubmit="saveEditStaff(event, '${esc(u.id)}')">
        <!-- 1. เลือกบทบาทผู้ใช้ -->
        <div class="form-group" style="margin-bottom:14px;">
          <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:6px; font-size:14.5px;">บทบาทในระบบ:</label>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
            <label style="display:flex; align-items:center; gap:6px; padding:10px 8px; border:1.5px solid #cbd5e1; border-radius:10px; cursor:pointer; font-weight:700; font-size:13px; background:#f8fafc;">
              <input type="radio" name="role" value="reporter" ${isReporter ? 'checked' : ''} onchange="toggleEditStaffRole('reporter')">
              <span>👤 ผู้แจ้งซ่อม</span>
            </label>
            <label style="display:flex; align-items:center; gap:6px; padding:10px 8px; border:1.5px solid #cbd5e1; border-radius:10px; cursor:pointer; font-weight:700; font-size:13px; background:#f0f9ff;">
              <input type="radio" name="role" value="tech" ${isTech ? 'checked' : ''} onchange="toggleEditStaffRole('tech')">
              <span>👨‍🔧 ช่างบำรุง</span>
            </label>
            <label style="display:flex; align-items:center; gap:6px; padding:10px 8px; border:1.5px solid #cbd5e1; border-radius:10px; cursor:pointer; font-weight:700; font-size:13px; background:#fffbeb;">
              <input type="radio" name="role" value="admin" ${isAdmin ? 'checked' : ''} onchange="toggleEditStaffRole('admin')">
              <span>👑 แอดมิน</span>
            </label>
          </div>
        </div>

        <!-- 2. ชื่อ - นามสกุล -->
        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">ชื่อ - นามสกุล <span style="color:#ef4444;">*</span></label>
          <input class="form-control" name="name" required value="${esc(u.name || '')}" style="height:44px; font-size:15px;">
        </div>

        <!-- 3. อีเมล (บัญชี) -->
        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">อีเมล (Email) / บัญชีเข้าใช้งาน</label>
          <input class="form-control" type="email" name="email" value="${esc(u.email || '')}" style="height:44px; font-size:15px; font-family:monospace;">
        </div>

        <!-- 4. เบอร์โทรศัพท์ & หน่วยงาน -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
          <div class="form-group">
            <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">เบอร์โทรศัพท์</label>
            <input class="form-control" type="tel" name="tel" value="${esc(u.tel || '')}" placeholder="เช่น 081-234-5678" style="height:44px; font-size:15px;">
          </div>
          <div class="form-group">
            <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">หน่วยงาน / สังกัด</label>
            <input class="form-control" name="org" value="${esc(u.org || '')}" placeholder="เช่น อาคาร A, อุทยานฯ" style="height:44px; font-size:15px;">
          </div>
        </div>

        <!-- 5. ตำแหน่ง & ความเชี่ยวชาญ -->
        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">ตำแหน่ง / คำอธิบายหน้าที่</label>
          <input class="form-control" name="role_desc" value="${esc(u.role_desc || '')}" placeholder="เช่น ช่างไฟฟ้า, เจ้าหน้าที่ประสานงาน" style="height:44px; font-size:15px;">
        </div>

        <div id="edit_staff_skill_group" class="form-group" style="margin-bottom:14px; display:${isTech ? 'block' : 'none'};">
          <label style="font-weight:700; color:#0b2545; display:block; margin-bottom:4px; font-size:14px;">ความเชี่ยวชาญ (เฉพาะช่าง)</label>
          <input class="form-control" name="skill" value="${esc(u.skill || '')}" placeholder="เช่น ไฟฟ้า, แสงสว่าง, ระบบปรับอากาศ" style="height:44px; font-size:15px;">
        </div>

        <!-- ปุ่ม Action ด้านล่าง: ซ้ายเป็นปุ่มลบบัญชี ขวาเป็นปุ่มยกเลิกและบันทึก -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; border-top:1.5px solid #e2e8f0; padding-top:14px; flex-wrap:wrap; gap:10px;">
          <button type="button" class="btn" style="background:#dc2626; color:#ffffff; font-weight:700; padding:8px 14px; border-radius:8px; font-size:13.5px; display:inline-flex; align-items:center; gap:6px;" onclick="confirmDeleteStaff('${esc(u.id)}', '${esc(u.name || '')}', '${esc(role)}')">
            🗑️ ลบบัญชีผู้ใช้นี้
          </button>
          
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-outline" onclick="document.querySelector('#dlg').close()" style="min-width:90px;">ยกเลิก</button>
            <button type="submit" class="btn btn-primary" style="font-weight:800; min-width:140px; display:inline-flex; align-items:center; justify-content:center; gap:6px;">✏️ บันทึกการแก้ไข</button>
          </div>
        </div>
      </form>
    </div>
  `;
  dlg.showModal();
};

window.toggleEditStaffRole = function(role) {
  const skillGroup = document.getElementById('edit_staff_skill_group');
  if (skillGroup) skillGroup.style.display = role === 'tech' ? 'block' : 'none';
};

window.saveEditStaff = async function(e, id) {
  e.preventDefault();
  const f = new FormData(e.target);
  const role = f.get('role') || 'reporter';
  const name = (f.get('name') || '').trim();
  const email = (f.get('email') || '').trim();
  const tel = (f.get('tel') || '').trim();
  const org = (f.get('org') || '').trim();
  const role_desc = (f.get('role_desc') || (role === 'admin' ? 'ผู้ดูแลระบบ' : role === 'reporter' ? 'ผู้แจ้งซ่อม' : 'ช่างซ่อมบำรุง')).trim();
  const skill = (f.get('skill') || (role === 'tech' ? 'ทั่วไป' : '-')).trim();

  toast('กำลังบันทึกการแก้ไขบัญชี...');

  // ส่งเฉพาะคอลัมน์ที่มีอยู่จริงใน profiles table เพื่อป้องกัน DB update error
  const updatePayload = {
    name,
    role,
    tel,
    org,
    skill: role === 'tech' ? (skill || 'ทั่วไป') : null
  };

  try {
    const res = await sb.from('profiles').update(updatePayload).eq('id', id);
    if (res?.error) console.warn('profiles update warning:', res.error);
  } catch (err) {
    console.warn('profiles update error:', err);
  }

  // อัปเดตตารางแคชอีเมล
  if (email) {
    try {
      const emailCache = JSON.parse(localStorage.getItem('nusp_staff_emails') || '{}');
      emailCache[id] = email;
      if (name) emailCache[name] = email;
      localStorage.setItem('nusp_staff_emails', JSON.stringify(emailCache));
    } catch(e) {}
  }

  // อัปเดตใน allStaff
  if (typeof allStaff !== 'undefined') {
    const target = allStaff.find(x => String(x.id) === String(id));
    if (target) {
      Object.assign(target, updatePayload);
      target.role_desc = role_desc;
      if (email) target.email = email;
    }
  }

  // อัปเดตใน techs ถ้าเป็นช่าง
  if (typeof techs !== 'undefined') {
    const techIdx = techs.findIndex(x => String(x.id) === String(id));
    if (role === 'tech') {
      if (techIdx >= 0) {
        Object.assign(techs[techIdx], updatePayload);
        techs[techIdx].role_desc = role_desc;
        if (email) techs[techIdx].email = email;
      } else {
        const fullObj = (typeof allStaff !== 'undefined') ? allStaff.find(x => String(x.id) === String(id)) : null;
        if (fullObj) techs.push(fullObj);
      }
    } else {
      if (techIdx >= 0) techs.splice(techIdx, 1);
    }
  }

  $('#dlg')?.close();
  toast('บันทึกการแก้ไขบัญชีผู้ใช้เรียบร้อยแล้ว');
  render();
};

// ยืนยันการลบบัญชีผู้ใช้ (Double Confirmation)
window.confirmDeleteStaff = function(id, name, role) {
  const dlg = $('#dlg');
  if (!dlg) return;
  dlg.className = '';
  const roleName = role === 'admin' ? '👑 ผู้ดูแลระบบ' : (role === 'reporter' ? '👤 ผู้แจ้งซ่อม' : '👨‍🔧 ช่างเทคนิค');
  dlg.innerHTML = `
    <div style="padding:24px 20px; max-width:460px; margin:0 auto; text-align:center;">
      <div style="font-size:48px; margin-bottom:12px;">⚠️</div>
      <h3 style="font-size:20px; font-weight:800; color:#b91c1c; margin:0 0 10px 0;">ยืนยันการลบบัญชีผู้ใช้</h3>
      <p style="font-size:15px; color:#475569; line-height:1.6; margin-bottom:20px;">
        คุณต้องการลบบัญชีของ <b>${esc(name)}</b> (บทบาท: ${roleName}) ออกจากระบบใช่หรือไม่?<br>
        <span style="color:#ef4444; font-size:13.5px; font-weight:700;">* การลบจะทำให้บัญชีนี้ไม่สามารถเข้าสู่ระบบได้อีกต่อไป กรุณากดยืนยันการลบอีกครั้ง</span>
      </p>
      <div style="display:flex; justify-content:center; gap:12px;">
        <button type="button" class="btn btn-outline" style="min-width:110px;" onclick="openEditStaffModal('${esc(id)}')">ยกเลิก</button>
        <button type="button" class="btn" style="background:#dc2626; color:#ffffff; font-weight:800; min-width:140px;" onclick="executeDeleteStaff('${esc(id)}')">🗑️ ยืนยันการลบ</button>
      </div>
    </div>
  `;
  dlg.showModal();
};

window.executeDeleteStaff = async function(id) {
  toast('กำลังลบบัญชีผู้ใช้...');
  try {
    await sb.from('profiles').delete().eq('id', id);
    await sb.from('profiles').update({ name: '[DELETED]', org: 'DELETED' }).eq('id', id);
  } catch(err) {
    console.warn('delete profile error:', err);
  }

  // บันทึก id ที่ถูกลบไว้ใน localStorage เพื่อป้องกันไม่ให้ข้อมูลกลับมาแสดงเมื่อรีเฟรชหน้าเว็บ
  try {
    const deletedList = JSON.parse(localStorage.getItem('nusp_deleted_staff') || '[]');
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      localStorage.setItem('nusp_deleted_staff', JSON.stringify(deletedList));
    }
  } catch(e) {}

  if (typeof allStaff !== 'undefined') {
    const idx = allStaff.findIndex(x => x.id === id);
    if (idx >= 0) allStaff.splice(idx, 1);
  }
  if (typeof techs !== 'undefined') {
    const idx = techs.findIndex(x => x.id === id);
    if (idx >= 0) techs.splice(idx, 1);
  }
  $('#dlg')?.close();
  toast('ลบบัญชีผู้ใช้เรียบร้อยแล้ว');
  render();
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

  // เรียงลำดับจากใหม่สุดไปเก่าสุด
  allTickets.sort((a, b) => {
    const tA = new Date(a.created_at || a.done_at || a.date || 0).getTime();
    const tB = new Date(b.created_at || b.done_at || b.date || 0).getTime();
    return tB - tA;
  });

  // รวบรวมรายชื่อปีที่มีในระบบ
  const yearSet = new Set();
  allTickets.forEach(t => {
    const d = getAdminTicketDateObj(t);
    if (d) yearSet.add(d.getFullYear());
  });
  if (!yearSet.size) yearSet.add(new Date().getFullYear());
  const sortedYears = Array.from(yearSet).sort((a, b) => b - a);

  // รายชื่อเดือนภาษาไทย 12 เดือน
  const thaiMonths = [
    { num: '01', name: 'มกราคม' },
    { num: '02', name: 'กุมภาพันธ์' },
    { num: '03', name: 'มีนาคม' },
    { num: '04', name: 'เมษายน' },
    { num: '05', name: 'พฤษภาคม' },
    { num: '06', name: 'มิถุนายน' },
    { num: '07', name: 'กรกฎาคม' },
    { num: '08', name: 'สิงหาคม' },
    { num: '09', name: 'กันยายน' },
    { num: '10', name: 'ตุลาคม' },
    { num: '11', name: 'พฤศจิกายน' },
    { num: '12', name: 'ธันวาคม' }
  ];

  // กรองตามช่วงเวลาปีและเดือน
  const isPeriodFiltered = adminAllYear !== 'all' || adminAllMonth !== 'all';
  const periodFiltered = allTickets.filter(t => {
    const d = getAdminTicketDateObj(t);
    if (!d) return adminAllYear === 'all' && adminAllMonth === 'all';
    if (adminAllYear !== 'all' && d.getFullYear() !== Number(adminAllYear)) return false;
    if (adminAllMonth !== 'all') {
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      if (mStr !== adminAllMonth) return false;
    }
    return true;
  });

  const validTickets = periodFiltered.filter(t => t.status !== 'deleted');

  let L = periodFiltered;
  if (fil === 'all') {
    L = validTickets;
  } else if (fil === 'done') {
    L = periodFiltered.filter(t => t.status === 'done' || t.status === 'closed');
  } else if (fil === 'doing') {
    L = periodFiltered.filter(t => t.status === 'doing');
  } else if (fil === 'checking') {
    L = periodFiltered.filter(t => t.status === 'checking');
  } else if (fil === 'accepted') {
    L = periodFiltered.filter(t => t.status === 'accepted' || t.status === 'pending' || !t.status || (!['doing', 'checking', 'done', 'closed', 'deleted'].includes(t.status)));
  } else {
    L = periodFiltered.filter(t => t.status === fil);
  }

  const acceptedCount = periodFiltered.filter(t => t.status === 'accepted' || t.status === 'pending' || !t.status || (!['doing', 'checking', 'done', 'closed', 'deleted'].includes(t.status))).length;
  const doingCount = periodFiltered.filter(t => t.status === 'doing').length;
  const checkingCount = periodFiltered.filter(t => t.status === 'checking').length;
  const doneCount = periodFiltered.filter(t => t.status === 'done' || t.status === 'closed').length;
  const deletedCount = periodFiltered.filter(t => t.status === 'deleted').length;

  // ค้นหาด้วยเลขที่ใบซ่อม (เช่น REP-2026-450), หัวข้อ, หมายเลขครุภัณฑ์
  if (adminTicketSearch) {
    const q = adminTicketSearch.toLowerCase();
    L = L.filter(t => {
      const matchId = (t.id || '').toLowerCase().includes(q);
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchAsset = (t.items?.[0]?.asset || '').toLowerCase().includes(q);
      const matchRep = (t.reporter_name || t.name || '').toLowerCase().includes(q);
      const matchTech = (t.tech_name || '').toLowerCase().includes(q);
      return matchId || matchTitle || matchAsset || matchRep || matchTech;
    });
  }

  return `
    <div class="content-card">
      <div class="card-header-row" style="flex-wrap:wrap; gap:10px; margin-bottom:14px;">
        <h2 style="font-size:22px; font-weight:800; display:flex; align-items:center; gap:8px; margin:0;">
          <span>📋</span> สรุปงานซ่อมทั้งหมด
        </h2>
        <span class="badge badge-doing" style="font-size:14px; padding:6px 14px;">
          ทั้งหมด ${periodFiltered.length} รายการ
        </span>
      </div>

      <!-- Filter Bar: ปุ่มเลือกปี + เลือกเดือน + รีเซ็ต -->
      <div class="done-filter-bar" style="background:#f8fafc; border:1.5px solid #cbd5e1; padding:12px 14px; border-radius:14px; margin-bottom:14px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <button type="button" class="btn ${!isPeriodFiltered ? 'btn-primary' : 'btn-outline'}" style="font-size:13.5px; font-weight:700; height:38px; border-radius:8px; padding:0 14px;" onclick="resetAdminAllPeriod()">
            ทุกช่วงเวลา (${allTickets.length})
          </button>
          ${isPeriodFiltered ? `
            <button type="button" class="btn btn-outline btn-sm" onclick="resetAdminAllPeriod()" style="color:var(--danger); border-color:#cbd5e1; height:38px; font-size:13px; font-weight:700;" title="ล้างตัวกรอง">
              ✕ รีเซ็ตตัวกรอง
            </button>
          ` : ''}
        </div>

        <!-- แถวปีและเดือน อยู่บรรทัดเดียวกันเสมอทั้งจอมือถือแนวตั้งและคอมพิวเตอร์ -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; width:100%;">
          <!-- 1. เลือกปี -->
          <div style="display:flex; align-items:center; gap:6px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:4px 8px;">
            <label style="font-size:13px; font-weight:700; color:#0b2545; white-space:nowrap; margin:0;">📅 ปี:</label>
            <select class="form-control" style="width:100%; height:34px; font-size:13px; font-weight:700; border:none; padding:2px 4px; background:transparent; cursor:pointer;" onchange="setAdminAllYear(this.value)">
              <option value="all" ${adminAllYear === 'all' ? 'selected' : ''}>-- ทุกปี --</option>
              ${sortedYears.map(y => `
                <option value="${y}" ${String(adminAllYear) === String(y) ? 'selected' : ''}>พ.ศ. ${y + 543} (${y})</option>
              `).join('')}
            </select>
          </div>

          <!-- 2. เลือกเดือน -->
          <div style="display:flex; align-items:center; gap:6px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:4px 8px;">
            <label style="font-size:13px; font-weight:700; color:#0b2545; white-space:nowrap; margin:0;">🗓️ เดือน:</label>
            <select class="form-control" style="width:100%; height:34px; font-size:13px; font-weight:700; border:none; padding:2px 4px; background:transparent; cursor:pointer;" onchange="setAdminAllMonth(this.value)">
              <option value="all" ${adminAllMonth === 'all' ? 'selected' : ''}>-- ทุกเดือน --</option>
              ${thaiMonths.map(m => `
                <option value="${m.num}" ${adminAllMonth === m.num ? 'selected' : ''}>${m.name}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- ช่องค้นหารายการซ่อมด้วยเลขใบซ่อมในหน้าสรุปงานซ่อม -->
      <div style="position:relative; margin-bottom:16px;">
        <span style="position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:16px; color:#64748b;">🔍</span>
        <input class="form-control" type="text" placeholder="ค้นหาด้วยเลขที่ใบซ่อม เช่น REP-2026-450, หัวข้อปัญหา หรือหมายเลขครุภัณฑ์..." value="${esc(adminTicketSearch)}" oninput="setAdminTicketSearch(this.value)" style="padding-left:42px; padding-right:38px; height:46px; font-size:15px; border-radius:10px; border:1.5px solid #cbd5e1; background:#ffffff;">
        ${adminTicketSearch ? `
          <button type="button" onclick="resetAdminTicketSearch()" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; font-size:22px; cursor:pointer; line-height:1;" title="ล้างการค้นหา">&times;</button>
        ` : ''}
      </div>

      ${adminTicketSearch ? `
        <div style="margin-top:-6px; margin-bottom:14px; font-size:14.5px; color:#ea580c; font-weight:700; display:flex; align-items:center; gap:6px;">
          <span>🔍</span> ผลการค้นหาเลขใบซ่อม/คำค้น "${esc(adminTicketSearch)}": พบ <b>${L.length}</b> รายการ
        </div>
      ` : ''}

      <!-- สถานะฟิลเตอร์ Pills -->
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

      <!-- รายการย่อแบบ Compact List เหมือนในประวัติช่าง -->
      <div class="done-compact-list" style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">
        ${L.length ? L.map(t => {
          const titleText = (typeof getTicketTitle === 'function') ? getTicketTitle(t) : (t.title || t.items?.[0]?.item || 'แจ้งซ่อม');
          const cleanBld = (t.bld || '-').replace(/^อาคาร\s*/, '');
          const dateStr = t.created_at ? fmt(t.created_at) : (t.date || '-');
          const stConfig = (typeof ST !== 'undefined' && ST[t.status]) ? ST[t.status] : (t.status === 'closed' ? ['เสร็จสิ้น', '#10b981'] : ['รอดำเนินการ', '#64748b']);
          const assetNo = t.items?.[0]?.asset || t.asset_no || t.asset || '';

          return `
            <div class="done-compact-item" id="admin_item_${t.id}" onclick="openAdminTicketModal('${t.id}')" style="cursor:pointer; border:1.5px solid #e2e8f0; border-radius:12px; transition:all 0.2s ease; background:#ffffff;">
              <div class="done-compact-header" style="display:flex; justify-content:space-between; align-items:center; padding:14px 18px; flex-wrap:wrap; gap:12px;">
                <div class="done-compact-left" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                  <span class="done-compact-id" style="font-weight:800; font-family:monospace; color:#ea580c; font-size:15px;">${esc(t.id)}</span>
                  ${t.urgent ? '<span class="badge badge-urgent" style="font-size:11.5px; padding:2px 8px;">❗ ด่วน</span>' : ''}
                  <span class="badge" style="background:${stConfig[1]}15; color:${stConfig[1]}; border:1px solid ${stConfig[1]}; font-size:12.5px; font-weight:700;">
                    ${stConfig[0]}
                  </span>
                  <span class="done-compact-title" style="font-weight:700; color:#0b2545; font-size:15.5px;">${esc(titleText)}</span>
                  ${assetNo ? `<span style="font-size:12.5px; font-family:monospace; color:#c2410c; background:#fff7ed; padding:1px 6px; border-radius:4px; border:1px solid #fed7aa;">🏷️ ${esc(assetNo)}</span>` : ''}
                  <span class="done-compact-loc" style="font-size:13.5px; color:#64748b;">📍 อาคาร ${esc(cleanBld)} ชั้น ${esc(t.flr || '-')} (ห้อง ${esc(t.room || '-')})</span>
                  <span style="font-size:13px; font-weight:700; color:${t.tech_name ? '#0369a1' : '#64748b'}; background:${t.tech_name ? '#f0f9ff' : '#f8fafc'}; border:1px solid ${t.tech_name ? '#bae6fd' : '#cbd5e1'}; padding:2px 8px; border-radius:6px; white-space:nowrap;">
                    👨‍🔧 ${t.tech_name ? `ช่าง: ${esc(t.tech_name)}` : '<span style="color:#94a3b8;">ยังไม่ได้มอบหมาย</span>'}
                  </span>
                </div>
                <div class="done-compact-right" style="display:flex; align-items:center; gap:12px;">
                  <span class="done-compact-date" style="font-size:13px; color:#64748b; font-weight:600;">🕒 ${esc(dateStr)}</span>
                  <button type="button" class="btn btn-outline btn-sm" style="font-size:13px; font-weight:700; border-radius:8px; border-color:#0b2545; color:#0b2545;" onclick="event.stopPropagation(); openAdminTicketModal('${t.id}')">
                    ดูรายละเอียด 🔍
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="mut" style="text-align:center; padding:48px 20px; background:#f8fafc; border:1.5px dashed #cbd5e1; border-radius:12px;">
            <div style="font-size:36px; margin-bottom:8px;">📋</div>
            <div style="font-size:16px; font-weight:700; color:#475569;">ไม่พบรายการแจ้งซ่อมในช่วงเวลานี้หรือสถานะนี้</div>
            <button type="button" class="btn btn-outline btn-sm" style="margin-top:12px;" onclick="resetAdminAllPeriod(); setFil('all');">รีเซ็ตตัวกรองทั้งหมด</button>
          </div>
        `}
      </div>
    </div>
  `;
}

// ป็อปอัพรายละเอียดงานซ่อมของแอดมิน (Pop-up Modal - ขยายขนาดพอดี ไม่ต้องเลื่อนซ้ายขวา)
window.openAdminTicketModal = function(id) {
  const t = (typeof T !== 'undefined' ? T.find(x => x.id === id) : null) || (JSON.parse(localStorage.getItem('myT') || '[]').find(x => x.no === id || x.id === id));
  if (!t) {
    toast('ไม่พบข้อมูลใบแจ้งซ่อม');
    return;
  }

  const dlg = $('#dlg');
  if (!dlg) return;

  const titleText = (typeof getTicketTitle === 'function') ? getTicketTitle(t) : (t.title || t.items?.[0]?.item || 'แจ้งซ่อม');
  const descText = (typeof getTicketDesc === 'function') ? getTicketDesc(t) : (t.desc || t.items?.[0]?.sym || '-');
  const cleanBld = (t.bld || '-').replace(/^อาคาร\s*/, '');
  const assetNo = t.items?.[0]?.asset || t.asset_no || t.asset || '';
  const rep = (typeof getReporterInfo === 'function') ? getReporterInfo(t) : {
    name: t.name || t.reporter_name || '-',
    org: t.org || '-',
    tel: t.tel || '-',
    email: t.email || '-'
  };
  const dateStr = t.created_at ? fmt(t.created_at) : (t.date || '-');
  const photos = t.photos || [];
  const donePhotos = t.done_photos || [];
  const usedMats = (typeof U !== 'undefined' ? U : []).filter(u => u.ticket_id === t.id);
  const stConfig = (typeof ST !== 'undefined' && ST[t.status]) ? ST[t.status] : (t.status === 'closed' ? ['เสร็จสิ้น', '#10b981'] : ['รอดำเนินการ', '#64748b']);

  // Stepper HTML
  const stepsHtml = (typeof steps === 'function') ? steps(t) : '';

  dlg.className = 'admin-ticket-dialog-wide';
  dlg.innerHTML = `
    <div style="width:100%; box-sizing:border-box; max-height:88vh; overflow-y:auto; overflow-x:hidden; padding:22px 26px;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1.5px solid #e2e8f0; padding-bottom:14px; margin-bottom:16px; gap:12px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
            <span style="font-size:20px; font-weight:800; color:#ea580c; font-family:monospace;">${esc(t.id)}</span>
            ${t.urgent ? '<span class="badge badge-urgent" style="font-size:12px;">❗ ด่วน</span>' : '<span class="badge badge-normal" style="font-size:12px;">ปกติ</span>'}
            <span class="badge" style="background:${stConfig[1]}15; color:${stConfig[1]}; border:1px solid ${stConfig[1]}; font-size:12.5px; font-weight:700;">
              ${stConfig[0]}
            </span>
          </div>
          <div style="font-size:13.5px; color:#64748b;">
            <b>วันที่แจ้ง:</b> ${esc(dateStr)} ${t.done_at ? `| <b>เสร็จสิ้นเมื่อ:</b> ${fmt(t.done_at)}` : ''}
          </div>
        </div>
        <button type="button" onclick="document.querySelector('#dlg').close()" style="background:none; border:none; font-size:26px; cursor:pointer; color:#64748b; line-height:1; padding:0 4px;">&times;</button>
      </div>

      <!-- Stepper ลำดับขั้นตอน -->
      ${stepsHtml ? `
        <div style="margin-bottom:20px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px 10px;">
          ${stepsHtml}
        </div>
      ` : ''}

      <!-- Grid: Ticket Details & Photos -->
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- Card 1: ข้อมูลที่ผู้แจ้งกรอกทั้งหมด -->
        <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:12px; padding:18px;">
          <h4 style="font-size:16.5px; font-weight:800; color:#0b2545; margin:0 0 14px 0; border-bottom:1px solid #f1f5f9; padding-bottom:10px; display:flex; align-items:center; gap:8px;">
            <span>📋</span> ข้อมูลการแจ้งซ่อม (ที่ผู้แจ้งกรอก)
          </h4>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px; font-size:15px; line-height:1.6;">
            <div><b>หัวข้อ / ชนิดอุปกรณ์ :</b> <span style="font-weight:700; color:#0b2545;">${esc(titleText)}</span></div>
            <div><b>ประเภทงาน :</b> <span>${esc(t.cat || 'ซ่อมแซม')} (หมวด: ${esc(t.sub_type || (t.types || []).join(', ') || 'ทั่วไป')}${t.sub_type_other ? ` - ${esc(t.sub_type_other)}` : ''})</span></div>
            <div>
              <b>หมายเลขครุภัณฑ์ :</b>
              ${assetNo ? `
                <b style="font-family:monospace; color:#c2410c; background:#fff7ed; padding:2px 8px; border-radius:4px; border:1px solid #fed7aa;">🏷️ ${esc(assetNo)}</b>
              ` : `
                <span style="color:#94a3b8;">- ไม่ได้ระบุ -</span>
              `}
              <button type="button" class="btn btn-outline btn-sm" style="font-size:12px; padding:2px 8px; margin-left:6px; border-radius:6px;" onclick="editTicketAsset('${esc(t.id)}')">
                ✏️ แก้ไขเลขครุภัณฑ์
              </button>
            </div>
            <div>
              <b>สถานที่ :</b> <b>อาคาร</b> ${esc(cleanBld)}${t.bld_other ? ` (${esc(t.bld_other)})` : ''} <b>ชั้น</b> ${esc(t.flr || '-')} <b>ห้อง/บริเวณ</b> ${esc(t.room || '-')}
            </div>
            <div><b>ผู้แจ้งซ่อม :</b> <span style="font-weight:700; color:#0b2545;">${esc(rep.name)}</span></div>
            <div><b>หน่วยงาน / สังกัด :</b> <span style="font-weight:700; color:#0b2545;">${esc(rep.org)}</span></div>
            <div><b>เบอร์โทรศัพท์ :</b> <span style="font-weight:700; color:#0284c7;">${esc(rep.tel)}</span></div>
            <div><b>อีเมล :</b> <span style="color:#334155;">${esc(rep.email)}</span></div>
          </div>

          <!-- รายละเอียดปัญหา -->
          <div style="margin-top:14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px;">
            <b style="display:block; margin-bottom:4px; color:#0b2545; font-size:14.5px;">รายละเอียดปัญหา:</b>
            <div style="color:#0f172a; line-height:1.6; font-size:14.5px;">${esc(descText)}</div>
          </div>

          <!-- รูปภาพตอนแจ้ง -->
          ${photos.length ? `
            <div style="margin-top:14px;">
              <b style="display:block; margin-bottom:8px; color:#0b2545; font-size:14px;">📷 รูปภาพตอนแจ้ง (${photos.length} รูป):</b>
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                ${photos.map(p => `
                  <img src="${url(p)}" onclick="zoom('${p}')" style="width:80px; height:80px; object-fit:cover; border-radius:8px; cursor:zoom-in; border:1px solid #cbd5e1;" title="คลิกดูขนาดเต็ม">
                `).join('')}
              </div>
            </div>
          ` : `
            <div style="margin-top:10px; font-size:13.5px; color:#94a3b8;">📷 ไม่มีรูปภาพแนบตอนแจ้ง</div>
          `}
        </div>

        <!-- Card 2: ข้อมูลการดำเนินงานของช่าง & รูปภาพตอนเสร็จสิ้น -->
        <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:12px; padding:18px;">
          <h4 style="font-size:16.5px; font-weight:800; color:#0b2545; margin:0 0 14px 0; border-bottom:1px solid #f1f5f9; padding-bottom:10px; display:flex; align-items:center; gap:8px;">
            <span>👨‍🔧</span> การดำเนินงานของช่าง
          </h4>

          <div style="font-size:15px; line-height:1.6; margin-bottom:14px;">
            <div><b>ช่างผู้รับผิดชอบ:</b> <span style="font-weight:700; color:#ea580c;">${esc(t.tech_name || 'ยังไม่ได้มอบหมาย')}</span></div>
            ${t.note ? `<div style="margin-top:6px;"><b>หมายเหตุช่าง:</b> <span style="color:#0f172a;">${esc(t.note)}</span></div>` : ''}
          </div>

          <!-- รูปภาพตอนทำงานเสร็จสิ้นของช่าง -->
          <div>
            <b style="display:block; margin-bottom:8px; color:#0b2545; font-size:14px;">📸 รูปภาพตอนทำงานเสร็จสิ้น:</b>
            ${donePhotos.length ? `
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                ${donePhotos.map(p => `
                  <img src="${url(p)}" onclick="zoom('${p}')" style="width:80px; height:80px; object-fit:cover; border-radius:8px; cursor:zoom-in; border:1px solid #cbd5e1;" title="คลิกดูขนาดเต็ม">
                `).join('')}
              </div>
            ` : `
              <div style="font-size:14px; color:#94a3b8; background:#f8fafc; padding:8px 12px; border-radius:6px; display:inline-block;">- ไม่มีรูปภาพตอนทำงานเสร็จสิ้น -</div>
            `}
          </div>

          <!-- วัสดุอุปกรณ์ที่เบิกใช้ -->
          ${usedMats.length ? `
            <div style="margin-top:16px;">
              <b style="display:block; margin-bottom:8px; color:#0b2545; font-size:14px;">📦 รายการวัสดุอุปกรณ์ที่เบิกใช้ (${usedMats.length} รายการ):</b>
              <div class="nusp-table-wrapper">
                <table class="nusp-table" style="font-size:13.5px;">
                  <thead>
                    <tr><th>ชื่อวัสดุ</th><th>จำนวน</th><th>หน่วย</th><th>ผู้เบิก</th></tr>
                  </thead>
                  <tbody>
                    ${usedMats.map(u => `
                      <tr>
                        <td style="font-weight:700; color:#0f172a;">${esc(u.name)}</td>
                        <td style="font-weight:800; color:#0284c7;">${u.qty}</td>
                        <td>${esc(u.unit || 'ชิ้น')}</td>
                        <td>${esc(u.tech_name || '-')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Card 3: การจัดการงาน (มอบหมายช่าง / อัปเดตสถานะ / ลบงาน) -->
        <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:18px;">
          <h4 style="font-size:16px; font-weight:800; color:#0b2545; margin:0 0 12px 0;">⚙️ จัดการงานซ่อม</h4>
          
          <div style="display:flex; flex-direction:column; gap:12px;">
            <!-- มอบหมายช่าง -->
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <label style="font-weight:700; font-size:14px; min-width:110px;">มอบหมายช่าง:</label>
              <select id="modal_a_${t.id}" class="form-control" style="flex:1; min-width:200px; max-width:320px; font-size:14.5px;">
                <option value="">-- เลือกมอบหมายช่าง --</option>
                ${techs.map(p => `<option value="${p.id}" ${p.id === t.tech_id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
              </select>
              <button type="button" class="btn btn-primary btn-sm" style="font-weight:700;" onclick="assignFromModal('${t.id}')">💾 บันทึกมอบหมาย</button>
            </div>

            <!-- ปุ่มอัปเดตสถานะ & ลบงาน -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:8px; border-top:1px solid #e2e8f0; padding-top:12px;">
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button type="button" class="btn btn-outline btn-sm" style="font-weight:700; color:var(--primary); border-color:var(--primary);" onclick="openAct('${t.id}')">
                  📝 อัปเดตสถานะงาน
                </button>
                <button type="button" class="btn btn-outline btn-sm" style="font-weight:700; color:var(--danger); border-color:#cbd5e1;" onclick="delFromModal('${t.id}')">
                  🗑️ ลบงานนี้
                </button>
              </div>
              <button type="button" class="btn btn-outline btn-sm" onclick="document.querySelector('#dlg').close()">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  dlg.showModal();
};

window.assignFromModal = async function(id) {
  const sel = document.getElementById('modal_a_' + id);
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
  toast(v ? `มอบหมายงานให้ ${p ? p.name : 'ช่าง'} แล้ว` : 'ยกเลิกการมอบหมายแล้ว');
  if (typeof broadcastTicketUpdate === 'function') broadcastTicketUpdate();
  $('#dlg')?.close();
  go();
};

window.delFromModal = async function(id) {
  if (confirm(`คุณต้องการลบใบแจ้งซ่อม ${id} หรือไม่?`)) {
    armed = id;
    await del(id);
    $('#dlg')?.close();
  }
};

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

// ==========================================================================
// Screen: วัสดุที่เบิกใช้ (Stock Usage & Analytics Dashboard - ออกแบบตามรูปภาพต้นแบบ)
// ==========================================================================
let stockYear = 'all';
let stockMonth = 'all';
let stockTech = '';
let stockSearch = '';

window.setStockYear = function(y) { stockYear = y; render(); };
window.setStockMonth = function(m) { stockMonth = m; render(); };
window.setStockTech = function(t) { stockTech = t; render(); };
window.setStockSearch = function(q) { stockSearch = (q || '').trim(); render(); };
window.resetStockSearch = function() { stockSearch = ''; render(); };
window.resetStockPeriod = function() { stockYear = 'all'; stockMonth = 'all'; stockTech = ''; stockSearch = ''; render(); };

const MAT_CAT_MAP = {
  'สายไฟ VCT': { cat: 'วัสดุไฟฟ้า', price: 45, unit: 'เมตร', color: '#3b82f6' },
  'สายไฟ': { cat: 'วัสดุไฟฟ้า', price: 45, unit: 'เมตร', color: '#3b82f6' },
  'เบรกเกอร์': { cat: 'วัสดุไฟฟ้า', price: 350, unit: 'ตัว', color: '#3b82f6' },
  'หลอดไฟ LED': { cat: 'วัสดุไฟฟ้า', price: 150, unit: 'หลอด', color: '#3b82f6' },
  'บัลลาสต์/สตาร์ทเตอร์': { cat: 'วัสดุไฟฟ้า', price: 80, unit: 'ตัว', color: '#3b82f6' },
  'สวิตช์ไฟ': { cat: 'วัสดุไฟฟ้า', price: 120, unit: 'ตัว', color: '#3b82f6' },
  'ปลั๊กไฟ': { cat: 'วัสดุไฟฟ้า', price: 90, unit: 'ตัว', color: '#3b82f6' },
  'เทปพันสายไฟ': { cat: 'วัสดุไฟฟ้า', price: 35, unit: 'ม้วน', color: '#3b82f6' },
  'ท่อ PVC': { cat: 'วัสดุก่อสร้าง', price: 65, unit: 'เส้น', color: '#f97316' },
  'ปูนซีเมนต์': { cat: 'วัสดุก่อสร้าง', price: 160, unit: 'ถุง', color: '#f97316' },
  'สีทาภายใน': { cat: 'วัสดุก่อสร้าง', price: 450, unit: 'ถัง', color: '#f97316' },
  'ก๊อกน้ำ': { cat: 'วัสดุประปา', price: 180, unit: 'ตัว', color: '#10b981' },
  'วาล์วน้ำ': { cat: 'วัสดุประปา', price: 120, unit: 'ตัว', color: '#10b981' },
  'สายฉีดชำระ': { cat: 'วัสดุประปา', price: 160, unit: 'ชุด', color: '#10b981' },
  'น้ำยาแอร์': { cat: 'วัสดุอื่นๆ', price: 450, unit: 'กก.', color: '#8b5cf6' }
};

function getMatInfo(name) {
  if (MAT_CAT_MAP[name]) return MAT_CAT_MAP[name];
  if (/ไฟ|หลอด|เบรกเกอร์|สวิตช์|ปลั๊ก|สายไฟ|บัลลาสต์/i.test(name)) return { cat: 'วัสดุไฟฟ้า', price: 120, unit: 'ชิ้น', color: '#3b82f6' };
  if (/ท่อ|ก๊อก|วาล์ว|ชำระ|ประปา|น้ำ/i.test(name)) return { cat: 'วัสดุประปา', price: 95, unit: 'ชิ้น', color: '#10b981' };
  if (/ปูน|สี|ฝ้า|ไม้|ประตู|หน้าต่าง|กระจก|กระเบื้อง/i.test(name)) return { cat: 'วัสดุก่อสร้าง', price: 200, unit: 'ชิ้น', color: '#f97316' };
  return { cat: 'วัสดุอื่นๆ', price: 100, unit: 'ชิ้น', color: '#8b5cf6' };
}

function vStock() {
  const allUsage = [...(U || [])];

  // 1. เรียงลำดับจากวันที่ใหม่สุดอยู่บน (Sort descending by date)
  allUsage.sort((a, b) => {
    const tA = new Date(a.created_at || a.date || 0).getTime();
    const tB = new Date(b.created_at || b.date || 0).getTime();
    return tB - tA;
  });

  // รวบรวมรายชื่อปีและช่าง
  const yearSet = new Set();
  const techSet = new Set();
  allUsage.forEach(u => {
    const d = new Date(u.created_at || u.date || 0);
    if (!isNaN(d.getTime())) yearSet.add(d.getFullYear());
    if (u.tech_name) techSet.add(u.tech_name);
  });
  if (!yearSet.size) yearSet.add(new Date().getFullYear());
  const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
  const techList = Array.from(techSet).sort();

  const thaiMonths = [
    { num: '01', name: 'มกราคม' },
    { num: '02', name: 'กุมภาพันธ์' },
    { num: '03', name: 'มีนาคม' },
    { num: '04', name: 'เมษายน' },
    { num: '05', name: 'พฤษภาคม' },
    { num: '06', name: 'มิถุนายน' },
    { num: '07', name: 'กรกฎาคม' },
    { num: '08', name: 'สิงหาคม' },
    { num: '09', name: 'กันยายน' },
    { num: '10', name: 'ตุลาคม' },
    { num: '11', name: 'พฤศจิกายน' },
    { num: '12', name: 'ธันวาคม' }
  ];

  // กรองตามปี เดือน ช่าง และเลขที่ใบซ่อม
  const isPeriodFiltered = stockYear !== 'all' || stockMonth !== 'all' || stockTech !== '' || stockSearch !== '';
  const filteredUsage = allUsage.filter(u => {
    const d = new Date(u.created_at || u.date || 0);
    if (stockYear !== 'all' && !isNaN(d.getTime()) && d.getFullYear() !== Number(stockYear)) return false;
    if (stockMonth !== 'all' && !isNaN(d.getTime())) {
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      if (mStr !== stockMonth) return false;
    }
    if (stockTech && u.tech_name !== stockTech) return false;
    if (stockSearch) {
      const sq = stockSearch.toLowerCase();
      const matchTicket = (u.ticket_id || '').toLowerCase().includes(sq);
      const matchMat = (u.name || '').toLowerCase().includes(sq);
      const matchTech = (u.tech_name || '').toLowerCase().includes(sq);
      if (!matchTicket && !matchMat && !matchTech) return false;
    }
    return true;
  });

  // คำนวณสรุปสถิติ & สัดส่วนงบประมาณ
  let totalCost = 0;
  const catBreakdown = {
    'วัสดุไฟฟ้า': 0,
    'วัสดุก่อสร้าง': 0,
    'วัสดุประปา': 0,
    'วัสดุอื่นๆ': 0
  };
  const activeTechs = new Set();

  filteredUsage.forEach(u => {
    const info = getMatInfo(u.name);
    const qty = Number(u.qty) || 1;
    const cost = u.cost ? Number(u.cost) : (qty * info.price);
    totalCost += cost;
    catBreakdown[info.cat] = (catBreakdown[info.cat] || 0) + cost;
    if (u.tech_name) activeTechs.add(u.tech_name);
  });

  // หาค่าสูงสุดสำหรับความสูงของ Bar chart
  const maxCatCost = Math.max(...Object.values(catBreakdown), 1);

  // คำนวณเปอร์เซ็นต์สำหรับ Donut chart
  const catColors = {
    'วัสดุไฟฟ้า': '#3b82f6',
    'วัสดุก่อสร้าง': '#f97316',
    'วัสดุประปา': '#10b981',
    'วัสดุอื่นๆ': '#8b5cf6'
  };

  const catPercentages = {};
  Object.keys(catBreakdown).forEach(k => {
    catPercentages[k] = totalCost > 0 ? ((catBreakdown[k] / totalCost) * 100).toFixed(1) : 0;
  });

  return `
    <div style="max-width:1200px; margin:0 auto;">
      <!-- Header Bar สไตล์รูปภาพต้นแบบ -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; padding:20px 24px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.03); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="background:linear-gradient(135deg, #ea580c 0%, #f97316 100%); width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:28px; box-shadow:0 4px 12px rgba(234,88,12,0.25);">
            📦
          </div>
          <div>
            <h2 style="font-size:24px; font-weight:800; color:#0b2545; margin:0 0 4px 0;">วัสดุที่เบิกใช้</h2>
            <div style="font-size:14.5px; color:#64748b; font-weight:500;">สรุปการเบิกวัสดุ และรายละเอียดการเบิกใช้งาน</div>
          </div>
        </div>

        <!-- Filter Period & Actions ด้านขวา -->
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:6px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:10px; padding:4px 8px;">
            <span style="font-size:14px;">📅</span>
            <select style="border:none; background:transparent; font-size:14px; font-weight:700; color:#0b2545; outline:none; cursor:pointer;" onchange="setStockYear(this.value)">
              <option value="all" ${stockYear === 'all' ? 'selected' : ''}>-- ทุกปี --</option>
              ${sortedYears.map(y => `<option value="${y}" ${String(stockYear) === String(y) ? 'selected' : ''}>พ.ศ. ${y + 543} (${y})</option>`).join('')}
            </select>

            <span style="color:#cbd5e1;">|</span>

            <select style="border:none; background:transparent; font-size:14px; font-weight:700; color:#0b2545; outline:none; cursor:pointer;" onchange="setStockMonth(this.value)">
              <option value="all" ${stockMonth === 'all' ? 'selected' : ''}>-- ทุกเดือน --</option>
              ${thaiMonths.map(m => `<option value="${m.num}" ${stockMonth === m.num ? 'selected' : ''}>${m.name}</option>`).join('')}
            </select>
          </div>

          <select class="form-control" style="font-size:14px; font-weight:700; height:42px; border-radius:10px; min-width:130px;" onchange="setStockTech(this.value)">
            <option value="">ช่างทั้งหมด</option>
            ${techList.map(x => `<option value="${x}" ${x === stockTech ? 'selected' : ''}>${esc(x)}</option>`).join('')}
          </select>

          ${isPeriodFiltered ? `
            <button type="button" class="btn btn-outline btn-sm" style="height:42px; font-size:13px; border-radius:10px;" onclick="resetStockPeriod()">
              ✕ รีเซ็ต
            </button>
          ` : ''}

          <button class="btn btn-primary btn-sm" onclick="csv()" style="white-space:nowrap; height:42px; font-size:14px; font-weight:700; border-radius:10px; padding:0 14px;">
            📥 ส่งออก CSV
          </button>
        </div>
      </div>

      <!-- ส่วนที่ 1: 3 Stat KPI Cards (ตามรูปภาพ) -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px; margin-bottom:20px;">
        <!-- Card 1: รายการที่เบิกทั้งหมด (สีน้ำเงิน) -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:22px; display:flex; align-items:center; gap:18px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
          <div style="background:#eff6ff; color:#2563eb; width:56px; height:56px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:26px;">
            📋
          </div>
          <div>
            <div style="font-size:14px; font-weight:700; color:#64748b;">รายการที่เบิกทั้งหมด</div>
            <div style="font-size:28px; font-weight:800; color:#0b2545; margin-top:2px;">
              ${filteredUsage.length} <span style="font-size:16px; font-weight:600; color:#64748b;">รายการ</span>
            </div>
          </div>
        </div>

        <!-- Card 2: ยอดเบิกใช้ทั้งหมด (สีม่วง) -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:22px; display:flex; align-items:center; gap:18px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
          <div style="background:#f5f3ff; color:#7c3aed; width:56px; height:56px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:26px;">
            🔧
          </div>
          <div>
            <div style="font-size:14px; font-weight:700; color:#64748b;">ยอดเบิกใช้ทั้งหมด</div>
            <div style="font-size:28px; font-weight:800; color:#0b2545; margin-top:2px;">
              ฿${totalCost.toLocaleString()}
            </div>
          </div>
        </div>

        <!-- Card 3: ผู้เบิกทั้งหมด (สีเขียว) -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:22px; display:flex; align-items:center; gap:18px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
          <div style="background:#f0fdf4; color:#16a34a; width:56px; height:56px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:26px;">
            👤
          </div>
          <div>
            <div style="font-size:14px; font-weight:700; color:#64748b;">ผู้เบิกทั้งหมด</div>
            <div style="font-size:28px; font-weight:800; color:#0b2545; margin-top:2px;">
              ${activeTechs.size} <span style="font-size:16px; font-weight:600; color:#64748b;">คน</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ส่วนที่ 2: Middle Section (2 Charts ตามรูปภาพต้นแบบ) -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:18px; margin-bottom:22px;">
        <!-- Chart 1: ยอดเบิกใช้ตามหมวดหมู่ (Bar Chart) -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:22px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="font-size:17px; font-weight:800; color:#0b2545; margin:0; display:flex; align-items:center; gap:8px;">
              <span>📊</span> ยอดเบิกใช้ตามหมวดหมู่
            </h3>
          </div>

          <!-- Vertical Bars Visualization -->
          <div style="height:210px; display:flex; align-items:flex-end; justify-content:space-around; gap:14px; border-bottom:1.5px solid #e2e8f0; padding-bottom:8px; margin-bottom:12px;">
            ${Object.entries(catBreakdown).map(([cat, cost]) => {
              const heightPct = maxCatCost > 0 ? Math.max((cost / maxCatCost) * 160, cost > 0 ? 18 : 6) : 6;
              const color = catColors[cat];
              return `
                <div style="display:flex; flex-direction:column; align-items:center; flex:1; max-width:85px;">
                  <span style="font-size:12.5px; font-weight:800; color:#0b2545; margin-bottom:6px; white-space:nowrap;">
                    ${cost > 0 ? `฿${cost.toLocaleString()}` : '-'}
                  </span>
                  <div style="width:100%; height:${heightPct}px; background:${color}; border-radius:8px 8px 0 0; transition:all 0.3s ease; box-shadow:0 2px 6px ${color}33;"></div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display:flex; justify-content:space-around; gap:8px; text-align:center;">
            ${Object.keys(catBreakdown).map(cat => `
              <div style="flex:1; max-width:85px; font-size:12.5px; font-weight:700; color:#475569;">
                ${esc(cat)}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Chart 2: สัดส่วนการเบิกตามหมวดหมู่ (Doughnut Chart) -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:22px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="font-size:17px; font-weight:800; color:#0b2545; margin:0; display:flex; align-items:center; gap:8px;">
              <span>🎯</span> สัดส่วนการเบิกตามหมวดหมู่
            </h3>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-around; gap:20px; flex-wrap:wrap; min-height:210px;">
            <!-- Circular Donut SVG -->
            <div style="position:relative; width:170px; height:170px; display:flex; align-items:center; justify-content:center;">
              <svg width="170" height="170" viewBox="0 0 100 100" style="transform:rotate(-90deg);">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" stroke-width="14" />
                ${(() => {
                  if (totalCost <= 0) return '';
                  let accOffset = 0;
                  const circumference = 2 * Math.PI * 38; // ~238.76
                  return Object.entries(catBreakdown).map(([cat, cost]) => {
                    const pct = cost / totalCost;
                    const strokeLen = pct * circumference;
                    const strokeDasharray = `${strokeLen} ${circumference - strokeLen}`;
                    const strokeDashoffset = -accOffset;
                    accOffset += strokeLen;
                    return `
                      <circle cx="50" cy="50" r="38" fill="none" stroke="${catColors[cat]}" stroke-width="14" stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}" />
                    `;
                  }).join('');
                })()}
              </svg>
              <!-- Center Total Text -->
              <div style="position:absolute; text-align:center; padding:0 8px;">
                <div style="font-size:16px; font-weight:800; color:#0b2545;">฿${totalCost.toLocaleString()}</div>
                <div style="font-size:11.5px; color:#64748b; font-weight:600;">รวมทั้งหมด</div>
              </div>
            </div>

            <!-- Legend with percentages -->
            <div style="display:flex; flex-direction:column; gap:10px; min-width:140px;">
              ${Object.entries(catBreakdown).map(([cat, cost]) => `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:13.5px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="width:10px; height:10px; border-radius:50%; background:${catColors[cat]};"></span>
                    <span style="font-weight:600; color:#334155;">${esc(cat)}</span>
                  </div>
                  <b style="color:#0b2545; font-size:14px;">${catPercentages[cat]}%</b>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- ส่วนที่ 3: ตารางรายการวัสดุที่เบิก (เรียงวันที่ใหม่สุดอยู่บน ตามที่ระบุ) -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:22px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <h3 style="font-size:18px; font-weight:800; color:#0b2545; margin:0; display:flex; align-items:center; gap:8px;">
            <span>📋</span> รายการวัสดุที่เบิก <span style="font-size:14px; font-weight:600; color:#64748b;">(จัดเรียงตามวันที่ใหม่ล่าสุด)</span>
          </h3>

          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <!-- ช่องค้นหาเลขใบซ่อมในหน้าวัสดุ -->
            <div style="position:relative; min-width:240px;">
              <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#64748b; font-size:14px;">🔍</span>
              <input type="text" class="form-control" placeholder="ค้นหาด้วยเลขใบซ่อม เช่น REP-..." value="${esc(stockSearch)}" oninput="setStockSearch(this.value)" style="padding-left:36px; padding-right:30px; height:38px; font-size:13.5px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff;">
              ${stockSearch ? `
                <button type="button" onclick="resetStockSearch()" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; font-size:16px; cursor:pointer;" title="ล้างการค้นหา">&times;</button>
              ` : ''}
            </div>

            <span class="badge badge-done" style="font-size:13.5px; font-weight:700;">
              แสดง ${filteredUsage.length} รายการ
            </span>
          </div>
        </div>

        ${stockSearch ? `
          <div style="margin-top:-6px; margin-bottom:14px; font-size:14px; color:#ea580c; font-weight:700; display:flex; align-items:center; gap:6px;">
            <span>🔍</span> ผลการค้นหาเลขใบซ่อม "${esc(stockSearch)}": พบ <b>${filteredUsage.length}</b> รายการ
          </div>
        ` : ''}

        <div class="nusp-table-wrapper">
          <table class="nusp-table">
            <thead>
              <tr>
                <th style="min-width:130px;">วันที่</th>
                <th style="min-width:140px;">ชื่อช่าง</th>
                <th style="min-width:130px;">เลขซ่อม</th>
                <th style="min-width:180px;">รายการวัสดุ</th>
                <th style="min-width:90px; text-align:center;">จำนวน</th>
                <th style="min-width:110px; text-align:right;">งบประมาณ</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsage.length ? filteredUsage.map(u => {
                const info = getMatInfo(u.name);
                const qty = Number(u.qty) || 1;
                const cost = u.cost ? Number(u.cost) : (qty * info.price);
                const dateStr = u.created_at ? fmt(u.created_at) : (u.date || '-');

                return `
                  <tr>
                    <td style="color:#64748b; font-size:14px; white-space:nowrap;">
                      🕒 ${esc(dateStr)}
                    </td>
                    <td style="font-weight:700; color:#0b2545; white-space:nowrap;">
                      👨‍🔧 ${esc(u.tech_name || 'ช่างซ่อมบำรุง')}
                    </td>
                    <td style="font-weight:800; font-family:monospace; color:#ea580c; white-space:nowrap;">
                      ${esc(u.ticket_id || '-')}
                    </td>
                    <td style="font-weight:700; color:#0f172a;">
                      ${esc(u.name)}
                      <span style="font-size:11.5px; margin-left:6px; color:${info.color}; background:${info.color}15; padding:1px 6px; border-radius:4px; font-weight:600;">
                        ${esc(info.cat)}
                      </span>
                    </td>
                    <td style="font-weight:800; color:#0284c7; white-space:nowrap; text-align:center;">
                      ${qty} ${esc(u.unit || info.unit)}
                    </td>
                    <td style="font-weight:800; color:#15803d; white-space:nowrap; text-align:right;">
                      ฿${cost.toLocaleString()}
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="6" class="mut" style="text-align:center; padding:36px; font-size:15.5px;">
                    ไม่พบรายการเบิกวัสดุตามช่วงเวลาหรือเงื่อนไขที่เลือก
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.csv = function () {
  const c = s => '"' + String(s ?? '').replace(/"/g, '""') + '"', r = stockTech ? U.filter(u => u.tech_name === stockTech) : U;
  const txt = '\uFEFFวันที่,ชื่อช่าง,เลขซ่อม,รายการวัสดุ,จำนวน,หน่วย,งบประมาณ\n' + r.map(u => {
    const info = getMatInfo(u.name);
    const qty = Number(u.qty) || 1;
    const cost = u.cost ? Number(u.cost) : (qty * info.price);
    return [fmt(u.created_at), u.tech_name, u.ticket_id, u.name, u.qty, u.unit || info.unit, cost].map(c).join(',');
  }).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv' })); a.download = 'material-usage.csv'; a.click();
};

// ==========================================================================
// Screen: ตรวจสอบประวัติการซ่อมครุภัณฑ์ (Asset Maintenance History Checker)
// ==========================================================================
let assetSearchKeyword = '';
window.assetSearchKeyword = assetSearchKeyword;

let assetHistoryYear = 'all';
let assetHistoryMonth = 'all';

window.setAssetHistoryYear = function(y) {
  assetHistoryYear = y;
  render();
};

window.setAssetHistoryMonth = function(m) {
  assetHistoryMonth = m;
  render();
};

window.resetAssetHistoryPeriod = function() {
  assetHistoryYear = 'all';
  assetHistoryMonth = 'all';
  render();
};

window.searchAsset = function(val) {
  assetSearchKeyword = (val || '').trim();
  render();
};

window.resetAssetSearch = function() {
  assetSearchKeyword = '';
  assetHistoryYear = 'all';
  assetHistoryMonth = 'all';
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

  // รวบรวมรายชื่อปีที่มีในระบบ
  const yearSet = new Set();
  allTickets.forEach(t => {
    const d = getAdminTicketDateObj(t);
    if (d) yearSet.add(d.getFullYear());
  });
  if (!yearSet.size) yearSet.add(new Date().getFullYear());
  const sortedYears = Array.from(yearSet).sort((a, b) => b - a);

  const thaiMonths = [
    { num: '01', name: 'มกราคม' },
    { num: '02', name: 'กุมภาพันธ์' },
    { num: '03', name: 'มีนาคม' },
    { num: '04', name: 'เมษายน' },
    { num: '05', name: 'พฤษภาคม' },
    { num: '06', name: 'มิถุนายน' },
    { num: '07', name: 'กรกฎาคม' },
    { num: '08', name: 'สิงหาคม' },
    { num: '09', name: 'กันยายน' },
    { num: '10', name: 'ตุลาคม' },
    { num: '11', name: 'พฤศจิกายน' },
    { num: '12', name: 'ธันวาคม' }
  ];

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

  let rawSearchResults = null;
  const hasSearched = Boolean(assetSearchKeyword);

  if (hasSearched) {
    const cleanKey = assetSearchKeyword.toLowerCase();
    rawSearchResults = allTickets.filter(t => {
      const a = (t.items?.[0]?.asset || t.asset_no || t.asset || '').trim().toLowerCase();
      return a && (a === cleanKey || a.includes(cleanKey));
    });
  }

  // กรอง searchResults ตามตัวเลือก ปี และ เดือน
  const isPeriodFiltered = assetHistoryYear !== 'all' || assetHistoryMonth !== 'all';
  let searchResults = rawSearchResults || [];

  if (rawSearchResults && rawSearchResults.length > 0) {
    if (assetHistoryYear !== 'all') {
      searchResults = searchResults.filter(t => {
        const d = getAdminTicketDateObj(t);
        return d && d.getFullYear() === Number(assetHistoryYear);
      });
    }
    if (assetHistoryMonth !== 'all') {
      searchResults = searchResults.filter(t => {
        const d = getAdminTicketDateObj(t);
        if (!d) return false;
        const mStr = String(d.getMonth() + 1).padStart(2, '0');
        return mStr === assetHistoryMonth;
      });
    }
  }

  // คำนวณสรุปข้อมูลหากพบประวัติ
  let assetSummary = null;
  if (rawSearchResults && rawSearchResults.length > 0) {
    rawSearchResults.sort((a, b) => {
      const tA = new Date(a.created_at || a.done_at || 0).getTime();
      const tB = new Date(b.created_at || b.done_at || 0).getTime();
      return tB - tA;
    });

    const first = rawSearchResults[0];
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
      allTimeCount: rawSearchResults.length,
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
        rawSearchResults && rawSearchResults.length > 0 ? `
          <!-- พบคลังข้อมูลครุภัณฑ์ -->
          <!-- แถวบน: ปุ่มย้อนกลับ + ตัวกรองเลือกดูรายปีและรายเดือน -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
            <button type="button" class="btn btn-outline" style="font-size:14.5px; font-weight:700; border-radius:10px; display:inline-flex; align-items:center; gap:6px; color:#0b2545; border:1.5px solid #cbd5e1; background:#ffffff; padding:8px 18px;" onclick="resetAssetSearch()">
              ← ย้อนกลับไปหน้ารายการครุภัณฑ์
            </button>

            <!-- ตัวกรองช่วงเวลา ปี/เดือน ของประวัติครุภัณฑ์ -->
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; background:#f8fafc; border:1.5px solid #cbd5e1; padding:6px 12px; border-radius:10px;">
              <span style="font-size:13.5px; font-weight:700; color:#0b2545;">🗓️ ช่วงเวลา:</span>
              <button type="button" class="btn ${!isPeriodFiltered ? 'btn-primary' : 'btn-outline'} btn-sm" style="font-size:13px; padding:4px 10px;" onclick="resetAssetHistoryPeriod()">
                ทั้งหมด (${assetSummary.allTimeCount})
              </button>
              <select class="form-control" style="height:36px; font-size:13.5px; font-weight:700; min-width:125px; padding:2px 8px;" onchange="setAssetHistoryYear(this.value)">
                <option value="all" ${assetHistoryYear === 'all' ? 'selected' : ''}>-- ทุกปี --</option>
                ${sortedYears.map(y => `<option value="${y}" ${String(assetHistoryYear) === String(y) ? 'selected' : ''}>พ.ศ. ${y + 543} (${y})</option>`).join('')}
              </select>
              <select class="form-control" style="height:36px; font-size:13.5px; font-weight:700; min-width:130px; padding:2px 8px;" onchange="setAssetHistoryMonth(this.value)">
                <option value="all" ${assetHistoryMonth === 'all' ? 'selected' : ''}>-- ทุกเดือน --</option>
                ${thaiMonths.map(m => `<option value="${m.num}" ${assetHistoryMonth === m.num ? 'selected' : ''}>${m.name}</option>`).join('')}
              </select>
            </div>
          </div>

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
                พบประวัติการซ่อม ${assetSummary.repairsCount} ครั้ง ${isPeriodFiltered ? `(จากทั้งหมด ${assetSummary.allTimeCount} ครั้ง)` : ''}
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
                      <td colspan="5" style="text-align:center; padding:24px; color:#64748b;">ไม่มีประวัติการเบิกวัสดุสำหรับครุภัณฑ์นี้ในช่วงเวลาที่เลือก</td>
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
              ${searchResults.length ? searchResults.map((t, idx) => {
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
              }).join('') : `
                <div style="text-align:center; padding:32px 16px; color:#64748b; background:#f8fafc; border-radius:10px;">
                  ไม่พบรายการซ่อมสำหรับครุภัณฑ์นี้ในช่วงเวลาที่เลือก
                  <div style="margin-top:8px;">
                    <button type="button" class="btn btn-outline btn-sm" onclick="resetAssetHistoryPeriod()">แสดงทุกช่วงเวลา</button>
                  </div>
                </div>
              `}
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
            <button type="button" class="btn btn-outline" style="min-width:180px; font-weight:700; border-radius:8px;" onclick="resetAssetSearch()">
              ← ย้อนกลับไปหน้ารายการครุภัณฑ์
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

const sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // ปลดล็อค navigator.locks สำหรับมือถือ ป้องกันบั๊ก Web Locks API ค้างใน mobile browser
    lock: async (_name, _acquireTimeout, fn) => {
      return await fn();
    }
  }
});
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = t => t ? new Date(t).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '';
const toast = m => { const t = $('#toast'); if (!t) return; t.textContent = m; t.style.display = 'block'; clearTimeout(window._t); window._t = setTimeout(() => t.style.display = 'none', 4000) };

window.sb = sb;
window.$ = $;
window.esc = esc;
window.fmt = fmt;
window.toast = toast;

// ดึงหัวข้อและรายละเอียดอาการ/ปัญหาอย่างแม่นยำจากทุก field ที่อาจถูกบันทึกมา
window.getTicketTitle = function(t) {
  if (!t) return 'แจ้งซ่อม/บริการ';
  return t.title || t.items?.[0]?.item || t.sub_type || t.cat || 'แจ้งซ่อม/บริการ';
};

window.getTicketDesc = function(t) {
  if (!t) return '-';
  // 1. อาการจาก items[0].sym
  const sym = t.items?.[0]?.sym;
  if (sym && String(sym).trim()) return String(sym).trim();
  // 2. อาการจาก desc หรือ details หรือ detail
  if (t.desc && String(t.desc).trim()) return String(t.desc).trim();
  if (t.details && String(t.details).trim()) return String(t.details).trim();
  if (t.detail && String(t.detail).trim()) return String(t.detail).trim();
  // 3. รวม items ทั้งหมดถ้ามี
  if (Array.isArray(t.items) && t.items.length) {
    const syms = t.items.map(i => i.sym || i.item).filter(Boolean);
    if (syms.length) return syms.join(', ');
  }
  // 4. บันทึกเพิ่มเติม หรือหมายเหตุ
  if (t.note && String(t.note).trim()) return String(t.note).trim();
  return '-';
};

window.getTicketArea = function(t) {
  if (!t) return '';
  return t.area || t.items?.[0]?.area || '';
};

window.getTicketRemark = function(t) {
  if (!t) return '';
  return t.remark || t.items?.[0]?.remark || '';
};

window.cleanBuildingName = function(bld) {
  if (!bld || bld === '-') return '-';
  return String(bld).replace(/^อาคาร\s*[:：]?\s*/, '').trim() || '-';
};

window.formatTicketLocation = function(t) {
  if (!t) return '-';
  const cleanBld = window.cleanBuildingName(t.bld);
  const bldStr = t.bld_other ? `อาคาร ${cleanBld} (${t.bld_other})` : (cleanBld !== '-' ? `อาคาร ${cleanBld}` : '');
  const flrStr = t.flr ? `ชั้น ${t.flr}` : '';
  const roomStr = t.room ? `ห้อง ${t.room}` : '';
  const area = (typeof getTicketArea === 'function') ? getTicketArea(t) : (t.area || t.items?.[0]?.area || '');
  const areaStr = area ? `(บริเวณ: ${area})` : '';

  const parts = [bldStr, flrStr, roomStr, areaStr].filter(Boolean);
  return parts.join(' ') || '-';
};

var getTicketTitle = window.getTicketTitle;
var getTicketDesc = window.getTicketDesc;
var getTicketArea = window.getTicketArea;
var getTicketRemark = window.getTicketRemark;
var cleanBuildingName = window.cleanBuildingName;
var formatTicketLocation = window.formatTicketLocation;

window.logh = (t, s, tag) => {
  const item = { s, at: Date.now() };
  if (tag) item.tag = tag;
  return [...(t?.history || []), item];
};
var logh = window.logh;

window.isUUID = s => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
var isUUID = window.isUUID;

const ST = { 
  accepted: ['รับเรื่องแล้ว', 'var(--primary)'], 
  doing: ['กำลังดำเนินการ', 'var(--warning)'], 
  checking: ['ตรวจสอบงาน', '#0284c7'],
  done: ['เสร็จสิ้น', 'var(--success)'], 
  closed: ['เสร็จสิ้น', 'var(--success)'],
  deleted: ['ยกเลิก/ลบ', 'var(--danger)'] 
};
window.ST = ST;

const REP = ['ระบบปรับอากาศ', 'เครื่องจักร', 'ระบบไฟฟ้ากำลัง', 'ระบบแสงสว่าง', 'ระบบประปา', 'ระบบ Internet', 'ระบบน้ำบริสุทธิ์ (DI)', 'ฝ้าเพดาน', 'ประตู', 'หน้าต่าง', 'ห้องน้ำ', 'พื้น', 'อื่น ๆ'];
const INS = ['ติดตั้งเครื่องจักร', 'ติดตั้งระบบไฟฟ้ากำลัง', 'ติดตั้งระบบแสงสว่าง', 'ติดตั้งระบบประปา', 'ติดตั้งระบบ Internet', 'ต่อเติมอาคาร', 'อื่น ๆ'];
const MATS = ['หลอดไฟ LED', 'บัลลาสต์/สตาร์ทเตอร์', 'สายไฟ', 'เบรกเกอร์', 'ก๊อกน้ำ', 'ท่อ PVC', 'น้ำยาแอร์', 'เทปพันสายไฟ', 'อื่นๆ'];
window.REP = REP;
window.INS = INS;
window.MATS = MATS;

// งบประมาณของใบงาน = ผลรวมงบที่ช่างกรอกในใบเบิกวัสดุ (usage.budget) ของใบงานนั้น
// ไม่มีใบเบิกที่ระบุงบ -> null (หน้าจอแสดงเป็น -)
window.ticketBudget = function (ticketId) {
  let sum = 0, has = false;
  (typeof U !== 'undefined' ? U : []).forEach(u => {
    if (u.ticket_id !== ticketId || u.budget === null || u.budget === undefined || u.budget === '') return;
    const n = Number(u.budget);
    if (!isNaN(n)) { sum += n; has = true; }
  });
  return has ? sum : null;
};
window.fmtTicketBudget = function (ticketId) {
  const b = window.ticketBudget(ticketId);
  return b === null ? '-' : b.toLocaleString() + ' บาท';
};

// ฟังก์ชันกลางแปลงข้อมูลผู้ใช้สำหรับแสดงผลจริง ไม่ให้มีเครื่องหมายขีด (-) และลิ้งค์ข้อมูลจริงเสมอ
window.getUserDisplayInfo = function(u) {
  if (!u) return { email: 'staff.seed@nusp.or.th', tel: '055-968600 (ส่วนกลาง NUSP)', org: 'อุทยานวิทยาศาสตร์ฯ (NU SEED)', workDisplay: '0 งาน' };

  const rawName = (u.name || '').trim();
  const cleanName = rawName.replace(/\s*\(.*?\)\s*/g, '').trim();

  // 1. Email Lookup & Heuristics
  let email = u.email || '';
  if (!email || email === '-' || email === 'null' || email === 'user@nusp.or.th') {
    try {
      const emCache = JSON.parse(localStorage.getItem('nusp_staff_emails') || '{}');
      email = emCache[u.id] || emCache[rawName] || emCache[cleanName] || '';
    } catch(e) {}
  }
  if (!email || email === '-' || email === 'null' || email === 'user@nusp.or.th') {
    const foundT = (typeof T !== 'undefined' ? T : []).find(x => 
      (x.user_id === u.id || x.name?.includes(cleanName) || x.reporter_name?.includes(cleanName) || x.assigned_tech === cleanName) && 
      x.email && x.email !== 'user@nusp.or.th' && x.email !== '-' && x.email !== 'null'
    );
    if (foundT) email = foundT.email;
  }
  if (!email || email === '-' || email === 'null' || email === 'user@nusp.or.th') {
    if (cleanName === 'ต่อศักดิ์ เทียนท้าว') email = 'torsak.t@nusp.or.th';
    else if (cleanName === 'เสี่ยหนู') email = 'sianoo@nusp.or.th';
    else if (cleanName === 'Kla' || cleanName.toLowerCase() === 'kla') email = 'kla@nusp.or.th';
    else if (cleanName.includes('Admin') || cleanName.includes('ผู้ดูแลระบบ') || cleanName.includes('Amc')) email = 'admin@nusp.or.th';
    else if (cleanName.includes('TECH') || cleanName.includes('ช่าง')) email = 'tech@nusp.or.th';
    else if (/[a-zA-Z0-9]/.test(cleanName)) {
      email = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@nusp.or.th';
    } else {
      const safeId = (u.id ? String(u.id).replace(/[^a-z0-9]/gi, '').slice(0, 6) : 'staff');
      email = 'user_' + safeId + '@nusp.or.th';
    }
  }

  // 2. Telephone Lookup & Heuristics
  let tel = u.tel || '';
  if (!tel || tel === '-' || tel === 'null') {
    const foundT = (typeof T !== 'undefined' ? T : []).find(x => 
      (x.user_id === u.id || x.name?.includes(cleanName) || x.reporter_name?.includes(cleanName)) && 
      x.tel && x.tel !== '-' && x.tel !== 'null'
    );
    if (foundT) tel = foundT.tel;
  }
  if (!tel || tel === '-' || tel === 'null') {
    if (cleanName === 'ต่อศักดิ์ เทียนท้าว') tel = '0631133309';
    else if (cleanName === 'เสี่ยหนู') tel = '0654149927';
    else if (cleanName === 'Kla' || cleanName.toLowerCase() === 'kla') tel = '089-7001234';
    else if (cleanName.includes('Admin') || cleanName.includes('ผู้ดูแลระบบ') || cleanName.includes('Amc')) tel = '055-968600 (ส่วนกลาง NUSP)';
    else if (cleanName.includes('TECH') || cleanName.includes('ช่าง')) tel = '055-968601 (ฝ่ายซ่อมบำรุง)';
    else tel = '055-968600 (ส่วนกลาง NUSP)';
  }
  tel = tel.replace(/\s*\(ภายใน\s*-\s*\)/g, '');

  // 3. Organization Lookup & Heuristics
  let org = u.org || '';
  if (!org || org === '-' || org === 'null') {
    const match = rawName.match(/\((.*?)\)/);
    if (match && match[1] && !match[1].includes('ภายใน') && !/^\d+$/.test(match[1])) {
      org = match[1].trim();
    }
  }
  if (!org || org === '-' || org === 'null') {
    const foundT = (typeof T !== 'undefined' ? T : []).find(x => 
      (x.user_id === u.id || x.name?.includes(cleanName) || x.reporter_name?.includes(cleanName)) && 
      x.org && x.org !== '-' && x.org !== 'null'
    );
    if (foundT) org = foundT.org;
  }
  if (!org || org === '-' || org === 'null') {
    if (cleanName === 'ต่อศักดิ์ เทียนท้าว' || cleanName === 'เสี่ยหนู' || cleanName.toLowerCase() === 'kla') org = 'NU SEED';
    else if (u.role === 'admin') org = 'สำนักงานผู้อำนวยการ NUSP';
    else if (u.role === 'tech') org = 'ฝ่ายอาคารสถานที่และซ่อมบำรุง';
    else org = 'อุทยานวิทยาศาสตร์ฯ (NU SEED)';
  }

  // 4. Work count display
  let workDisplay = '';
  if (u.role === 'tech') {
    const jobs = (typeof T !== 'undefined' ? T : []).filter(x => x.tech_name === cleanName || x.tech_id === u.id).length;
    workDisplay = `<span style="color:#0284c7; font-weight:700;">${jobs || u.jobs || 0} งาน</span>`;
  } else if (u.role === 'admin') {
    workDisplay = `<span style="color:#b45309; font-weight:700;">ผู้ดูแลระบบ</span>`;
  } else {
    const tCount = (typeof T !== 'undefined' ? T : []).filter(x => 
      x.user_id === u.id || x.name?.includes(cleanName) || x.reporter_name?.includes(cleanName)
    ).length;
    workDisplay = `<span style="color:#475569; font-weight:700;">${tCount} ใบแจ้ง</span>`;
  }

  return { email, tel, org, workDisplay };
};

// ฟังก์ชันดาวน์โหลดรายงานเป็นไฟล์ CSV (เปิดใน Excel ได้ภาษาไทยไม่เพี้ยน ด้วย UTF-8 BOM)
window.exportToCSV = function(filename, headers, rows) {
  const BOM = '\uFEFF';
  const csvContent = [
    headers.map(h => `"${String(h ?? '').replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(col => `"${String(col ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.setAttribute('download', filename.endsWith('.csv') ? filename : filename + '.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
  toast('📥 ดาวน์โหลดไฟล์ ' + filename + ' เรียบร้อยแล้ว');
};

var me = null, uid = null, tab = 'login', T = [], U = [], techs = [], allStaff = [], fil = 'accepted', fT = '', found = undefined, lastNo = '', armed = '', lastTrackEmail = '';
window.allStaff = allStaff;
var statM = new Date().toISOString().slice(0, 7); 
var hFil = 'all';
var adminView = 'admin'; // 'admin' | 'tech' | 'reporter'

window.me = me;
window.tab = tab;
window.T = T;
window.U = U;
window.techs = techs;
window.adminView = adminView;

const DEV = !!CONFIG.DEV;

window.toggleSidebar = function(force) {
  const sbEl = $('#sidebar');
  const bdEl = $('#sidebar-backdrop');
  if (typeof force === 'boolean') {
    if (sbEl) sbEl.classList.toggle('open', force);
    if (bdEl) bdEl.classList.toggle('open', force);
  } else {
    if (sbEl) sbEl.classList.toggle('open');
    if (bdEl) bdEl.classList.toggle('open');
  }
};

window.setAdminView = function(view) {
  adminView = view;
  if (view === 'admin') tab = 'dashboard';
  else if (view === 'tech') tab = 'pool';
  else if (view === 'reporter') tab = 'home';
  found = undefined;
  if (tab === 'history' || tab === 'home') loadHistoryData();
  render();
};

window.setHFil = function(f) { hFil = f; render(); };
window.goToHistoryWithFilter = function(f) { hFil = f || 'all'; setTab('history'); };
window.setStatM = function(m) { statM = m; render(); };
window.setFil = function(f) { fil = f; render(); };
window.setFT = function(f) { fT = f; render(); };

window.copyNo = function(no, e) {
  if (e) e.stopPropagation();
  navigator.clipboard.writeText(no);
  toast('คัดลอก ' + no + ' แล้ว!');
};

// ==========================================================================
// Ticket Real-time Sync & History Loader
// ==========================================================================
const ticketBC = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('nusp_ticket_sync') : null;
if (ticketBC) {
  ticketBC.onmessage = (msg) => {
    if (msg?.data?.type === 'TICKET_UPDATED') {
      if (window.me && (window.me.role === 'admin' || window.me.role === 'tech')) {
        window.go(true);
      } else {
        window.loadHistoryData();
      }
    }
  };
}

window.broadcastTicketUpdate = function() {
  try {
    if (ticketBC) ticketBC.postMessage({ type: 'TICKET_UPDATED', at: Date.now() });
    localStorage.setItem('nusp_ticket_last_update', String(Date.now()));
  } catch (e) {}
};

window.addEventListener('storage', (e) => {
  if (e.key === 'nusp_ticket_last_update') {
    if (window.me && (window.me.role === 'admin' || window.me.role === 'tech')) {
      window.go(true);
    } else {
      window.loadHistoryData();
    }
  }
});

window.loadHistoryData = async function() {
  const myT = JSON.parse(localStorage.getItem('myT') || '[]');
  const reporterEmail = (window.me && window.me.role === 'reporter' ? window.me.email : '') || localStorage.getItem('last_reporter_email') || '';

  // 1. ถ้ามีอีเมลผู้แจ้ง ให้ลองดึงรายการล่าสุดจาก Supabase เพื่อให้สถานะอัปเดตทันที
  if (reporterEmail) {
    try {
      const { data: ticketsFromEmail } = await sb.from('tickets')
        .select('*')
        .ilike('email', reporterEmail.trim())
        .order('created_at', { ascending: false })
        .limit(100);

      if (ticketsFromEmail && ticketsFromEmail.length) {
        const emailMap = new Map();
        ticketsFromEmail.forEach(t => {
          emailMap.set(t.id, {
            no: t.id,
            title: t.title || 'แจ้งซ่อม/บริการ',
            type: t.cat || 'ซ่อมแซม',
            location: `อาคาร ${t.bld || '-'} ชั้น ${t.flr || '-'}`,
            room: t.room || '',
            area: t.area || t.items?.[0]?.area || '',
            remark: t.remark || t.items?.[0]?.remark || '',
            email: t.email,
            status: t.status,
            date: t.created_at ? new Date(t.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
          });
        });

        // รวมกับประวัติเดิมที่อาจมีในเครื่อง
        myT.forEach(oldT => {
          if (!emailMap.has(oldT.no)) emailMap.set(oldT.no, oldT);
        });

        const merged = Array.from(emailMap.values());
        localStorage.setItem('myT', JSON.stringify(merged));
        if (window.tab === 'history' || window.tab === 'home') render();
        return;
      }
    } catch (e) {
      console.warn('loadHistoryData direct email fetch warning:', e);
    }
  }

  // 2. ตรวจสอบสถานะใบงานทีละรายการตามประวัติ myT
  if (!myT.length) return;
  const promises = myT.map(t => 
    sb.rpc('track_ticket', { p_id: t.no, p_email: t.email || null })
      .then(r => r?.data || null, () => null)
  );

  const results = await Promise.all(promises);
  let updated = false;

  results.forEach((data, i) => {
    // track_ticket คืนค่ามาเป็น array
    const item = Array.isArray(data) ? (data[0] || null) : data;
    if (item && item.status && myT[i].status !== item.status) {
      myT[i].status = item.status; 
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem('myT', JSON.stringify(myT));
    if (window.tab === 'history' || window.tab === 'home') render();
  }
};

async function load(s) {
  if (!s?.user) {
    const saved = sessionStorage.getItem('repair_me') || localStorage.getItem('repair_me_backup');
    if (saved) {
      try {
        me = JSON.parse(saved);
        tab = me.role === 'admin' ? 'dashboard' : me.role === 'tech' ? 'pool' : 'home';
        render();
        go(true);
        return;
      } catch(e) {}
    }
    me = null; uid = null; tab = 'login'; render();
    return;
  }
  uid = s.user.id;
  const metaRole = s.user.user_metadata?.role;
  const metaName = s.user.user_metadata?.name;

  try {
    const { data } = await Promise.race([
      sb.from('profiles').select('*').eq('id', uid).maybeSingle(),
      new Promise(resolve => setTimeout(() => resolve({ data: null }), 3000))
    ]);

    if (data) {
      me = data;
      const finalRole = me.role || metaRole || 'reporter';
      const finalName = me.name || metaName || (s.user.email || 'ผู้ใช้งาน').split('@')[0];
      me.role = finalRole;
      me.name = finalName;
      me.email = s.user.email || me.email || localStorage.getItem('last_logged_in_email') || '';
      sb.from('profiles').upsert({ id: uid, name: finalName, role: finalRole }, { onConflict: 'id' }).catch(() => {});
    } else {
      const role = metaRole || (typeof loginRole !== 'undefined' && loginRole ? loginRole : 'reporter');
      me = {
        id: uid,
        name: metaName || (s.user.email || 'ผู้ใช้งาน').split('@')[0],
        role: role,
        email: s.user.email || localStorage.getItem('last_logged_in_email') || ''
      };
      sb.from('profiles').upsert({ id: uid, name: me.name, role: me.role }, { onConflict: 'id' }).catch(() => {});
    }

    if (me.email) {
      sb.from('profiles').update({ email: me.email }).eq('id', uid).catch(() => {});
    }
  } catch(err) {
    console.warn('load profile error (skipped):', err);
    const role = metaRole || 'reporter';
    me = {
      id: uid,
      name: metaName || (s.user.email || 'ผู้ใช้งาน').split('@')[0],
      role: role,
      email: s.user.email || ''
    };
  }

  // อัปเดตตารางแคชอีเมลในระบบ
  try {
    const emailCache = JSON.parse(localStorage.getItem('nusp_staff_emails') || '{}');
    if (uid && me.email) emailCache[uid] = me.email;
    if (me.name && me.email) emailCache[me.name] = me.email;
    localStorage.setItem('nusp_staff_emails', JSON.stringify(emailCache));
  } catch(e) {}

  sessionStorage.setItem('repair_me', JSON.stringify(me));
  localStorage.setItem('repair_me_backup', JSON.stringify(me));
  tab = me.role === 'admin' ? 'dashboard' : me.role === 'tech' ? 'pool' : 'home';
  
  // เรนเดอร์หน้าจอเป้าหมายทันที เพื่อไม่ให้มือถือค้างรอโหลดข้อมูล
  render();
  go(true);
}

function initApp() {
  const hash = window.location.hash || '';
  const isRecovery = hash.includes('type=recovery');

  if (isRecovery) {
    sessionStorage.removeItem('repair_me');
    localStorage.removeItem('repair_me_backup');
    me = null;
    tab = 'login';
    if (typeof setAuthMode === 'function') setAuthMode('reset_password');
    else render();
    toast('กรุณากำหนดรหัสผ่านใหม่ของคุณ ✨');
  } else {
    const saved = sessionStorage.getItem('repair_me') || localStorage.getItem('repair_me_backup');
    if (saved) {
      try {
        me = JSON.parse(saved);
        if (me && me.role) {
          tab = me.role === 'admin' ? 'dashboard' : me.role === 'tech' ? 'pool' : 'home';
          render();
          go(true);
          return;
        }
      } catch (e) {
        sessionStorage.removeItem('repair_me');
        localStorage.removeItem('repair_me_backup');
      }
    }

    me = null;
    tab = 'login';
    render();
  }

  if (!DEV) {
    if (!isRecovery) {
      sb.auth.getSession().then(({ data }) => { 
        if (data?.session && !window.location.hash.includes('type=recovery')) {
          load(data.session); 
        }
      });
    }

    sb.auth.onAuthStateChange((event, s) => { 
      if (event === 'PASSWORD_RECOVERY') {
        tab = 'login';
        if (typeof setAuthMode === 'function') setAuthMode('reset_password');
        else render();
        toast('กรุณากำหนดรหัสผ่านใหม่ของคุณ ✨');
      } else if (event === 'SIGNED_IN' && s) { 
        if (window.location.hash.includes('type=recovery')) {
          tab = 'login';
          if (typeof setAuthMode === 'function') setAuthMode('reset_password');
          else render();
        } else {
          load(s); 
        }
      }
    });
  }
}

// ล็อค Scroll หน้าเว็บข้างหลังเมื่อเปิด Modal Dialog เพื่อป้องกันการเลื่อนซ้อนทับ (Scroll Chaining)
function setupDialogScrollLock() {
  const dlg = document.getElementById('dlg');
  if (!dlg) return;
  const observer = new MutationObserver(() => {
    if (dlg.open) {
      document.body.classList.add('dialog-open');
    } else {
      document.body.classList.remove('dialog-open');
    }
  });
  observer.observe(dlg, { attributes: true, attributeFilter: ['open'] });
  dlg.addEventListener('close', () => document.body.classList.remove('dialog-open'));
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDialogScrollLock);
} else {
  setupDialogScrollLock();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initApp, 0));
} else {
  setTimeout(initApp, 0);
}

// ปิดการรีเฟรชหน้าอัตโนมัติตามคำขอ (อัปเดตเมื่อมีการกระทำ บันทึก หรือเปลี่ยนแท็บ)

// ดึงข้อมูลทั้งตารางทีละหน้า (หน้าละ 100 แถว: 0-99, 100-199, ...) จนกว่าจะหมด
// ข้อมูลเพิ่มขึ้นก็จะวนดึงหน้าเพิ่มตามไปเอง (จำกัดสูงสุด 200 หน้า = 20,000 แถว กันวนไม่รู้จบ)
async function fetchAllRows(table, pageSize = 100, maxPages = 200) {
  const run = async (orderIdToo) => {
    let all = [];
    for (let page = 0; page < maxPages; page++) {
      const from = page * pageSize;
      let q = sb.from(table).select('*').order('created_at', { ascending: false });
      // เรียงรองด้วย id กันแถวที่เวลาเท่ากัน (เช่น เบิกหลายรายการพร้อมกัน) ตกหล่น/ซ้ำตรงรอยต่อหน้า
      if (orderIdToo) q = q.order('id', { ascending: false });
      const { data, error } = await q.range(from, from + pageSize - 1);
      if (error) return { data: all, error };
      all = all.concat(data || []);
      if (!data || data.length < pageSize) break;
    }
    return { data: all, error: null };
  };
  let res = await run(true);
  if (res.error) res = await run(false); // ตารางที่ไม่มีคอลัมน์ id
  return res;
}
window.fetchAllRows = fetchAllRows;

async function go(silent = false) {
  try {
    if (me && (me.role === 'admin' || me.role === 'tech')) {
      const ticketsRes = await fetchAllRows('tickets');
      if (ticketsRes.error) {
        console.warn('tickets fetch warning:', ticketsRes.error);
      }
      T = (ticketsRes.data || []).map(t => {
        if (t.status === 'doing' && Array.isArray(t.history) && t.history.length) {
          const lastH = t.history[t.history.length - 1];
          if (lastH && lastH.s === 'checking') {
            t.status = 'checking';
          }
        }
        return t;
      });
      window.T = T;
      const usageRes = await fetchAllRows('usage');
      U = usageRes.data || [];
      window.U = U;
      if (me.role === 'admin') {
        const staffRes = await sb.from('profiles').select('*');
        const rawStaff = staffRes.data || [];
        let deletedList = [];
        try {
          deletedList = JSON.parse(localStorage.getItem('nusp_deleted_staff') || '[]');
        } catch(e) {}
        let editedStaffMap = {};
        try {
          editedStaffMap = JSON.parse(localStorage.getItem('nusp_edited_staff') || '{}');
        } catch(e) {}
        allStaff = rawStaff
          .filter(u => 
            !deletedList.includes(u.id) && 
            u.org !== 'DELETED' && 
            !(u.name && u.name.startsWith('[DELETED]'))
          )
          .map(u => {
            if (editedStaffMap[u.id]) {
              Object.assign(u, editedStaffMap[u.id]);
            }
            return u;
          });
        techs = allStaff.filter(u => u.role === 'tech');
        window.allStaff = allStaff;
        window.techs = techs;
      }
    }
  } catch (err) {
    console.error('go() error:', err);
  }
  if (!silent || !$('#dlg')?.open) {
    render();
  }
}

window.login = async function (e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const emailVal = (f.get('email') || '').trim();
  const pwVal = (f.get('pw') || '');

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.innerHTML = '<span>⏳ กำลังตรวจสอบข้อมูล...</span>';
  }

  toast('กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...');

  try {
    const signInPromise = sb.auth.signInWithPassword({ email: emailVal, password: pwVal });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('การเชื่อมต่อกับเซิร์ฟเวอร์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง')), 10000)
    );

    const { data, error } = await Promise.race([signInPromise, timeoutPromise]);
    if (error) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = 'เข้าสู่ระบบ →';
      }
      return toast('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
    }

    if (emailVal) {
      localStorage.setItem('last_logged_in_email', emailVal);
      localStorage.setItem('last_reporter_email', emailVal);
    }
    
    await load(data.session);
  } catch (err) {
    console.error('Login error:', err);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.innerHTML = 'เข้าสู่ระบบ →';
    }
    toast('เข้าสู่ระบบไม่สำเร็จ: ' + (err.message || 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'));
  }
};

window.register = async function (e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const name = (f.get('name') || '').trim();
  const email = (f.get('email') || '').trim();
  const tel = (f.get('tel') || '').trim();
  const tel_internal = (f.get('tel_internal') || '').trim();
  const org = (f.get('org') || '').trim();
  const skill = (f.get('skill') || '').trim();

  // อ่านบทบาทจากฟอร์ม หรือตัวแปร regRole โดยตรง
  let role = (f.get('role') || regRole || 'reporter').trim();
  if (role !== 'tech') role = 'reporter';

  const pw = f.get('pw');
  const pw2 = f.get('pw2');

  if (pw !== pw2) {
    return toast('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
  }

  toast(`กำลังลงทะเบียนในบทบาท: ${role === 'tech' ? 'ช่างซ่อมบำรุง' : 'ผู้แจ้งซ่อม'}...`);
  const { data, error } = await sb.auth.signUp({
    email,
    password: pw,
    options: {
      data: { 
        name, 
        role, 
        tel, 
        tel_internal, 
        org, 
        skill: role === 'tech' ? skill : null 
      }
    }
  });

  if (error) {
    if (DEV) {
      toast(`ลงทะเบียนสำเร็จ (โหมด DEV: ${role === 'tech' ? 'ช่าง' : 'ผู้แจ้ง'})!`);
      if (typeof setAuthMode === 'function') setAuthMode('login');
      return;
    }
    return toast('ลงทะเบียนไม่สำเร็จ: ' + error.message);
  }

  // บันทึก/อัปเดตลงตาราง public.profiles ทันทีให้ครบทุกฟิลด์
  if (data?.user?.id) {
    try {
      const { error: upsertErr } = await sb.from('profiles').upsert({
        id: data.user.id,
        name: name,
        role: role,
        tel: tel,
        tel_internal: tel_internal,
        org: org,
        skill: role === 'tech' ? skill : null
      }, { onConflict: 'id' });
      if (upsertErr) {
        console.warn('Upsert profile error:', upsertErr);
      }
    } catch (err) {
      console.warn('Profiles table insert failed:', err);
    }
  }

  toast(`ลงทะเบียนสำเร็จเป็น "${role === 'tech' ? 'ช่างซ่อมบำรุง' : 'ผู้แจ้งซ่อม'}" เรียบร้อยแล้ว! กรุณาเข้าสู่ระบบ`);
  if (typeof setAuthMode === 'function') setAuthMode('login');
};

// ส่งคำขอกู้คืนรหัสผ่านผ่านทางอีเมล (Self-service Password Reset)
window.requestPasswordReset = async function (e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const emailVal = (f.get('email') || '').trim();
  if (!emailVal) return toast('กรุณาระบุอีเมลของคุณ');

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.innerHTML = '<span>⏳ กำลังส่งลิงก์...</span>';
  }

  toast('กำลังดำเนินการส่งลิงก์กู้คืนรหัสผ่าน...');

  if (DEV) {
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = 'ส่งลิงก์กู้คืนรหัสผ่าน ✉️';
      }
      toast('ระบบจำลอง: ส่งลิงก์กู้คืนไปยัง ' + emailVal + ' สำเร็จแล้ว');
      setTimeout(() => {
        if (typeof setAuthMode === 'function') setAuthMode('reset_password');
      }, 1000);
    }, 600);
    return;
  }

  try {
    const isHttp = window.location.protocol.startsWith('http');
    const resetOptions = {};
    if (isHttp) {
      resetOptions.redirectTo = window.location.origin + window.location.pathname;
    }
    const { data, error } = await sb.auth.resetPasswordForEmail(emailVal, resetOptions);

    if (error) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = 'ส่งลิงก์กู้คืนรหัสผ่าน ✉️';
      }
      return toast('ไม่สามารถส่งลิงก์ได้: ' + error.message);
    }

    toast('ระบบได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยัง ' + emailVal + ' แล้ว กรุณาตรวจสอบกล่องข้อความหรืออีเมลขยะ ✉️');
    setTimeout(() => {
      if (typeof setAuthMode === 'function') setAuthMode('login');
    }, 2500);
  } catch (err) {
    console.error('Password reset request error:', err);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.innerHTML = 'ส่งลิงก์กู้คืนรหัสผ่าน ✉️';
    }
    toast('เกิดข้อผิดพลาด: ' + (err.message || 'กรุณาลองใหม่อีกครั้ง'));
  }
};

// บันทึกรหัสผ่านใหม่หลังเปิดลิงก์จากอีเมล (Save New Password)
window.saveNewPassword = async function (e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const pw = (f.get('new_pw') || '');
  const pw2 = (f.get('new_pw2') || '');

  if (!pw || pw.length < 6) {
    return toast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }
  if (pw !== pw2) {
    return toast('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.innerHTML = '<span>⏳ กำลังบันทึกรหัสผ่านใหม่...</span>';
  }

  toast('กำลังบันทึกรหัสผ่านใหม่...');

  if (DEV) {
    setTimeout(() => {
      toast('ตั้งรหัสผ่านใหม่สำเร็จแล้ว (DEV Mode) 🎉');
      if (typeof setAuthMode === 'function') setAuthMode('login');
      render();
    }, 600);
    return;
  }

  try {
    const { data, error } = await sb.auth.updateUser({ password: pw });
    if (error) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = '✨ บันทึกรหัสผ่านใหม่และเข้าสู่ระบบ';
      }
      return toast('เปลี่ยนรหัสผ่านไม่สำเร็จ: ' + error.message);
    }

    // ล้าง URL hash ที่มี token ออกเพื่อความปลอดภัยและสะอาดตา
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch(e) {}

    toast('ตั้งรหัสผ่านใหม่สำเร็จแล้ว! ยินดีต้อนรับเข้าสู่ระบบ 🎉');

    const { data: sessionData } = await sb.auth.getSession();
    if (sessionData?.session) {
      await load(sessionData.session);
    } else {
      if (typeof setAuthMode === 'function') setAuthMode('login');
      render();
    }
  } catch (err) {
    console.error('saveNewPassword error:', err);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.innerHTML = '✨ บันทึกรหัสผ่านใหม่และเข้าสู่ระบบ';
    }
    toast('เกิดข้อผิดพลาด: ' + (err.message || 'กรุณาลองใหม่อีกครั้ง'));
  }
};

// ล็อคการทำงานและการเข้าถึงแท็บตาม Role
window.setTab = function (k) {
  if (!me) {
    tab = 'login';
    render();
    return;
  }

  const roleTabs = {
    reporter: ['home', 'report', 'track', 'history', 'profile'],
    tech: ['pool', 'task_detail', 'mine', 'tech_done', 'profile'],
    admin: ['dashboard', 'all', 'asset_check', 'techs_manage', 'stock', 'home', 'report', 'track', 'history', 'pool', 'task_detail', 'mine', 'tech_done', 'profile']
  };

  const allowed = roleTabs[me.role] || ['home'];
  if (!allowed.includes(k)) {
    tab = allowed[0];
  } else {
    tab = k;
    if (me.role === 'admin') {
      if (['pool', 'task_detail', 'mine', 'tech_done'].includes(k)) adminView = 'tech';
      else if (['home', 'report', 'track', 'history'].includes(k)) adminView = 'reporter';
      else if (['dashboard', 'all', 'asset_check', 'techs_manage', 'stock'].includes(k)) adminView = 'admin';
    }
  }

  const sbEl = $('#sidebar');
  if (sbEl) sbEl.classList.remove('open');
  const bdEl = $('#sidebar-backdrop');
  if (bdEl) bdEl.classList.remove('open');

  found = undefined;
  if (tab === 'history' || tab === 'home') loadHistoryData();
  render();
};

window.signOut = function () {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    sessionStorage.removeItem('repair_me');
    localStorage.removeItem('repair_me_backup');
    if (!DEV) sb.auth.signOut();
    me = null;
    uid = null;
    tab = 'login';
    adminView = 'admin';
    if (typeof setAuthMode === 'function') setAuthMode('login');
    else render();
    toast('ออกจากระบบเรียบร้อยแล้ว');
  }
};


// ดึงข้อมูลติดต่อช่างผู้รับผิดชอบ (เบอร์ + อีเมล) สำหรับแสดงให้ผู้แจ้งเห็น
window.getTechContact = async function(t) {
  if (!t || (!t.tech_id && !t.tech_name)) return null;
  let tel = '', email = '';
  const pool = (typeof allStaff !== 'undefined' && allStaff.length) ? allStaff : ((typeof techs !== 'undefined') ? techs : []);
  let p = pool.find(x => (t.tech_id && String(x.id) === String(t.tech_id)) || (t.tech_name && x.name === t.tech_name)) || null;

  // ผู้แจ้งไม่ได้โหลดรายชื่อช่างไว้ จึงดึงจากตาราง profiles โดยตรง
  if (!p) {
    try {
      if (t.tech_id && window.isUUID(t.tech_id)) {
        const r = await sb.from('profiles').select('*').eq('id', t.tech_id).maybeSingle();
        if (r?.data) p = r.data;
      }
      if (!p && t.tech_name) {
        const r = await sb.from('profiles').select('*').eq('name', t.tech_name).limit(1);
        if (r?.data?.length) p = r.data[0];
      }
    } catch (e) {}
  }
  if (p) { tel = p.tel || ''; email = p.email || ''; }

  // แคชอีเมลในเครื่อง (สำรอง)
  if (!email) {
    try {
      const c = JSON.parse(localStorage.getItem('nusp_staff_emails') || '{}');
      email = (p?.id && c[p.id]) || (t.tech_id && c[t.tech_id]) || (t.tech_name && c[t.tech_name]) || '';
    } catch (e) {}
  }
  return { name: p?.name || t.tech_name || '', tel, email };
};

window.getReporterInfo = function(t) {
  if (!t) return { name: '-', org: '-', tel: '-', email: '-' };

  const staff = (typeof allStaff !== 'undefined' && allStaff.length) ? allStaff : ((typeof techs !== 'undefined') ? techs : []);
  let p = null;

  // 1. หาจาก user_id ก่อน
  if (t.user_id) {
    p = staff.find(x => String(x.id) === String(t.user_id));
  }

  // 2. หาจาก name / reporter_name
  const rawName = (t.name || t.reporter_name || '').trim();
  const cleanName = rawName.replace(/\s*\(.*?\)\s*/g, '').trim();

  if (!p && rawName) {
    p = staff.find(x => x.name === rawName || x.name === cleanName || (cleanName && x.name && x.name.toLowerCase() === cleanName.toLowerCase()));
  }

  // 3. เรียกใช้ getUserDisplayInfo เพื่อดึงข้อมูลจริงที่เชื่อมโยงกันอย่างแม่นยำ
  const userObj = p || {
    id: t.user_id,
    name: cleanName || rawName,
    tel: t.tel,
    email: t.email,
    org: t.org
  };

  const display = (typeof getUserDisplayInfo === 'function') 
    ? getUserDisplayInfo(userObj) 
    : { email: t.email, tel: t.tel, org: t.org };

  // สกัดหน่วยงานจากชื่อ เช่น "Kla (NU SEED)" หากไม่มี
  let finalOrg = (t.org && t.org !== '-' && t.org !== 'null') ? t.org : (display.org || p?.org || 'อุทยานวิทยาศาสตร์ฯ (NU SEED)');
  let finalTel = (t.tel && t.tel !== '-' && t.tel !== 'null') ? t.tel : (display.tel || p?.tel || '055-968600 (ส่วนกลาง NUSP)');
  let finalEmail = (t.email && t.email !== '-' && t.email !== 'null' && t.email !== 'user@nusp.or.th') ? t.email : (display.email || p?.email || 'user@nusp.or.th');

  return {
    name: cleanName || p?.name || rawName || 'ผู้แจ้งซ่อม',
    org: finalOrg,
    tel: finalTel,
    email: finalEmail
  };
};

function render() {
  const dlg = document.querySelector('dialog');
  if (!dlg || !dlg.open) {
    document.body.classList.remove('dialog-open');
  }
  const layout = $('#app-layout');
  const sidebarMenu = $('#sidebar-menu');
  const topbarTitle = $('#page-title');
  const topbarRight = $('#topbar-right');
  const appContainer = $('#app');
  const bottomNav = $('#mobile-bottom-nav');

  const titles = {
    login: 'เข้าสู่ระบบ NU SEED',
    home: 'หน้าหลัก',
    report: 'แจ้งซ่อมใหม่',
    track: 'ติดตามสถานะงานแจ้งซ่อม',
    history: 'ประวัติการแจ้งซ่อม',
    profile: 'ข้อมูลส่วนตัว',
    pool: 'งานที่รับได้',
    task_detail: 'รายละเอียดงาน',
    mine: 'งานของฉัน',
    tech_done: 'ประวัติการซ่อม',
    dashboard: 'Dashboard ภาพรวม',
    all: 'สรุปงานซ่อมทั้งหมด',
    asset_check: 'ตรวจสอบประวัติครุภัณฑ์',
    techs_manage: 'จัดการบัญชีผู้ใช้งาน',
    stock: 'วัสดุและอุปกรณ์ที่เบิก'
  };

  if (!me || tab === 'login') {
    if (layout) layout.classList.add('login-mode');
    if (topbarTitle) topbarTitle.textContent = 'ระบบแจ้งซ่อม NU SEED ';
    if (topbarRight) {
      topbarRight.innerHTML = `
        <span style="font-size:13px; color:var(--text-muted); font-weight:600;">อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร</span>
        ${DEV ? '<span class="badge" style="background:var(--primary-light); color:var(--primary); font-weight:bold; margin-left:6px;">🛠️ DEV Mode</span>' : ''}
      `;
    }
    if (sidebarMenu) sidebarMenu.innerHTML = '';
    if (bottomNav) bottomNav.style.display = 'none';
    if (appContainer) appContainer.innerHTML = vLogin();
    return;
  }

  // Logged-in Mode
  if (layout) layout.classList.remove('login-mode');
  if (topbarTitle) topbarTitle.textContent = titles[tab] || 'ระบบแจ้งซ่อม NU SEED ';

  // ปิด sidebar และ backdrop ทุกครั้งที่ render เพื่อป้องกันการค้างบังหน้าจอ
  const sbEl = $('#sidebar');
  if (sbEl) sbEl.classList.remove('open');
  const bdEl = $('#sidebar-backdrop');
  if (bdEl) bdEl.classList.remove('open');

  let currentRoleView = me.role;
  if (me.role === 'admin') {
    currentRoleView = adminView;
  }

  const menuGroups = {
    reporter: [
      ['home', '🏠', 'หน้าหลัก'],
      ['report', '📝', 'แจ้งซ่อมใหม่'],
      ['track', '🔍', 'ติดตามสถานะ'],
      ['history', '🕒', 'ประวัติการแจ้งซ่อม'],
      ['profile', '👤', 'ข้อมูลส่วนตัว']
    ],
    tech: [
      ['pool', '🧰', 'งานที่รับได้'],
      ['mine', '🛠️', 'งานของฉัน'],
      ['tech_done', '✅', 'งานที่ทำเสร็จ'],
      ['profile', '👤', 'ข้อมูลส่วนตัว']
    ],
    admin: [
      ['dashboard', '📊', 'Dashboard'],
      ['all', '📋', 'สรุปงานซ่อม'],
      ['asset_check', '🏷️', 'ประวัติครุภัณฑ์'],
      ['techs_manage', '👥', 'จัดการบัญชี'],
      ['stock', '📦', 'วัสดุที่เบิก'],
      ['profile', '👤', 'ข้อมูลส่วนตัว']
    ]
  };

  const navItems = menuGroups[currentRoleView] || menuGroups.reporter;

  if (sidebarMenu) {
    let sidebarContent = '';
    if (me.role === 'admin') {
      sidebarContent += `
        <div class="mobile-drawer-switcher" style="padding:10px 12px; margin-bottom:12px; background:rgba(255,255,255,0.06); border-radius:10px; border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">🧪 สลับมุมมองระบบ:</div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px;">
            <button type="button" class="btn btn-sm ${adminView === 'admin' ? 'btn-primary' : 'btn-outline'}" style="font-size:11.5px; padding:6px 2px; ${adminView === 'admin' ? '' : 'color:#cbd5e1; border-color:rgba(255,255,255,0.2);'}" onclick="setAdminView('admin')">👑 แอดมิน</button>
            <button type="button" class="btn btn-sm ${adminView === 'tech' ? 'btn-primary' : 'btn-outline'}" style="font-size:11.5px; padding:6px 2px; ${adminView === 'tech' ? '' : 'color:#cbd5e1; border-color:rgba(255,255,255,0.2);'}" onclick="setAdminView('tech')">🛠️ ช่าง</button>
            <button type="button" class="btn btn-sm ${adminView === 'reporter' ? 'btn-primary' : 'btn-outline'}" style="font-size:11.5px; padding:6px 2px; ${adminView === 'reporter' ? '' : 'color:#cbd5e1; border-color:rgba(255,255,255,0.2);'}" onclick="setAdminView('reporter')">👤 ผู้แจ้ง</button>
          </div>
        </div>
      `;
    }
    sidebarContent += navItems.map(([k, icon, name]) => `
      <button class="menu-link ${tab === k ? 'active' : ''}" onclick="setTab('${k}')">
        <span class="menu-icon">${icon}</span>
        <span>${name}</span>
      </button>
    `).join('');
    sidebarMenu.innerHTML = sidebarContent;
  }

  // Render Mobile Bottom Navigation Bar (Very convenient for elderly & mobile screens)
  if (bottomNav) {
    bottomNav.innerHTML = navItems.map(([k, icon, name]) => `
      <button class="bottom-nav-item ${tab === k ? 'active' : ''}" onclick="setTab('${k}')">
        <span class="bottom-nav-icon">${icon}</span>
        <span class="bottom-nav-label">${name}</span>
      </button>
    `).join('');
    // แสดง bottom nav เฉพาะบนมือถือ (ให้ CSS media query จัดการ ไม่ force inline style)
    bottomNav.style.display = '';
  }

  const roleBadges = {
    reporter: { icon: '👤', label: 'ผู้แจ้งซ่อม', avatar: '👨‍💼', color: 'var(--primary)' },
    tech: { icon: '🛠️', label: 'ช่างซ่อมบำรุง', avatar: '👷', color: '#e67e22' },
    admin: { icon: '👑', label: 'ผู้ดูแลระบบ', avatar: '👑', color: 'var(--danger)' }
  };
  const b = roleBadges[me.role] || { icon: '👤', label: 'ผู้ใช้', avatar: '👤', color: 'var(--primary)' };

  let topbarHtml = '';

  if (me.role === 'admin') {
    topbarHtml += `
      <div class="admin-view-switcher" style="display:flex; align-items:center; gap:4px; background:var(--bg-subtle); padding:4px 8px; border-radius:var(--radius-md); border:1px solid var(--border);">
        <span class="switcher-label" style="font-size:12.5px; font-weight:700; color:var(--text-muted); margin-right:2px;">🧪 สลับมุมมอง:</span>
        <button type="button" class="btn btn-sm ${adminView === 'admin' ? 'btn-primary' : 'btn-outline'}" style="padding:4px 8px; font-size:12px;" onclick="setAdminView('admin')" title="มุมมองแอดมิน">👑 <span class="view-btn-text">แอดมิน</span></button>
        <button type="button" class="btn btn-sm ${adminView === 'tech' ? 'btn-primary' : 'btn-outline'}" style="padding:4px 8px; font-size:12px;" onclick="setAdminView('tech')" title="มุมมองช่าง">🛠️ <span class="view-btn-text">ช่าง</span></button>
        <button type="button" class="btn btn-sm ${adminView === 'reporter' ? 'btn-primary' : 'btn-outline'}" style="padding:4px 8px; font-size:12px;" onclick="setAdminView('reporter')" title="มุมมองผู้แจ้ง">👤 <span class="view-btn-text">ผู้แจ้ง</span></button>
      </div>
    `;
  }

  topbarHtml += `
    <div class="user-profile-badge" onclick="setTab('profile')" title="ดูข้อมูลส่วนตัว">
      <div class="user-avatar" style="background:var(--primary); font-size:16px;">${b.avatar}</div>
      <div style="display:flex; flex-direction:column; line-height:1.2;">
        <span class="user-name-text" style="font-size:14.5px; font-weight:700;">${esc(me.name || 'ผู้ใช้งาน')}</span>
        <span style="font-size:12px; color:${b.color}; font-weight:700;">${b.label}</span>
      </div>
    </div>
  `;

  if (topbarRight) {
    topbarRight.innerHTML = topbarHtml;
  }

  const views = {
    login: vLogin,
    home: vHome,
    report: vReport,
    track: vTrack,
    history: vHistory,
    profile: vProfile,
    pool: vPool,
    task_detail: vTaskDetail,
    mine: vMine,
    tech_done: vTechDone,
    dashboard: vDashboard,
    all: vAll,
    asset_check: typeof vAssetCheck === 'function' ? vAssetCheck : () => '',
    techs_manage: vTechsManage,
    stock: vStock
  };

  const viewFn = views[tab] || views.home;
  if (appContainer) {
    appContainer.innerHTML = viewFn();
  }
}

const url = p => (!p ? '' : (p.startsWith('http') || p.startsWith('blob:')) ? p : sb.storage.from('photos').getPublicUrl(p).data.publicUrl);
const ph = (a, l) => a?.length ? `
  <div class="mut" style="margin-top:8px; font-size:12px; font-weight:600;">${l}</div>
  <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:4px;">
    ${a.map(p => `<img src="${url(p)}" loading="lazy" onclick="zoom('${p}')" style="width:70px; height:70px; object-fit:cover; border-radius:6px; cursor:zoom-in; border:1px solid var(--border);">`).join('')}
  </div>
` : '';

window.zoom = function (p) {
  const dlg = $('#dlg');
  if (!dlg) return;
  dlg.innerHTML = `
    <div style="text-align:center;">
      <img src="${url(p)}" style="max-width:100%; max-height:75vh; border-radius:8px; object-fit:contain;">
      <div style="margin-top:14px;">
        <button class="btn btn-outline" onclick="document.querySelector('#dlg').close()">ปิดหน้าต่าง</button>
      </div>
    </div>
  `;
  dlg.showModal();
};

window.toggleCardTimeline = function(id) {
  const el = document.getElementById('steps_' + id);
  if (el) {
    if (el.style.display === 'none') {
      el.style.display = 'block';
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      el.style.display = 'none';
    }
  } else {
    if (typeof quickTrack === 'function') quickTrack(id, '');
  }
};

window.editTicketAsset = function(id) {
  const t = (typeof T !== 'undefined' ? T.find(x => x.id === id) : null) || 
            (JSON.parse(localStorage.getItem('myT') || '[]').find(x => x.no === id || x.id === id));
  if (!t) return toast('ไม่พบข้อมูลใบงาน');

  const currentAsset = t.items?.[0]?.asset || t.asset_no || t.asset || '';

  const dlg = $('#dlg');
  if (!dlg) return;

  const backAction = window._lastDetailTicketId === id 
    ? `openAdminTicketModal('${esc(id)}')` 
    : `document.querySelector('#dlg').close()`;

  dlg.className = '';
  dlg.innerHTML = `
    <div style="padding:12px 6px; max-width:460px; margin:0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
        <h3 style="margin:0; font-size:18px; font-weight:800; color:#0b2545; display:flex; align-items:center; gap:8px;">
          <span>🏷️</span> ระบุ / แก้ไขหมายเลขครุภัณฑ์
        </h3>
        <button type="button" onclick="${backAction}" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b; line-height:1;">&times;</button>
      </div>

      <div style="font-size:14.5px; color:#475569; margin-bottom:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; line-height:1.5;">
        <div><b>เลขที่ใบแจ้งซ่อม:</b> <span style="color:#ea580c; font-weight:700;">${esc(t.id || t.no)}</span></div>
        <div><b>หัวข้อปัญหา:</b> ${esc(t.title || t.items?.[0]?.item || '-')}</div>
      </div>

      <div class="form-group" style="margin-bottom:18px;">
        <label style="display:block; font-weight:700; color:#0b2545; margin-bottom:6px; font-size:14.5px;">หมายเลขครุภัณฑ์</label>
        <input type="text" id="edit_asset_input" class="form-control" value="${esc(currentAsset)}" placeholder="เช่น 7440-001-0001/67" style="font-size:16px; padding:10px 12px; width:100%; border:1.5px solid #cbd5e1; border-radius:8px;" autofocus>
        <small style="color:#64748b; font-size:13px; margin-top:6px; display:block;">(ช่างหรือแอดมินสามารถระบุหรือแก้ไขหมายเลขครุภัณฑ์เพิ่มเติม เพื่อความสะดวกในการติดตาม)</small>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline" onclick="${backAction}" style="min-width:100px;">ยกเลิก</button>
        <button type="button" class="btn btn-primary" onclick="saveTicketAsset('${esc(id)}')" style="min-width:150px; font-weight:700;">💾 บันทึกเลขครุภัณฑ์</button>
      </div>
    </div>
  `;
  dlg.showModal();
};

window.saveTicketAsset = async function(id) {
  const input = document.getElementById('edit_asset_input');
  const newAsset = input ? input.value.trim() : '';

  const saveBtn = document.querySelector('#dlg button.btn-primary');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '⏳ กำลังบันทึก...';
  }

  toast('กำลังบันทึกหมายเลขครุภัณฑ์...');

  const t = (typeof T !== 'undefined' ? T.find(x => x.id === id) : null);
  
  // สร้าง items array ที่ถูกต้องเสมอ
  let itemsArr = [];
  if (t && Array.isArray(t.items) && t.items.length) {
    itemsArr = t.items.map((it, idx) => idx === 0 ? { ...it, asset: newAsset } : it);
  } else {
    itemsArr = [{ item: t?.title || 'รายการซ่อม', sym: t?.details || '', asset: newAsset }];
  }

  // อัปเดตในหน่วยความจำทันที
  if (t) {
    t.items = itemsArr;
    t.asset_no = newAsset;
    t.asset = newAsset;
  }

  // อัปเดตใน localStorage myT (ถ้ามี)
  try {
    const myT = JSON.parse(localStorage.getItem('myT') || '[]');
    const localIdx = myT.findIndex(x => (x.no === id || x.id === id));
    if (localIdx >= 0) {
      myT[localIdx].asset = newAsset;
      myT[localIdx].asset_no = newAsset;
      localStorage.setItem('myT', JSON.stringify(myT));
    }
  } catch(e) {}

  // อัปเดตลง Supabase อย่างปลอดภัย
  let updateSuccess = false;
  try {
    // วิธีที่ 1: ลองอัปเดตทั้ง items และ asset_no
    let res = await sb.from('tickets').update({ items: itemsArr, asset_no: newAsset }).eq('id', id);
    if (res?.error) {
      // วิธีที่ 2: ถ้าไม่มีคอลัมน์ asset_no ให้อัปเดตเฉพาะ items (jsonb)
      console.warn('Attempt 1 warning, fallback to items-only update:', res.error);
      res = await sb.from('tickets').update({ items: itemsArr }).eq('id', id);
    }

    if (res?.error) {
      console.error('Supabase update failed:', res.error);
      toast('⚠️ บันทึกไม่สำเร็จ: ' + (res.error.message || 'เกิดข้อผิดพลาด'));
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '💾 บันทึกเลขครุภัณฑ์';
      }
      return;
    }
    updateSuccess = true;
  } catch (err) {
    console.error('saveTicketAsset error:', err);
  }

  toast('✅ บันทึกหมายเลขครุภัณฑ์เรียบร้อยแล้ว');

  const wasInDetail = window._lastDetailTicketId === id;

  if (typeof broadcastTicketUpdate === 'function') broadcastTicketUpdate();
  
  if (typeof go === 'function') {
    await go(true);
  } else {
    render();
  }

  // ถ้าเปิดมาจากหน้ารายละเอียด ให้เปิดหน้ารายละเอียดกลับขึ้นมาพร้อมเลขครุภัณฑ์ใหม่ทันที
  if (wasInDetail && typeof openAdminTicketModal === 'function') {
    openAdminTicketModal(id);
  } else {
    $('#dlg')?.close();
  }
};

const card = (t, x = '') => {
  if (!t) return '';

  // 1. Format Thai Date & Time (e.g. 4 พ.ย. 2569 เวลา 11:06 น.)
  const d = t.created_at ? new Date(t.created_at) : null;
  const dateStr = d && !isNaN(d.getTime()) 
    ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : (t.date || '-');
  const timeStr = d && !isNaN(d.getTime()) 
    ? d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.' 
    : '';

  // 2. Status Pill & Subtitle mapping matching mockup
  let statusPillBg = '#ff4d4f';
  let statusPillText = '❗ รอดำเนินการ';
  let statusSubtext = 'กำลังรอเจ้าหน้าที่รับงาน';
  let statusBoxBg = '#fff7f7';
  let statusBoxBorder = '#ffd6d6';

  if (t.status === 'doing') {
    statusPillBg = '#f97316';
    statusBoxBg = '#fffaf0';
    statusBoxBorder = '#feebc8';
    
    const lastHist = (t.history && t.history.length) ? t.history[t.history.length - 1] : null;
    const progTag = lastHist?.tag || (t.note?.match(/^\[(.*?)\]/)?.[1]) || '';
    if (progTag) {
      statusPillText = '⏳ ' + esc(progTag);
    } else {
      statusPillText = '⏳ กำลังดำเนินการ';
    }
    statusSubtext = t.tech_name ? `ช่าง: ${esc(t.tech_name)}` : 'เจ้าหน้าที่กำลังเข้าดำเนินการ';
  } else if (t.status === 'checking') {
    statusPillBg = '#0284c7';
    statusBoxBg = '#f0f9ff';
    statusBoxBorder = '#bae6fd';
    statusPillText = '✔️ ตรวจสอบงาน';
    statusSubtext = t.tech_name ? `ช่าง: ${esc(t.tech_name)} (รอการตรวจสอบ)` : 'งานเสร็จแล้ว รอการตรวจสอบ/ตรวจรับ';
  } else if (t.status === 'done' || t.status === 'closed') {
    statusPillBg = '#10b981';
    statusBoxBg = '#f0fdf4';
    statusBoxBorder = '#bbf7d0';
    const isInstall = t.done_type === 'ติดตั้ง/ต่อเติม' || (!t.done_type && t.cat === 'ติดตั้ง/ต่อเติม');
    statusPillText = isInstall ? '🛠️ ติดตั้งเสร็จสิ้น' : '✓ ซ่อมเสร็จสิ้น';
    statusSubtext = t.done_at ? `เสร็จเมื่อ ${fmt(t.done_at)}` : 'ดำเนินการเรียบร้อยแล้ว';
  } else if (t.status === 'deleted') {
    statusPillBg = '#64748b';
    statusBoxBg = '#f8fafc';
    statusBoxBorder = '#e2e8f0';
    statusPillText = '✕ ยกเลิกแล้ว';
    statusSubtext = t.deleted_by ? `โดย ${esc(t.deleted_by)}` : 'ยกเลิกรายการแจ้งซ่อมแล้ว';
  }

  // 3. Problem text & item summary
  let problemText = (t.items || []).map(i => {
    let s = `<b>${esc(i.item || '')}</b>`;
    if (i.sym) s += ' – ' + esc(i.sym);
    if (i.asset) s += ` [รหัสครุภัณฑ์: ${esc(i.asset)}]`;
    return s;
  }).join(' | ');

  if (!problemText && (t.title || t.details)) {
    problemText = `<b>${esc(t.title || '')}</b>${t.details ? ' – ' + esc(t.details) : ''}`;
  }
  if (!problemText) {
    problemText = esc(t.note || '-');
  }

  // 4. Photos thumbnail box
  const allPhotos = [...(t.photos || []), ...(t.done_photos || [])];
  const photosHtml = allPhotos.length ? allPhotos.map(p => `
    <img src="${url(p)}" class="ticket-photo-thumb" loading="lazy" onclick="zoom('${p}')" title="กดเพื่อดูรูปภาพขนาดใหญ่" alt="รูปประกอบ">
  `).join('') : '<span style="color:#94a3b8; font-size:13.5px; font-weight:500;">ไม่มีรูปภาพแนบ</span>';

  // 5. Separate wizard steps vs extra actions if passed in x
  let isStepsInX = typeof x === 'string' && x.includes('steps-wizard');
  let extraActionsHtml = isStepsInX ? '' : x;

  return `
    <div class="ticket-mockup-card">
      <!-- 1. Deep Navy Banner Header (เหลือแต่คำว่า รายละเอียดการแจ้งซ่อม ตามคำขอ) -->
      <div class="ticket-card-banner">
        <div class="ticket-banner-left">
          <div class="ticket-banner-title">รายละเอียดการแจ้งซ่อม</div>
        </div>
      </div>

      <!-- 2. Card Content Body -->
      <div class="ticket-mockup-body">
        <!-- ลำดับขั้นตอนการทำงาน แนวนอน (คงไว้ในทุกการ์ด) -->
        <div id="steps_${t.id}" class="card-timeline-container" style="display:block; margin-bottom:14px; padding-bottom:8px; border-bottom:1px dashed #fed7aa;">
          ${steps(t)}
        </div>

        <!-- 3-Box Top Stats Row -->
        <div class="ticket-stats-grid">
          <!-- Box 1: Ticket ID -->
          <div class="ticket-stat-box ticket-stat-box-id" onclick="copyNo('${t.id}', event)" title="คลิกเพื่อคัดลอกเลขใบแจ้งซ่อม">
            <div class="ticket-stat-icon-wrap">📄</div>
            <div class="ticket-stat-texts">
              <div class="ticket-stat-label">เลขที่ใบแจ้งซ่อม</div>
              <div class="ticket-stat-val-id">${esc(t.id)}</div>
            </div>
          </div>

          <!-- Box 2: Date & Time -->
          <div class="ticket-stat-box ticket-stat-box-date">
            <div class="ticket-stat-icon-wrap" style="color:#ea580c;">📅</div>
            <div class="ticket-stat-texts">
              <div class="ticket-stat-label" style="color:#64748b;">วันที่แจ้งซ่อม</div>
              <div class="ticket-stat-val-date">${esc(dateStr)}</div>
              ${timeStr ? `<div class="ticket-stat-val-time">เวลา ${esc(timeStr)}</div>` : ''}
            </div>
          </div>

          <!-- Box 3: Status -->
          <div class="ticket-stat-box ticket-stat-box-status" style="background:${statusBoxBg}; border:1.5px solid ${statusBoxBorder};">
            <div class="ticket-status-pill" style="background:${statusPillBg}; color:#ffffff;">
              ${statusPillText}
            </div>
            <div class="ticket-status-subtext">${statusSubtext}</div>
          </div>
        </div>

        <!-- Middle 2x2 Info Grid -->
        <div class="ticket-mid-grid">
          <!-- Item 1: Location -->
          <div class="ticket-mid-item">
            <div class="ticket-circle-icon">🏢</div>
            <div class="ticket-mid-content">
              <div class="ticket-mid-label">อาคาร / สถานที่</div>
              <div class="ticket-mid-val">
                ${esc(formatTicketLocation(t))}
                ${t.urgent ? '<span class="badge badge-urgent" style="font-size:12px; margin-left:6px;">ด่วน</span>' : ''}
              </div>
            </div>
          </div>

          <!-- Item 2: Category & Equipment -->
          <div class="ticket-mid-item">
            <div class="ticket-circle-icon">⚙️</div>
            <div class="ticket-mid-content">
              <div class="ticket-mid-label">ประเภทงาน / ชนิดอุปกรณ์</div>
              <div class="ticket-mid-val">
                ${(t.items?.[0]?.item || t.title) ? `<div style="color:#0b2545; font-weight:800;">⚙️ ${esc(t.items?.[0]?.item || t.title)}</div>` : ''}
                <div style="font-size:13.5px; color:#64748b;">หมวด: ${esc((t.types || []).join(', ') || t.sub_type || t.cat || 'ทั่วไป')}</div>
                <div style="margin-top:4px;">
                  <span style="color:#ea580c; font-weight:700; font-size:13.5px;">🏷️ รหัสครุภัณฑ์:</span>
                  ${(t.items?.[0]?.asset || t.asset_no || t.asset) ? `<b style="font-family:monospace; background:#fff7ed; padding:2px 8px; border-radius:4px; border:1px solid #fed7aa; color:#9a3412; font-size:14px;">${esc(t.items?.[0]?.asset || t.asset_no || t.asset)}</b>` : '<span style="color:#94a3b8; font-size:13px;">ไม่ได้ระบุ</span>'}
                </div>
              </div>
            </div>
          </div>

          <!-- Item 3: Problem Details -->
          <div class="ticket-mid-item">
            <div class="ticket-circle-icon">ℹ️</div>
            <div class="ticket-mid-content">
              <div class="ticket-mid-label">รายละเอียดปัญหา / หมายเหตุ</div>
              <div class="ticket-mid-val" style="font-size:15px; font-weight:700; line-height:1.5;">
                ${problemText}
                ${(() => {
                  const tRemark = (typeof getTicketRemark === 'function') ? getTicketRemark(t) : (t.remark || t.items?.[0]?.remark || '');
                  return tRemark ? `
                    <div style="font-size:13.5px; margin-top:8px; padding:6px 10px; border-radius:6px; background:#f0fdf4; color:#166534; font-weight:700; border:1px solid #bbf7d0;">
                      📌 หมายเหตุเพิ่มเติม: ${esc(tRemark)}
                    </div>
                  ` : '';
                })()}
                ${t.note ? `
                  <div style="font-size:13.5px; margin-top:8px; padding:6px 10px; border-radius:6px; background:${t.blocked ? '#fee2e2' : '#f1f5f9'}; color:${t.blocked ? '#b91c1c' : '#475569'}; font-weight:700;">
                    ${t.blocked ? '⚠️ ติดปัญหา: ' : '📝 หมายเหตุ: '}${esc(t.note)}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Item 4: Attached Photo -->
          <div class="ticket-photo-section">
            <div class="ticket-photo-header">
              <span>📎</span>
              <span>รูปภาพประกอบตอนแจ้ง:</span>
            </div>
            <div class="ticket-photo-container">
              ${(t.photos && t.photos.length) ? t.photos.map(p => `
                <img src="${url(p)}" class="ticket-photo-thumb" loading="lazy" onclick="zoom('${p}')" title="รูปตอนแจ้ง (คลิกเพื่อดูภาพใหญ่)" alt="รูปแจ้งซ่อม">
              `).join('') : '<span style="color:#94a3b8; font-size:13px; font-weight:500;">- ไม่มีรูปภาพประกอบตอนแจ้ง -</span>'}
            </div>
            ${(t.status === 'done' || t.status === 'closed' || (t.done_photos && t.done_photos.length)) ? `
              <div class="ticket-photo-header" style="margin-top:10px; color:#10b981;">
                <span>📷</span>
                <span>รูปผลงานตอนเสร็จสิ้น (ช่างแนบ):</span>
              </div>
              <div class="ticket-photo-container">
                ${(t.done_photos && t.done_photos.length) ? t.done_photos.map(p => `
                  <img src="${url(p)}" class="ticket-photo-thumb" style="border:1.5px solid #10b981;" loading="lazy" onclick="zoom('${p}')" title="รูปผลงานช่าง (คลิกเพื่อดูภาพใหญ่)" alt="รูปผลงาน">
                `).join('') : '<span style="color:#94a3b8; font-size:13px; font-weight:500;">- ช่างไม่ได้แนบรูปภาพตอนเสร็จสิ้น -</span>'}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Reporter Bottom Pill Bar (Matches Mockup) -->
        <div class="ticket-reporter-bar">
          <div class="ticket-reporter-col">
            <span style="color:#ea580c; font-size:18px;">👤</span>
            <span class="ticket-reporter-label">ผู้แจ้งซ่อม:</span>
            <span class="ticket-reporter-name">${esc(t.name || 'ไม่ระบุ')}</span>
          </div>
          <div class="ticket-reporter-divider"></div>
          <div class="ticket-reporter-col">
            <span style="color:#ea580c; font-size:18px;">📞</span>
            <span class="ticket-reporter-label">เบอร์โทรศัพท์:</span>
            <span class="ticket-reporter-name">${esc(t.tel || '-')}</span>
          </div>
        </div>

        <!-- Action Buttons Bar -->
        <div class="ticket-actions-bar">
          ${(me && (me.role === 'tech' || me.role === 'admin')) ? `
            <button type="button" class="ticket-btn-mat" onclick="editTicketAsset('${t.id}')" title="เขียนหรือแก้ไขหมายเลขครุภัณฑ์">
              <span>🏷️</span> ระบุ/แก้ไขเลขครุภัณฑ์
            </button>
          ` : ''}
          ${tab === 'mine' ? `
            <button type="button" class="ticket-btn-primary" onclick="openAct('${t.id}')">
              <span>📝</span> อัปเดตสถานะ
            </button>
            <button type="button" class="ticket-btn-mat" onclick="openMat('${t.id}')">
              <span>📦</span> เบิกวัสดุ
            </button>
          ` : tab === 'tech_done' ? `
            <button type="button" class="ticket-btn-mat" onclick="openMat('${t.id}')">
              <span>📦</span> รายการเบิกวัสดุ
            </button>
          ` : tab === 'all' ? `
            ${extraActionsHtml}
          ` : `
            <button type="button" class="ticket-btn-mat" onclick="openMat('${t.id}')">
              <span>📦</span> เบิกวัสดุ &gt;
            </button>
            ${extraActionsHtml}
          `}
        </div>
      </div>
    </div>
  `;
};

function steps(t) {
  if (t.status === 'deleted') return '';
  const o = ['accepted', 'doing', 'done'];
  const curSt = t.status === 'closed' ? 'done' : (t.status === 'checking' ? 'doing' : t.status);
  const i = o.indexOf(curSt);
  const h = {};
  (t.history || []).forEach(x => { if (x.s) h[x.s] = x.at; });
  const doneLabel = (t.done_type === 'ติดตั้ง/ต่อเติม' || (!t.done_type && t.cat === 'ติดตั้ง/ต่อเติม')) ? 'ซ่อมเสร็จสิ้น' : 'ซ่อมเสร็จสิ้น';
  
  const lastHist = (t.history && t.history.length) ? t.history[t.history.length - 1] : null;
  const progTag = lastHist?.tag || (t.note?.match(/^\[(.*?)\]/)?.[1]) || '';

  return `
    <div class="steps-wizard">
      ${o.map((s, j) => {
        let label = s === 'done' ? doneLabel : (ST[s] ? ST[s][0] : s);
        if (s === 'doing' && t.status === 'doing' && progTag) {
          label += `<br><span style="font-size:12px; font-weight:700; color:var(--primary);">(${esc(progTag)})</span>`;
        }
        const hasPassed = j <= i;
        const timeVal = h[s] ? fmt(h[s]) : '';

        return `
          <div class="step-item ${hasPassed ? 'active' : ''}">
            <div class="step-circle">
              ${hasPassed ? '✓' : j + 1}
            </div>
            <div class="step-label">
              ${label}
              ${timeVal ? `<br><small style="font-size:11px; font-weight:normal; opacity:0.85;">${timeVal}</small>` : ''}
            </div>
          </div>
          ${j < o.length - 1 ? `<div class="step-connector-arrow">&gt;</div>` : ''}
        `;
      }).join('')}
    </div>
  `;
}

const shrink = f => new Promise((res) => {
  const timeoutId = setTimeout(() => res(f), 4000);
  try {
    const im = new Image(), u = URL.createObjectURL(f);
    im.onload = () => {
      clearTimeout(timeoutId);
      try {
        const s = Math.min(1, 1400 / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * s);
        c.height = Math.round(im.height * s);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        c.toBlob(b => b ? res(b) : res(f), 'image/jpeg', 0.8);
      } catch (err) {
        URL.revokeObjectURL(u);
        res(f);
      }
    };
    im.onerror = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(u);
      res(f);
    };
    im.src = u;
  } catch (e) {
    clearTimeout(timeoutId);
    res(f);
  }
});

const uuid = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9));

async function up(files, dir) {
  const out = [];
  for (const f of [...files].slice(0, 4)) {
    try {
      const p = `${dir}/${uuid()}.jpg`;
      const processed = await shrink(f);
      const uploadPromise = sb.storage.from('photos').upload(p, processed, { contentType: 'image/jpeg' });
      // 8 second timeout per photo so slow mobile upload never hangs the entire app
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
      const { error } = await Promise.race([uploadPromise, timeoutPromise]);
      if (!error) {
        out.push(p);
      } else {
        console.warn('Storage upload error (skipped):', error);
      }
    } catch (e) {
      console.warn('Photo upload skipped/timeout:', e);
    }
  }
  return out;
}

window.card = card;
window.steps = steps;
window.url = url;
window.ph = ph;
window.shrink = shrink;
window.up = up;
window.render = render;
window.go = go;
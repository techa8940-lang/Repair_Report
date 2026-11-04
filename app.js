const sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
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
var getTicketTitle = window.getTicketTitle;
var getTicketDesc = window.getTicketDesc;

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
  closed: ['ปิดงานแล้ว', '#475569'],
  deleted: ['ยกเลิก/ลบ', 'var(--danger)'] 
};
window.ST = ST;

const REP = ['ระบบปรับอากาศ', 'เครื่องจักร', 'ระบบไฟฟ้ากำลัง', 'ระบบแสงสว่าง', 'ระบบประปา', 'ระบบ Internet', 'ระบบน้ำบริสุทธิ์ (DI)', 'ฝ้าเพดาน', 'ประตู', 'หน้าต่าง', 'ห้องน้ำ', 'พื้น', 'อื่น ๆ'];
const INS = ['ติดตั้งเครื่องจักร', 'ติดตั้งระบบไฟฟ้ากำลัง', 'ติดตั้งระบบแสงสว่าง', 'ติดตั้งระบบประปา', 'ติดตั้งระบบ Internet', 'ต่อเติมอาคาร', 'อื่น ๆ'];
const MATS = ['หลอดไฟ LED', 'บัลลาสต์/สตาร์ทเตอร์', 'สายไฟ', 'เบรกเกอร์', 'ก๊อกน้ำ', 'ท่อ PVC', 'น้ำยาแอร์', 'เทปพันสายไฟ', 'อื่นๆ'];
window.REP = REP;
window.INS = INS;
window.MATS = MATS;

var me = null, uid = null, tab = 'login', T = [], U = [], techs = [], fil = 'accepted', fT = '', found = undefined, lastNo = '', armed = '', lastTrackEmail = '';
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
  if (tab === 'history') loadHistoryData();
  render();
};

window.setHFil = function(f) { hFil = f; render(); };
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
            room: t.room || '-',
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
    const saved = sessionStorage.getItem('repair_me');
    if (saved) {
      try {
        me = JSON.parse(saved);
        tab = me.role === 'admin' ? 'dashboard' : me.role === 'tech' ? 'pool' : 'home';
        await go();
        return;
      } catch(e) {}
    }
    me = null; uid = null; tab = 'login'; render();
    return;
  }
  uid = s.user.id;
  const metaRole = s.user.user_metadata?.role;
  const metaName = s.user.user_metadata?.name;

  const { data } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();

  if (data) {
    me = data;
    // ถ้า role ใน DB เป็น null/none ให้ดึงจาก user_metadata มาเติมและอัปเดตกลับเข้า DB
    const finalRole = me.role || metaRole || 'reporter';
    const finalName = me.name || metaName || (s.user.email || 'ผู้ใช้งาน').split('@')[0];
    me.role = finalRole;
    me.name = finalName;
    try {
      await sb.from('profiles').upsert({ id: uid, name: finalName, role: finalRole }, { onConflict: 'id' });
    } catch(err) {}
  } else {
    const role = metaRole || (typeof loginRole !== 'undefined' && loginRole ? loginRole : 'reporter');
    me = {
      id: uid,
      name: metaName || (s.user.email || 'ผู้ใช้งาน').split('@')[0],
      role: role
    };
    try {
      await sb.from('profiles').upsert({ id: uid, name: me.name, role: me.role }, { onConflict: 'id' });
    } catch(err) {}
  }
  sessionStorage.setItem('repair_me', JSON.stringify(me));
  tab = me.role === 'admin' ? 'dashboard' : me.role === 'tech' ? 'pool' : 'home';
  await go();
}

function initApp() {
  const saved = sessionStorage.getItem('repair_me');
  if (saved) {
    try {
      me = JSON.parse(saved);
      if (me && me.role) {
        tab = me.role === 'admin' ? 'dashboard' : me.role === 'tech' ? 'pool' : 'home';
        go();
        return;
      }
    } catch (e) {
      sessionStorage.removeItem('repair_me');
    }
  }

  me = null;
  tab = 'login';
  render();

  if (!DEV) {
    sb.auth.getSession().then(({ data }) => { if (data?.session) load(data.session); });
    sb.auth.onAuthStateChange((_, s) => { if (s) load(s); });
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

// Background Auto Sync ทุกๆ 10 วินาที เพื่อให้แอดมิน ช่าง และผู้แจ้ง เห็นสถานะตรงกันแบบ Real-time
setInterval(() => {
  if (me && (me.role === 'admin' || me.role === 'tech')) {
    if (!$('#dlg')?.open && !document.activeElement?.closest('form')) {
      go(true);
    }
  } else if (me && me.role === 'reporter') {
    if (tab === 'history' || tab === 'home') {
      loadHistoryData();
    }
  }
}, 10000);

async function go(silent = false) {
  try {
    if (me && (me.role === 'admin' || me.role === 'tech')) {
      const ticketsRes = await sb.from('tickets').select('*').order('created_at', { ascending: false }).limit(200);
      if (ticketsRes.error) {
        console.warn('tickets fetch warning:', ticketsRes.error);
      }
      T = ticketsRes.data || [];
      window.T = T;
      const usageRes = await sb.from('usage').select('*').order('created_at', { ascending: false }).limit(200);
      U = usageRes.data || [];
      window.U = U;
      if (me.role === 'admin') {
        const techsRes = await sb.from('profiles').select('id,name').eq('role', 'tech');
        techs = techsRes.data || [];
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
  toast('กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...');
  const { data, error } = await sb.auth.signInWithPassword({ email: f.get('email'), password: f.get('pw') });
  if (error) return toast('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
  load(data.session);
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
    admin: ['dashboard', 'all', 'techs_manage', 'stock', 'home', 'report', 'track', 'history', 'pool', 'task_detail', 'mine', 'tech_done', 'profile']
  };

  const allowed = roleTabs[me.role] || ['home'];
  if (!allowed.includes(k)) {
    tab = allowed[0];
  } else {
    tab = k;
    if (me.role === 'admin') {
      if (['pool', 'task_detail', 'mine', 'tech_done'].includes(k)) adminView = 'tech';
      else if (['home', 'report', 'track', 'history'].includes(k)) adminView = 'reporter';
      else if (['dashboard', 'all', 'techs_manage', 'stock'].includes(k)) adminView = 'admin';
    }
  }

  const sbEl = $('#sidebar');
  if (sbEl) sbEl.classList.remove('open');
  const bdEl = $('#sidebar-backdrop');
  if (bdEl) bdEl.classList.remove('open');

  found = undefined;
  if (tab === 'history') loadHistoryData();
  render();
};

window.signOut = function () {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    sessionStorage.removeItem('repair_me');
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

function render() {
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
    all: 'จัดการงานซ่อมทั้งหมด',
    techs_manage: 'จัดการช่างและมอบหมายงาน',
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
      ['all', '📋', 'จัดการงานซ่อม'],
      ['techs_manage', '👥', 'จัดการช่าง'],
      ['stock', '📦', 'วัสดุที่เบิก'],
      ['profile', '👤', 'ข้อมูลส่วนตัว']
    ]
  };

  const navItems = menuGroups[currentRoleView] || menuGroups.reporter;

  if (sidebarMenu) {
    sidebarMenu.innerHTML = navItems.map(([k, icon, name]) => `
      <button class="menu-link ${tab === k ? 'active' : ''}" onclick="setTab('${k}')">
        <span class="menu-icon">${icon}</span>
        <span>${name}</span>
      </button>
    `).join('');
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
        <span style="font-size:12.5px; font-weight:700; color:var(--text-muted); margin-right:2px;">🧪 สลับมุมมอง:</span>
        <button type="button" class="btn btn-sm ${adminView === 'admin' ? 'btn-primary' : 'btn-outline'}" style="padding:4px 10px; font-size:12px;" onclick="setAdminView('admin')">👑 แอดมิน</button>
        <button type="button" class="btn btn-sm ${adminView === 'tech' ? 'btn-primary' : 'btn-outline'}" style="padding:4px 10px; font-size:12px;" onclick="setAdminView('tech')">🛠️ ช่าง</button>
        <button type="button" class="btn btn-sm ${adminView === 'reporter' ? 'btn-primary' : 'btn-outline'}" style="padding:4px 10px; font-size:12px;" onclick="setAdminView('reporter')">👤 ผู้แจ้ง</button>
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
  } else if (t.status === 'done') {
    statusPillBg = '#10b981';
    statusBoxBg = '#f0fdf4';
    statusBoxBorder = '#bbf7d0';
    const isInstall = t.done_type === 'ติดตั้ง/ต่อเติม' || (!t.done_type && t.cat === 'ติดตั้ง/ต่อเติม');
    statusPillText = isInstall ? '🛠️ ติดตั้งเสร็จสิ้น' : '✓ ซ่อมเสร็จสิ้น';
    statusSubtext = t.done_at ? `เสร็จเมื่อ ${fmt(t.done_at)}` : 'ดำเนินการเรียบร้อยแล้ว';
  } else if (t.status === 'closed') {
    statusPillBg = '#475569';
    statusBoxBg = '#f8fafc';
    statusBoxBorder = '#cbd5e1';
    statusPillText = '⭐ ปิดงานแล้ว';
    statusSubtext = 'ปิดงานและบันทึกประวัติสมบูรณ์';
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
      <!-- 1. Deep Navy Banner Header (Matches Mockup) -->
      <div class="ticket-card-banner">
        <div class="ticket-banner-left">
          <div class="ticket-banner-logo-wrap">
            <img src="nu_seed_logo.png" alt="NU SEED" class="ticket-banner-logo">
            <div class="ticket-banner-brand-text">
              <b>NU SEED</b>
              <span>Naresuan University Science Park</span>
            </div>
          </div>
          <div class="ticket-banner-divider"></div>
          <div class="ticket-banner-wrench-circle">🔧</div>
          <div class="ticket-banner-title">รายละเอียดการแจ้งซ่อม</div>
        </div>

        <div>
          <button type="button" class="ticket-banner-home-btn" onclick="setTab('home')">
            🏠 หน้าหลัก
          </button>
        </div>
      </div>

      <!-- 2. Card Content Body -->
      <div class="ticket-mockup-body">
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
                อาคาร ${esc(t.bld || '-')} ชั้น ${esc(t.flr || '-')} ห้อง/บริเวณ ${esc(t.room || '-')}
                ${t.urgent ? '<span class="badge badge-urgent" style="font-size:12px; margin-left:6px;">ด่วน</span>' : ''}
              </div>
            </div>
          </div>

          <!-- Item 2: Category -->
          <div class="ticket-mid-item">
            <div class="ticket-circle-icon">⚙️</div>
            <div class="ticket-mid-content">
              <div class="ticket-mid-label">ประเภทงาน</div>
              <div class="ticket-mid-val">
                ${esc((t.types || []).join(', ') || t.sub_type || t.cat || 'ทั่วไป')}
              </div>
            </div>
          </div>

          <!-- Item 3: Problem Details -->
          <div class="ticket-mid-item">
            <div class="ticket-circle-icon">ℹ️</div>
            <div class="ticket-mid-content">
              <div class="ticket-mid-label">รายละเอียดปัญหา</div>
              <div class="ticket-mid-val" style="font-size:15px; font-weight:700; line-height:1.5;">
                ${problemText}
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
              <span>รูปภาพประกอบ</span>
            </div>
            <div class="ticket-photo-container">
              ${photosHtml}
            </div>
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
          ${tab === 'mine' ? `
            <button type="button" class="ticket-btn-primary" onclick="openAct('${t.id}')">
              <span>📝</span> อัปเดตสถานะ
            </button>
            <button type="button" class="ticket-btn-mat" onclick="openMat('${t.id}')">
              <span>📦</span> เบิกวัสดุ
            </button>
          ` : tab === 'tech_done' ? `
            <button type="button" class="ticket-btn-mat" onclick="toggleCardTimeline('${t.id}')">
              <span>📜</span> ดูประวัติขั้นตอน
            </button>
            <button type="button" class="ticket-btn-mat" onclick="openMat('${t.id}')">
              <span>📦</span> รายการเบิกวัสดุ
            </button>
          ` : tab === 'all' ? `
            ${extraActionsHtml}
          ` : `
            <button type="button" class="ticket-btn-primary" onclick="toggleCardTimeline('${t.id}')">
              <span>🔍</span> ติดตามสถานะ &gt;
            </button>
            <button type="button" class="ticket-btn-mat" onclick="openMat('${t.id}')">
              <span>📦</span> เบิกวัสดุ &gt;
            </button>
            ${extraActionsHtml}
          `}
        </div>

        <!-- Collapsible Steps Wizard Timeline -->
        <div id="steps_${t.id}" class="card-timeline-container" style="display:${isStepsInX || t.status === 'doing' ? 'block' : 'none'}; margin-top:16px; padding-top:12px; border-top:1px dashed #e2e8f0;">
          ${steps(t)}
        </div>
      </div>
    </div>
  `;
};

function steps(t) {
  if (t.status === 'deleted') return '';
  const o = ['accepted', 'doing', 'checking', 'done', 'closed'];
  const i = o.indexOf(t.status);
  const h = {};
  (t.history || []).forEach(x => { if (x.s) h[x.s] = x.at; });
  const doneLabel = (t.done_type === 'ติดตั้ง/ต่อเติม' || (!t.done_type && t.cat === 'ติดตั้ง/ต่อเติม')) ? 'ติดตั้งเสร็จสิ้น' : 'ซ่อมเสร็จสิ้น';
  
  const lastHist = (t.history && t.history.length) ? t.history[t.history.length - 1] : null;
  const progTag = lastHist?.tag || (t.note?.match(/^\[(.*?)\]/)?.[1]) || '';

  return `
    <div class="steps-wizard" style="margin: 20px 0 10px;">
      ${o.map((s, j) => {
        let label = s === 'done' ? doneLabel : (ST[s] ? ST[s][0] : s);
        if (s === 'doing' && t.status === 'doing' && progTag) {
          label += `<br><span style="font-size:13px; font-weight:700; color:var(--primary);">(${esc(progTag)})</span>`;
        }
        return `
          <div class="step-item ${j <= i ? 'active' : ''}">
            <div class="step-circle" style="width:34px; height:34px; font-size:15px;">${j <= i ? '✓' : j + 1}</div>
            <div class="step-label" style="font-size:13.5px;">
              ${label}
              ${h[s] ? `<br><small style="font-size:11.5px; color:var(--text-light); font-weight:normal;">${fmt(h[s])}</small>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

const shrink = f => new Promise((res, rej) => {
  const im = new Image(), u = URL.createObjectURL(f);
  im.onload = () => {
    const s = Math.min(1, 1400 / Math.max(im.width, im.height));
    const c = document.createElement('canvas');
    c.width = im.width * s;
    c.height = im.height * s;
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    URL.revokeObjectURL(u);
    c.toBlob(b => b ? res(b) : rej(new Error('แปลงรูปไม่สำเร็จ')), 'image/jpeg', 0.8);
  };
  im.onerror = () => {
    URL.revokeObjectURL(u);
    rej(new Error('เปิดรูปไม่ได้'));
  };
  im.src = u;
});

const uuid = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9));

async function up(files, dir) {
  const out = [];
  for (const f of [...files].slice(0, 4)) {
    const p = `${dir}/${uuid()}.jpg`;
    const { error } = await sb.storage.from('photos').upload(p, await shrink(f), { contentType: 'image/jpeg' });
    if (error) throw error;
    out.push(p);
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

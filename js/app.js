/* ==========================================================================
   KKN Gebangsari 33 - Main Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  renderHeroAndStats();
  renderTentangKami();
  renderStruktural();
  
  // Sinkronkan data dari localStorage (dari Admin) + data.js
  syncLocalData();

  renderProja('Semua');
  renderBerita();
  renderGaleri('Semua');
  renderLokasi();
  renderContactPerson();
  initModals();
  initFormContact();
});

function getLocalItems(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) { return []; }
}

function syncLocalData() {
  const localBerita = getLocalItems('kkn_berita');
  const localProker = getLocalItems('kkn_proker');
  const localGaleri = getLocalItems('kkn_galeri');

  if (localBerita.length > 0) KKN_DATA.berita = localBerita;
  if (localProker.length > 0) KKN_DATA.proja = localProker;
  if (localGaleri.length > 0) KKN_DATA.galeri = localGaleri;
}

/* Navbar Logic */
function initNavbar() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // Active Link Spy on Scroll
  const sections = document.querySelectorAll('section, header');
  const navItems = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}

/* Render Hero & Stats */
function renderHeroAndStats() {
  const taglineEl = document.getElementById('heroTagline');
  if (taglineEl) taglineEl.textContent = KKN_DATA.info.tagline;

  const statsContainer = document.getElementById('statsContainer');
  if (statsContainer) {
    statsContainer.innerHTML = KKN_DATA.tentang.statistik.map(s => `
      <div class="stat-card">
        <h3>${s.angka}</h3>
        <p>${s.label}</p>
      </div>
    `).join('');
  }
}

/* Render Tentang Kami */
function renderTentangKami() {
  const descEl = document.getElementById('tentangDeskripsi');
  if (descEl) descEl.textContent = KKN_DATA.tentang.deskripsi;

  const visiEl = document.getElementById('tentangVisi');
  if (visiEl) visiEl.textContent = KKN_DATA.tentang.visi;

  const misiListEl = document.getElementById('tentangMisiList');
  if (misiListEl) {
    misiListEl.innerHTML = KKN_DATA.tentang.misi.map(m => `
      <li>
        <i class="fas fa-check-circle"></i>
        <span>${m}</span>
      </li>
    `).join('');
  }
}

/* Render Struktural Tim */
function renderStruktural() {
  const grid = document.getElementById('strukturalGrid');
  if (!grid) return;

  grid.innerHTML = KKN_DATA.struktural.map(m => `
    <div class="member-card">
      <div class="member-img-wrap">
        <img src="${m.foto}" alt="${m.nama}" loading="lazy">
        <span class="member-badge">${m.roleBadge}</span>
      </div>
      <div class="member-info">
        <h4>${m.nama}</h4>
        <div class="member-role">${m.jabatan}</div>
        <div class="member-jurusan">${m.jurusan}</div>
        <div class="member-socials">
          <a href="https://instagram.com/${m.ig}" target="_blank" title="Instagram">
            <i class="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

/* Render Program Kerja with Filter */
function renderProja(categoryFilter = 'Semua') {
  const grid = document.getElementById('projaGrid');
  if (!grid) return;

  syncLocalData();
  let filtered = KKN_DATA.proja;
  if (categoryFilter !== 'Semua') {
    filtered = KKN_DATA.proja.filter(p => p.kategori === categoryFilter);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem 1rem; color: #64748b; background:#fff; border-radius:16px; border:1px solid #e2e8f0;">
      <i class="fas fa-tasks" style="font-size:2.5rem; margin-bottom:0.75rem; color:#94a3b8; display:block;"></i>
      <h4 style="color:#1e293b; margin-bottom:0.25rem;">Belum Ada Program Kerja</h4>
      <p style="font-size:0.9rem;">Program kerja akan segera diupdate melalui Admin Dashboard.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="proja-card">
      <img src="${p.gambar || 'images/pendidikan.jpg'}" alt="${p.judul}" class="proja-img" loading="lazy">
      <div class="proja-body">
        <div class="proja-meta">
          <span class="proja-category">${p.kategori}</span>
          <span class="badge-status ${p.badgeClass || 'badge-info'}">${p.status}</span>
        </div>
        <h4 class="proja-title">${p.judul}</h4>
        <p class="proja-summary">${p.ringkasan}</p>
        <div class="proja-footer">
          <span><i class="far fa-calendar-alt"></i> ${p.tanggal}</span>
          <span class="proja-btn" onclick="openProjaModal('${p.id}')">
            Detail <i class="fas fa-arrow-right"></i>
          </span>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('#projaTabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === categoryFilter);
  });
}

window.filterProja = function(category) {
  renderProja(category);
};

/* Render Berita Acara */
function renderBerita(searchQuery = '') {
  const grid = document.getElementById('beritaGrid');
  if (!grid) return;

  syncLocalData();
  let filtered = KKN_DATA.berita;
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = KKN_DATA.berita.filter(b => 
      b.judul.toLowerCase().includes(q) || 
      b.ringkasan.toLowerCase().includes(q) ||
      b.kategori.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem 1rem; color: #64748b; background:#fff; border-radius:16px; border:1px solid #e2e8f0;">
      <i class="far fa-newspaper" style="font-size:2.5rem; margin-bottom:0.75rem; color:#94a3b8; display:block;"></i>
      <h4 style="color:#1e293b; margin-bottom:0.25rem;">Belum Ada Berita Acara</h4>
      <p style="font-size:0.9rem;">Berita kegiatan KKN akan segera diupdate melalui Admin Dashboard.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(b => `
    <div class="berita-card">
      <img src="${b.thumbnail}" alt="${b.judul}" class="berita-thumb" loading="lazy">
      <div class="berita-content">
        <div class="berita-date">
          <span><i class="far fa-calendar"></i> ${b.tanggal}</span>
          <span><i class="far fa-user"></i> ${b.penulis}</span>
        </div>
        <h4 class="berita-title">${b.judul}</h4>
        <p class="berita-excerpt">${b.ringkasan}</p>
        <span class="proja-btn" onclick="openBeritaModal('${b.id}')">
          Baca Selengkapnya <i class="fas fa-arrow-right"></i>
        </span>
      </div>
    </div>
  `).join('');
}

window.onSearchBerita = function(val) {
  renderBerita(val);
};

/* Render Galeri Foto */
function renderGaleri(categoryFilter = 'Semua') {
  const grid = document.getElementById('galeriGrid');
  if (!grid) return;

  syncLocalData();
  let filtered = KKN_DATA.galeri;
  if (categoryFilter !== 'Semua') {
    filtered = KKN_DATA.galeri.filter(g => g.kategori === categoryFilter);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem 1rem; color: #64748b; background:#fff; border-radius:16px; border:1px solid #e2e8f0;">
      <i class="far fa-images" style="font-size:2.5rem; margin-bottom:0.75rem; color:#94a3b8; display:block;"></i>
      <h4 style="color:#1e293b; margin-bottom:0.25rem;">Belum Ada Foto Galeri</h4>
      <p style="font-size:0.9rem;">Foto kegiatan akan segera diupload melalui Admin Dashboard.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map((g) => `
    <div class="galeri-item" onclick="openLightbox('${g.url}', '${g.judul}', '${g.deskripsi || ''}')">
      <img src="${g.url}" alt="${g.judul}" loading="lazy">
      <div class="galeri-overlay">
        <span>${g.kategori}</span>
        <h4>${g.judul}</h4>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('#galeriTabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === categoryFilter);
  });
}

window.filterGaleri = function(category) {
  renderGaleri(category);
};

/* Render Lokasi Posko & Leaflet Map */
function renderLokasi() {
  const infoContainer = document.getElementById('lokasiInfo');
  if (infoContainer) {
    const loc = KKN_DATA.info.lokasiPosko;
    infoContainer.innerHTML = `
      <h3>Posko Utama ${KKN_DATA.info.namaKelompok}</h3>
      <p style="color:#64748b; margin-bottom:1.5rem;">Kunjungi posko kami untuk konsultasi, informasi program kerja, atau silaturahmi warga.</p>
      
      <div class="lokasi-detail-item">
        <i class="fas fa-map-marker-alt"></i>
        <div>
          <h5>Alamat Posko</h5>
          <p>${loc.alamat}</p>
        </div>
      </div>

      <div class="lokasi-detail-item">
        <i class="far fa-clock"></i>
        <div>
          <h5>Jam Piket Posko</h5>
          <p>${loc.jamPiket}</p>
        </div>
      </div>

      <div class="lokasi-detail-item">
        <i class="fas fa-info-circle"></i>
        <div>
          <h5>Catatan</h5>
          <p>${loc.catatan}</p>
        </div>
      </div>

      <a href="${loc.mapsUrl || `https://maps.google.com/?q=${loc.lat},${loc.lng}`}" target="_blank" class="btn btn-primary" style="margin-top:1rem;">
        <i class="fas fa-directions"></i> Buka Petunjuk Rute Google Maps
      </a>
    `;
  }

  // Initialize Leaflet Map
  const mapElement = document.getElementById('map');
  if (mapElement && typeof L !== 'undefined' && !mapElement._leaflet_id) {
    const loc = KKN_DATA.info.lokasiPosko;
    const map = L.map('map').setView([loc.lat, loc.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([loc.lat, loc.lng]).addTo(map)
      .bindPopup(`<b>Posko ${KKN_DATA.info.namaKelompok}</b><br>${loc.alamat}`)
      .openPopup();
  }
}

/* Render Contact Person */
function renderContactPerson() {
  const grid = document.getElementById('cpGrid');
  if (!grid) return;

  grid.innerHTML = KKN_DATA.cp.map(c => `
    <div class="cp-card">
      <div class="cp-icon">
        <i class="fab fa-whatsapp"></i>
      </div>
      <h4>${c.nama}</h4>
      <p>${c.jabatan}</p>
      <a href="https://wa.me/${c.whatsapp}?text=Halo%20${encodeURIComponent(c.nama)},%20saya%20ingin%20bertanya%20seputar%20KKN..." target="_blank" class="btn btn-wa">
        <i class="fab fa-whatsapp"></i> Chat WhatsApp
      </a>
    </div>
  `).join('');
}

/* Modals Handler */
function initModals() {
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('modalClose');

  if (closeBtn && backdrop) {
    closeBtn.addEventListener('click', () => {
      backdrop.classList.remove('active');
    });
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('active');
    });
  }
}

window.openProjaModal = function(id) {
  syncLocalData();
  const item = KKN_DATA.proja.find(p => p.id === id);
  if (!item) return;

  const content = document.getElementById('modalBody');
  if (!content) return;

  content.innerHTML = `
    <span class="section-subtitle">${item.kategori}</span>
    <h2 style="font-size:1.6rem; margin-bottom:1rem; color:#0f172a;">${item.judul}</h2>
    <img src="${item.gambar || 'images/pendidikan.jpg'}" style="width:100%; max-height:260px; object-fit:cover; border-radius:12px; margin-bottom:1.25rem;">
    <p><strong><i class="far fa-calendar-alt"></i> Pelaksanaan:</strong> ${item.tanggal}</p>
    <p><strong><i class="far fa-user"></i> Penanggung Jawab:</strong> ${item.penanggungJawab}</p>
    <p><strong><i class="fas fa-bullseye"></i> Sasaran:</strong> ${item.sasaran || 'Masyarakat Desa Gebangsari'}</p>
    <hr style="margin: 1.25rem 0; border:0; border-top:1px solid #e2e8f0;">
    <h4 style="margin-bottom:0.5rem; color:#0f172a;">Tujuan Program:</h4>
    <p style="color:#64748b; font-size:0.95rem;">${item.tujuan || item.ringkasan}</p>
  `;

  document.getElementById('modalBackdrop').classList.add('active');
};

window.openBeritaModal = function(id) {
  syncLocalData();
  const item = KKN_DATA.berita.find(b => b.id === id);
  if (!item) return;

  const content = document.getElementById('modalBody');
  if (!content) return;

  content.innerHTML = `
    <span class="section-subtitle">${item.kategori}</span>
    <h2 style="font-size:1.5rem; margin-bottom:0.75rem; color:#0f172a;">${item.judul}</h2>
    <div style="font-size:0.85rem; color:#64748b; margin-bottom:1rem;">
      <span><i class="far fa-calendar"></i> ${item.tanggal}</span> &bull; 
      <span><i class="far fa-user"></i> ${item.penulis}</span>
    </div>
    <img src="${item.thumbnail}" style="width:100%; max-height:280px; object-fit:cover; border-radius:12px; margin-bottom:1.25rem;">
    <div style="color:#334155; line-height:1.7; white-space: pre-line;">${item.konten}</div>
  `;

  document.getElementById('modalBackdrop').classList.add('active');
};

window.openLightbox = function(url, title, desc) {
  const content = document.getElementById('modalBody');
  if (!content) return;

  content.innerHTML = `
    <h3 style="font-size:1.3rem; margin-bottom:0.75rem; color:#0f172a;">${title}</h3>
    <img src="${url}" style="width:100%; border-radius:12px; margin-bottom:1rem;">
    <p style="color:#64748b; font-size:0.95rem;">${desc}</p>
  `;

  document.getElementById('modalBackdrop').classList.add('active');
};

/* Form Contact Simulation */
function initFormContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('formNama').value;
    const pesan = document.getElementById('formPesan').value;

    const waText = `Halo KKN Kelompok 33, Saya ${nama}.\nPesan: ${pesan}`;
    const waUrl = `https://wa.me/6281999887766?text=${encodeURIComponent(waText)}`;
    
    window.open(waUrl, '_blank');
    form.reset();
  });
}
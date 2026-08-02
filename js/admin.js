/* ==========================================================================
   KKN Gebangsari 33 - Admin Management Script (Offline & Firebase Dual Storage)
   ========================================================================== */

const DEFAULT_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%23e0e0e0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666666' font-size='12'>No Image</text></svg>";

// LocalStorage Helper
function getLocalItems(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) { return []; }
}
function setLocalItems(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn-admin').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  const targetBtn = document.getElementById(`tabBtn-${tabName}`);
  const targetTab = document.getElementById(`tab-${tabName}`);
  
  if (targetBtn) targetBtn.classList.add('active');
  if (targetTab) targetTab.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tabBtn-berita')?.addEventListener('click', () => switchTab('berita'));
  document.getElementById('tabBtn-proker')?.addEventListener('click', () => switchTab('proker'));
  document.getElementById('tabBtn-galeri')?.addEventListener('click', () => switchTab('galeri'));

  loadBerita();
  loadProker();
  loadGaleri();
  initFormHandlers();
});

/* --------------------------------------------------------------------------
   1. BERITA ACARA
   -------------------------------------------------------------------------- */
function loadBerita() {
  const tbody = document.getElementById('tblBeritaBody');
  if (!tbody) return;

  const localList = getLocalItems('kkn_berita');
  tbody.innerHTML = "";

  if (localList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada berita acara. Silakan isi form di sebelah kiri.</td></tr>`;
    return;
  }

  localList.forEach((item) => {
    const imageUrl = item.thumbnail || DEFAULT_PLACEHOLDER;
    tbody.innerHTML += `
      <tr>
        <td><img src="${imageUrl}" class="img-preview-tbl" alt="Preview" onerror="this.src='${DEFAULT_PLACEHOLDER}'"></td>
        <td><strong>${item.judul || '-'}</strong></td>
        <td>${item.kategori || '-'}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="editBerita('${item.id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-sm btn-delete" onclick="hapusBerita('${item.id}')"><i class="fas fa-trash"></i> Hapus</button>
        </td>
      </tr>
    `;
  });
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    if (!file) resolve("");
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function initFormHandlers() {
  // Submit Berita
  const formBerita = document.getElementById('formBerita');
  if (formBerita) {
    formBerita.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnSubmitBerita');
      btn.disabled = true;
      btn.innerText = "Menyimpan Berita...";

      try {
        const id = document.getElementById('bId').value || 'berita_' + Date.now();
        const fileInput = document.getElementById('bFoto');
        const file = fileInput?.files?.[0];
        let fotoUrl = "";

        if (file) {
          fotoUrl = await fileToBase64(file);
        }

        let localList = getLocalItems('kkn_berita');
        const existingIdx = localList.findIndex(b => b.id === id);

        const dataObj = {
          id: id,
          judul: document.getElementById('bJudul').value,
          penulis: document.getElementById('bPenulis').value,
          kategori: document.getElementById('bKategori').value,
          ringkasan: document.getElementById('bRingkasan').value,
          konten: document.getElementById('bKonten').value,
          tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          thumbnail: fotoUrl || (existingIdx >= 0 ? localList[existingIdx].thumbnail : DEFAULT_PLACEHOLDER)
        };

        if (existingIdx >= 0) {
          localList[existingIdx] = dataObj;
        } else {
          localList.unshift(dataObj);
        }

        setLocalItems('kkn_berita', localList);
        alert("Berita Acara berhasil disimpan!");

        resetFormBerita();
        loadBerita();
      } catch (err) {
        alert("Gagal menyimpan berita: " + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = "Simpan Berita";
      }
    });
  }

  // Submit Proker
  const formProker = document.getElementById('formProker');
  if (formProker) {
    formProker.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnSubmitProker');
      btn.disabled = true;
      btn.innerText = "Menyimpan Proker...";

      try {
        const id = document.getElementById('pId').value || 'proja_' + Date.now();
        let localList = getLocalItems('kkn_proker');
        const existingIdx = localList.findIndex(p => p.id === id);

        const statusVal = document.getElementById('pStatus').value;
        let badgeClass = 'badge-info';
        if (statusVal === 'Selesai') badgeClass = 'badge-success';
        if (statusVal === 'Sedang Berjalan') badgeClass = 'badge-warning';

        const dataObj = {
          id: id,
          judul: document.getElementById('pJudul').value,
          kategori: document.getElementById('pKategori').value,
          status: statusVal,
          badgeClass: badgeClass,
          penanggungJawab: document.getElementById('pPJ').value,
          tanggal: document.getElementById('pTanggal').value,
          ringkasan: document.getElementById('pRingkasan').value,
          gambar: 'images/pendidikan.jpg'
        };

        if (existingIdx >= 0) {
          localList[existingIdx] = dataObj;
        } else {
          localList.unshift(dataObj);
        }

        setLocalItems('kkn_proker', localList);
        alert("Program Kerja berhasil disimpan!");

        resetFormProker();
        loadProker();
      } catch (err) {
        alert("Gagal menyimpan proker: " + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = "Simpan Proker";
      }
    });
  }

  // Submit Galeri
  const formGaleri = document.getElementById('formGaleri');
  if (formGaleri) {
    formGaleri.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnSubmitGaleri');
      btn.disabled = true;
      btn.innerText = "Mengupload Foto...";

      try {
        const fileInput = document.getElementById('gFoto');
        const file = fileInput?.files?.[0];
        let fotoUrl = "";

        if (file) {
          fotoUrl = await fileToBase64(file);
        }

        if (!fotoUrl) {
          alert("Silakan pilih file foto terlebih dahulu.");
          return;
        }

        let localList = getLocalItems('kkn_galeri');
        const dataObj = {
          id: 'galeri_' + Date.now(),
          judul: document.getElementById('gJudul').value,
          kategori: document.getElementById('gKategori').value,
          deskripsi: document.getElementById('gDeskripsi').value,
          url: fotoUrl
        };

        localList.unshift(dataObj);
        setLocalItems('kkn_galeri', localList);
        alert("Foto Galeri berhasil diupload!");

        formGaleri.reset();
        loadGaleri();
      } catch (err) {
        alert("Gagal upload galeri: " + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = "Upload Foto Galeri";
      }
    });
  }
}

window.editBerita = function(id) {
  const localList = getLocalItems('kkn_berita');
  const item = localList.find(b => b.id === id);
  if (!item) return;

  document.getElementById('bId').value = item.id;
  document.getElementById('bJudul').value = item.judul || "";
  document.getElementById('bPenulis').value = item.penulis || "";
  document.getElementById('bKategori').value = item.kategori || "Kegiatan";
  document.getElementById('bRingkasan').value = item.ringkasan || "";
  document.getElementById('bKonten').value = item.konten || "";
  document.getElementById('titleFormBerita').innerText = "Edit Berita Acara";

  const cancelBtn = document.getElementById('btnCancelBerita');
  if (cancelBtn) cancelBtn.style.display = "block";
};

window.resetFormBerita = function() {
  document.getElementById('formBerita')?.reset();
  document.getElementById('bId').value = "";
  document.getElementById('titleFormBerita').innerText = "Tambah Berita Baru";
  const cancelBtn = document.getElementById('btnCancelBerita');
  if (cancelBtn) cancelBtn.style.display = "none";
};
document.getElementById('btnCancelBerita')?.addEventListener('click', window.resetFormBerita);

window.hapusBerita = function(id) {
  if (confirm("Hapus berita ini?")) {
    let localList = getLocalItems('kkn_berita').filter(b => b.id !== id);
    setLocalItems('kkn_berita', localList);
    loadBerita();
  }
};

/* --------------------------------------------------------------------------
   2. PROGRAM KERJA
   -------------------------------------------------------------------------- */
function loadProker() {
  const tbody = document.getElementById('tblProkerBody');
  if (!tbody) return;

  const localList = getLocalItems('kkn_proker');
  tbody.innerHTML = "";

  if (localList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada program kerja. Silakan isi form di sebelah kiri.</td></tr>`;
    return;
  }

  localList.forEach((item) => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${item.judul || '-'}</strong></td>
        <td>${item.kategori || '-'}</td>
        <td><span class="badge-status ${item.badgeClass || 'badge-info'}">${item.status}</span></td>
        <td>
          <button class="btn-sm btn-edit" onclick="editProker('${item.id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-sm btn-delete" onclick="hapusProker('${item.id}')"><i class="fas fa-trash"></i> Hapus</button>
        </td>
      </tr>
    `;
  });
}

window.editProker = function(id) {
  const localList = getLocalItems('kkn_proker');
  const item = localList.find(p => p.id === id);
  if (!item) return;

  document.getElementById('pId').value = item.id;
  document.getElementById('pJudul').value = item.judul || "";
  document.getElementById('pKategori').value = item.kategori || "Pendidikan";
  document.getElementById('pStatus').value = item.status || "Rencana";
  document.getElementById('pPJ').value = item.penanggungJawab || "";
  document.getElementById('pTanggal').value = item.tanggal || "";
  document.getElementById('pRingkasan').value = item.ringkasan || "";
  document.getElementById('titleFormProker').innerText = "Edit Program Kerja";

  const cancelBtn = document.getElementById('btnCancelProker');
  if (cancelBtn) cancelBtn.style.display = "block";
};

window.resetFormProker = function() {
  document.getElementById('formProker')?.reset();
  document.getElementById('pId').value = "";
  document.getElementById('titleFormProker').innerText = "Tambah Proker Baru";
  const cancelBtn = document.getElementById('btnCancelProker');
  if (cancelBtn) cancelBtn.style.display = "none";
};
document.getElementById('btnCancelProker')?.addEventListener('click', window.resetFormProker);

window.hapusProker = function(id) {
  if (confirm("Hapus proker ini?")) {
    let localList = getLocalItems('kkn_proker').filter(p => p.id !== id);
    setLocalItems('kkn_proker', localList);
    loadProker();
  }
};

/* --------------------------------------------------------------------------
   3. GALERI FOTO
   -------------------------------------------------------------------------- */
function loadGaleri() {
  const tbody = document.getElementById('tblGaleriBody');
  if (!tbody) return;

  const localList = getLocalItems('kkn_galeri');
  tbody.innerHTML = "";

  if (localList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada foto galeri. Silakan upload di sebelah kiri.</td></tr>`;
    return;
  }

  localList.forEach((item) => {
    tbody.innerHTML += `
      <tr>
        <td><img src="${item.url}" class="img-preview-tbl" alt="Preview" onerror="this.src='${DEFAULT_PLACEHOLDER}'"></td>
        <td><strong>${item.judul || '-'}</strong></td>
        <td>${item.kategori || '-'}</td>
        <td>
          <button class="btn-sm btn-delete" onclick="hapusGaleri('${item.id}')"><i class="fas fa-trash"></i> Hapus</button>
        </td>
      </tr>
    `;
  });
}

window.hapusGaleri = function(id) {
  if (confirm("Hapus foto galeri ini?")) {
    let localList = getLocalItems('kkn_galeri').filter(g => g.id !== id);
    setLocalItems('kkn_galeri', localList);
    loadGaleri();
  }
};
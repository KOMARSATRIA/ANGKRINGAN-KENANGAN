// 1. DATABASE DATA MENU
const daftarMenu = [
    // MINUMAN
    { id: 1, nama: "Es kopi", harga: 5000, kategori: "minuman", tersedia: true },
    { id: 2, nama: "kopi panas", harga: 4000, kategori: "minuman", tersedia: true },
    { id: 3, nama: "Nutrisari", harga: 3000, kategori: "minuman", tersedia: true },
    { id: 4, nama: "Es teh", harga: 3000, kategori: "minuman", tersedia: true },
    { id: 5, nama: "Teh Anget", harga: 2500, kategori: "minuman", tersedia: true },   
    { id: 6, nama: "Air Es", harga: 1000, kategori: "minuman", tersedia: true },
    { id: 7, nama: "Tea Jus", harga: 2000, kategori: "minuman", tersedia: true },
    { id: 8, nama: "Susu Jahe", harga: 7000, kategori: "minuman", tersedia: true },
    { id: 9, nama: "Kopi Jahe", harga: 5000, kategori: "minuman", tersedia: true },
    { id: 10, nama: "Robusta", harga: 5000, kategori: "minuman", tersedia: true },
    { id: 11, nama: "Jahe Polos", harga: 5000, kategori: "minuman", tersedia: true },
    // MAKANAN
    { id: 12, nama: "Seafood", harga: 3000, kategori: "makanan", tersedia: true },
    { id: 13, nama: "Jeroan", harga: 3500, kategori: "makanan", tersedia: true }, 
    { id: 14, nama: "Nasi", harga: 3000, kategori: "makanan", tersedia: true },
    { id: 15, nama: "Tempe", harga: 1000, kategori: "makanan", tersedia: true },
    { id: 16, nama: "Mie", harga: 7000, kategori: "makanan", tersedia: true },
    { id: 17, nama: "Mie+Telur", harga: 10000, kategori: "makanan", tersedia: true },
    { id: 18, nama: "Kripik Usus", harga: 3000, kategori: "makanan", tersedia: true },
    { id: 19, nama: "Rambak", harga: 2500, kategori: "makanan", tersedia: true },
    { id: 20, nama: "Kripik Tempe", harga: 2500, kategori: "makanan", tersedia: true },
    { id: 21, nama: "Intip", harga: 3000, kategori: "makanan", tersedia: true },
    { id: 22, nama: "Cakar", harga: 3000, kategori: "makanan", tersedia: true }
];

const dataMejaDefault = {
    1: { keranjang: {}, status: "kosong" },
    2: { keranjang: {}, status: "kosong" },
    3: { keranjang: {}, status: "kosong" },
    4: { keranjang: {}, status: "kosong" },
    5: { keranjang: {}, status: "kosong" },
    6: { keranjang: {}, status: "kosong" },
    7: { keranjang: {}, status: "kosong" }
};

// STATE UTAMA
let dataMeja = JSON.parse(localStorage.getItem('cafe_data_meja')) || dataMejaDefault;
let historyTransaksi = JSON.parse(localStorage.getItem('cafe_history_transaksi')) || [];
let tanggalResetTerakhir = localStorage.getItem('cafe_tanggal_reset_terakhir') || "";

let mejaAktif = 1; 
let totalTagihanGlobal = 0;
let metodeSekarang = 'tunai'; 

const suaraSukses = new Audio('Dana.mp3');

// DOM ELEMENTS
const menuMinumanContainer = document.getElementById('menu-minuman-container');
const menuMakananContainer = document.getElementById('menu-makanan-container');
const mejaContainer = document.getElementById('meja-container');
const listPesanan = document.getElementById('list-pesanan');
const labelMejaAktif = document.getElementById('label-meja-aktif');
const modalPembayaran = document.getElementById('modal-pembayaran');
const modalTotalTagihan = document.getElementById('modal-total-tagihan');
const modalInfoMeja = document.getElementById('modal-info-meja');
const inputBayar = document.getElementById('input-bayar');
const kembalianTeks = document.getElementById('kembalian-teks');
const listHistory = document.getElementById('list-history');

const panelTunai = document.getElementById('panel-tunai');
const panelQr = document.getElementById('panel-qr');
const tabTunai = document.getElementById('tab-tunai');
const tabQr = document.getElementById('tab-qr');

const btnCetakBill = document.getElementById('btn-cetak-bill');
const btnBukaPembayaran = document.getElementById('btn-buka-pembayaran');
const btnBatalBayar = document.getElementById('btn-batal-bayar');
const btnProsesTransaksi = document.getElementById('btn-proses-transaksi');

// 2. FUNGSI NAVIGASI PINDAH HALAMAN TAB (BARU)
function pindahHalaman(namaHalaman) {
    // Sembunyikan semua halaman terlebih dahulu
    document.getElementById('halaman-home').classList.remove('active');
    document.getElementById('halaman-history').classList.remove('active');
    document.getElementById('nav-home').classList.remove('active');
    document.getElementById('nav-history').classList.remove('active');

    // Aktifkan halaman dan tombol nav pilihan
    if(namaHalaman === 'home') {
        document.getElementById('halaman-home').classList.add('active');
        document.getElementById('nav-home').classList.add('active');
    } else if(namaHalaman === 'history') {
        document.getElementById('halaman-history').classList.add('active');
        document.getElementById('nav-history').classList.add('active');
        tampilkanTabelHistory(); // Muat ulang render riwayat saat halaman dibuka
    }
}

// 3. LOGIKA DETEKSI RESET JAM 6 PAGI OTOMATIS
function cekSistemResetJam6Pagi() {
    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
    const tanggal = String(sekarang.getDate()).padStart(2, '0');
    
    const idHariIni = `${tahun}-${bulan}-${tanggal}`;
    
    if (sekarang.getHours() >= 6) {
        if (tanggalResetTerakhir !== idHariIni) {
            historyTransaksi = []; 
            localStorage.setItem('cafe_history_transaksi', JSON.stringify(historyTransaksi));
            
            tanggalResetTerakhir = idHariIni; 
            localStorage.setItem('cafe_tanggal_reset_terakhir', tanggalResetTerakhir);
            tampilkanTabelHistory();
        }
    }
}

function simpanKeLocalStorage() {
    localStorage.setItem('cafe_data_meja', JSON.stringify(dataMeja));
}

// 4. RENDER PANEL TOMBOL MEJA (1 - 7)
function tampilkanPanelMeja() {
    mejaContainer.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
        let kelasTambahan = '';
        if (dataMeja[i].status === 'terisi') kelasTambahan += ' terisi';
        if (i === mejaAktif) kelasTambahan += ' aktif';

        mejaContainer.innerHTML += `
            <button class="btn-meja${kelasTambahan}" onclick="pindahMeja(${i})">M${i}</button>
        `;
    }
}

function pindahMeja(nomorMeja) {
    mejaAktif = nomorMeja;
    labelMejaAktif.innerText = `Meja ${mejaAktif}`;
    tampilkanPanelMeja();
    updateStruk();
}
// 4. FUNGSI RENDER MENU (DENGAN TAMPILAN GAMBAR KECIL DI SEBELAH NAMA)
function tampilkanMenu() {
    menuMinumanContainer.innerHTML = '';
    menuMakananContainer.innerHTML = '';

    let keranjangSekarang = dataMeja[mejaAktif].keranjang;

    daftarMenu.forEach(item => {
        const itemDiKeranjang = keranjangSekarang[item.id];
        let tombolHTML = '';
        let kelasTambahanCard = '';
        let labelHargaHTML = `Rp ${item.harga.toLocaleString('id-ID')}`;

        // Opsi otomatis mencari file gambar berdasarkan nama produk (Contoh: "es-kopi.png", "mie+telur.png")
        // Spasi diubah jadi tanda hubung (-) dan hurufnya dikecilkan semua
        let namaFileGambar = 'img/' + item.nama.toLowerCase().replace(/\s+/g, '-') + '.png';

        // Kondisi jika status menu diset HABIS
        if (!item.tersedia) {
            kelasTambahanCard = ' menu-habis';
            labelHargaHTML = `<span class="badge-habis">[ HABIS ]</span>`;
            tombolHTML = `<button class="btn-habis-label" onclick="event.stopPropagation(); beralihStatusMenu(${item.id})">Kosong</button>`;
        } else if (itemDiKeranjang && itemDiKeranjang.qty > 0) {
            kelasTambahanCard = ' terpilih-biru';
            tombolHTML = `
                <div class="aksi-qty" style="justify-content: center; margin-top: 10px;">
                    <button class="btn-qty" onclick="event.stopPropagation(); ubahQty(${item.id}, -1)">-</button>
                    <span style="font-weight: bold; font-size: 1.1rem; min-width: 30px; text-align: center;">${itemDiKeranjang.qty}</span>
                    <button class="btn-qty" onclick="event.stopPropagation(); ubahQty(${item.id}, 1)">+</button>
                </div>
            `;
        } else {
            tombolHTML = `
                <button class="btn-tambah" onclick="event.stopPropagation(); tambahItem(${item.id})">Tambah</button>
            `;
        }

        // PEMBARUAN: Menggunakan layout flexbox agar gambar berada tepat di sebelah kiri nama & harga produk
        const htmlCard = `
            <div class="card-menu${kelasTambahanCard}" 
                 onclick="${item.tersedia ? `tambahItem(${item.id})` : ''}" 
                 oncontextmenu="event.preventDefault(); beralihStatusMenu(${item.id});"
                 style="position: relative;">
                <small style="color: #ccc; font-size: 0.55rem; position: absolute; top: 4px; right: 6px;">Tahan / Klik Kanan</small>
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; text-align: left;">
                    <img src="${namaFileGambar}" alt="${item.nama}" 
                         style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px; background: #f5f6fa;" 
                         onerror="this.src='https://via.placeholder.com/55?text=☕'">
                    <div style="flex: 1;">
                        <h3 style="font-size: 1rem; margin: 0; color: #2c3e50; font-weight: 600; line-height: 1.3;">${item.nama}</h3>
                        <p class="harga" style="margin: 3px 0 0 0; font-size: 0.88rem; font-weight: bold; color: #e67e22;">${labelHargaHTML}</p>
                    </div>
                </div>
                
                ${tombolHTML}
            </div>
        `;

        if (item.kategori === "minuman") {
            menuMinumanContainer.innerHTML += htmlCard;
        } else if (item.kategori === "makanan") {
            menuMakananContainer.innerHTML += htmlCard;
        }
    });
}


function beralihStatusMenu(id) {
    const music = daftarMenu.find(item => item.id === id);
    if (music) {
        music.tersedia = !music.tersedia;
        if (!music.tersedia) {
            let keranjangSekarang = dataMeja[mejaAktif].keranjang;
            if (keranjangSekarang[id]) {
                delete keranjangSekarang[id];
            }
        }
        updateStruk();
    }
}

function tambahItem(id) {
    const produk = daftarMenu.find(item => item.id === id);
    if (!produk.tersedia) return;

    let keranjangSekarang = dataMeja[mejaAktif].keranjang;

    if (keranjangSekarang[id]) {
        keranjangSekarang[id].qty += 1;
    } else {
        keranjangSekarang[id] = { nama: produk.nama, harga: produk.harga, qty: 1 };
    }
    
    dataMeja[mejaAktif].status = "terisi"; 
    tampilkanPanelMeja();
    updateStruk();
}

function ubahQty(id, perubahan) {
    let keranjangSekarang = dataMeja[mejaAktif].keranjang;
    if (!keranjangSekarang[id]) return;

    keranjangSekarang[id].qty += perubahan;
    if (keranjangSekarang[id].qty <= 0) {
        delete keranjangSekarang[id];
    }
    
    if (Object.keys(keranjangSekarang).length === 0) {
        dataMeja[mejaAktif].status = "kosong";
    }
    
    tampilkanPanelMeja();
    updateStruk();
}

function updateStruk() {
    listPesanan.innerHTML = '';
    let subtotal = 0;
    let keranjangSekarang = dataMeja[mejaAktif].keranjang;

    if (Object.keys(keranjangSekarang).length === 0) {
        listPesanan.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888;">Belum ada pesanan</td></tr>`;
    } else {
        for (const id in keranjangSekarang) {
            const item = keranjangSekarang[id];
            const subtotalItem = item.harga * item.qty;
            subtotal += subtotalItem;

            listPesanan.innerHTML += `
                <tr>
                    <td>${item.nama}</td>
                    <td>
                        <div class="aksi-qty">
                            <button class="btn-qty" onclick="ubahQty(${id}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="btn-qty" onclick="ubahQty(${id}, 1)">+</button>
                        </div>
                    </td>
                    <td>Rp ${subtotalItem.toLocaleString('id-ID')}</td>
                </tr>
            `;
        }
    }

    totalTagihanGlobal = subtotal;
    document.getElementById('subtotal').innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('total-akhir').innerText = `Rp ${totalTagihanGlobal.toLocaleString('id-ID')}`;
    
    simpanKeLocalStorage();
    tampilkanMenu();
}

function cetakBillSementara() {
    let keranjangSekarang = dataMeja[mejaAktif].keranjang;
    if (Object.keys(keranjangSekarang).length === 0) {
        alert('Gagal menyimpan! Keranjang meja ini masih kosong.');
        return;
    }

    dataMeja[mejaAktif].status = "terisi";
    tampilkanPanelMeja();
    simpanKeLocalStorage();

    let rincianMenu = "";
    let urutan = 1;
    for (const id in keranjangSekarang) {
        const item = keranjangSekarang[id];
        rincianMenu += `${urutan}. ${item.nama} (x${item.qty}) - Rp ${(item.harga * item.qty).toLocaleString('id-ID')}\n`;
        urutan++;
    }

    alert(
        `=== LOG HISTORI BILL DISIMPAN ===\n` +
        `📍 LOKASI: MEJA ${mejaAktif}\n` +
        `-----------------------------------------\n` +
        `${rincianMenu}` +
        `-----------------------------------------\n` +
        `TOTAL TAGIHAN: Rp ${totalTagihanGlobal.toLocaleString('id-ID')}\n` +
        `-----------------------------------------\n` +
        `*Status meja tersimpan (Warna Merah).*`
    );
}

function gantiMetode(metode) {
    metodeSekarang = metode;
    if (metode === 'tunai') {
        tabTunai.classList.add('active');
        tabQr.classList.remove('active');
        panelTunai.style.display = 'block';
        panelQr.style.display = 'none';
    } else {
        tabQr.classList.add('active');
        tabTunai.classList.remove('active');
        panelQr.style.display = 'flex'; 
        panelTunai.style.display = 'none';
    }
}

function bukaModalPembayaran() {
    let keranjangSekarang = dataMeja[mejaAktif].keranjang;
    if (Object.keys(keranjangSekarang).length === 0) {
        alert('Tidak ada tagihan di meja ini!');
        return;
    }
    
    cekSistemResetJam6Pagi(); 
    modalTotalTagihan.innerText = `Rp ${totalTagihanGlobal.toLocaleString('id-ID')}`;
    modalInfoMeja.innerText = `📍 Pembayaran Akhir: Meja ${mejaAktif}`;
    
    gantiMetode('tunai');
    inputBayar.value = ''; 
    kembalianTeks.innerText = 'Rp 0';
    kembalianTeks.style.color = '#333';
    
    modalPembayaran.classList.add('active');
    inputBayar.focus();
}

function tutupModalPembayaran() {
    modalPembayaran.classList.remove('active');
}

function hitungKembalian() {
    const nominalUang = parseFloat(inputBayar.value) || 0;

    if (nominalUang >= totalTagihanGlobal) {
        const kembalian = nominalUang - totalTagihanGlobal;
        kembalianTeks.innerText = `Rp ${kembalian.toLocaleString('id-ID')}`;
        kembalianTeks.style.color = '#27ae60';
    } else {
        kembalianTeks.innerText = 'Uang Kurang';
        kembalianTeks.style.color = '#c0392b';
    }
}

// 6. RENDER LOG RIWAYAT TRANSAKSI KASIR KE TABEL HISTORY
function tampilkanTabelHistory() {
    listHistory.innerHTML = '';
    if (historyTransaksi.length === 0) {
        listHistory.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999;">Belum ada transaksi lunas hari ini.</td></tr>`;
        return;
    }
    
    for (let i = historyTransaksi.length - 1; i >= 0; i--) {
        const trx = historyTransaksi[i];
        listHistory.innerHTML += `
            <tr>
                <td>${trx.waktu}</td>
                <td style="font-weight:bold;">Meja ${trx.meja}</td>
                <td><span class="badge-metode ${trx.metode}">${trx.metode.toUpperCase()}</span></td>
                <td style="font-weight:bold; color:#2e7d32;">Rp ${trx.total.toLocaleString('id-ID')}</td>
            </tr>
        `;
    }
}
// ==========================================================================
// PERBAIKAN: PROSES TRANSAKSI (MENYIMPAN TIMESTAMP LENGKAP)
// ==========================================================================
function prosesTransaksi() {
    if (metodeSekarang === 'tunai') {
        const nominalUang = parseFloat(inputBayar.value) || 0;
        if (nominalUang < totalTagihanGlobal) {
            alert('Gagal! Uang pembayaran tunai kurang.');
            return;
        }
        suaraSukses.play();
        const kembalian = nominalUang - totalTagihanGlobal;
        alert(`TRANSAKSI TUNAI MEJA ${mejaAktif} LUNAS!\n\nKembalian: Rp ${kembalian.toLocaleString('id-ID')}\n\nMeja otomatis dikosongkan.`);
    } else {
        suaraSukses.play();
        alert(`TRANSAKSI QR CODE MEJA ${mejaAktif} LUNAS!\n\nPembayaran digital berhasil diterima.\nMeja otomatis dikosongkan.`);
    }
    
    // KODE BARU: Simpan waktu dalam bentuk timestamp angka murni (Date.now()) agar bisa dihitung mundur
    historyTransaksi.push({
        timestamp: Date.now(), 
        meja: mejaAktif,
        metode: metodeSekarang,
        total: totalTagihanGlobal
    });
    
    localStorage.setItem('cafe_history_transaksi', JSON.stringify(historyTransaksi));
    
    dataMeja[mejaAktif].interaksi = {};
    dataMeja[mejaAktif].keranjang = {};
    dataMeja[mejaAktif].status = "kosong";
    
    simpanKeLocalStorage();
    tampilkanPanelMeja();
    updateStruk();
    tutupModalPembayaran();
    
    // Jika halaman history sedang terbuka, langsung update tampilannya
    if (document.getElementById('halaman-history').classList.contains('active')) {
        tampilkanTabelHistory();
    }
}

// ==========================================================================
// KODE BARU: FUNGSI PEMBANTU UNTUK MENGHITUNG JARAK WAKTU (RELATIVE TIME)
// ==========================================================================
function formatWaktuRealTime(timestampPesanan) {
    const sekarang = Date.now();
    const selisihDetik = Math.floor((sekarang - timestampPesanan) / 1000);

    if (selisihDetik < 5) return "⏱️ Baru saja";
    if (selisihDetik < 60) return `⏱️ ${selisihDetik} detik lalu`;
    
    const selisihMenit = Math.floor(selisihDetik / 60);
    if (selisihMenit < 60) return `⏱️ ${selisihMenit} menit lalu`;
    
    const selisihJam = Math.floor(selisihMenit / 60);
    // Jika sudah lewat dari 1 jam, tampilkan jam aslinya saja (misal 14:20)
    const d = new Date(timestampPesanan);
    return `🕒 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ==========================================================================
// PERBAIKAN: RENDER LOG TABEL HISTORY DENGAN FITUR REAL-TIME
// ==========================================================================
function tampilkanTabelHistory() {
    listHistory.innerHTML = '';
    if (historyTransaksi.length === 0) {
        listHistory.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999;">Belum ada transaksi lunas hari ini.</td></tr>`;
        return;
    }
    
    for (let i = historyTransaksi.length - 1; i >= 0; i--) {
        const trx = historyTransaksi[i];
        
        // Cek format data lama (jika tipenya masih text "jam:menit", convert aman)
        let teksWaktu = "";
        if (trx.timestamp) {
            teksWaktu = formatWaktuRealTime(trx.timestamp);
        } else {
            teksWaktu = `🕒 ${trx.waktu || '00:00'}`;
        }

        listHistory.innerHTML += `
            <tr>
                <td style="color: #4b6584; font-weight: 500;">${teksWaktu}</td>
                <td style="font-weight:bold;">Meja ${trx.meja}</td>
                <td><span class="badge-metode ${trx.metode}">${trx.metode.toUpperCase()}</span></td>
                <td style="font-weight:bold; color:#2e7d32;">Rp ${trx.total.toLocaleString('id-ID')}</td>
            </tr>
        `;
    }
}

// ==========================================================================
// KODE BARU: AUTO REFRESH SETIAP 10 DETIK (AGAR MENITNYA BERUBAH SENDIRI)
// ==========================================================================
setInterval(function() {
    // Mesin otomatis mendeteksi, jika kasir sedang membuka halaman history, jalankan fungsi update text waktu harian
    const halamanHistory = document.getElementById('halaman-history');
    if (halamanHistory && halamanHistory.classList.contains('active')) {
        tampilkanTabelHistory();
    }
}, 10000); // 10000 ms = 10 detik sekali nge-refresh teks menit/detik lalunya


// TRIGGER EVENT LISTENERS (Tetap bawaan projectmu)
btnCetakBill.addEventListener('click', cetakBillSementara);
btnBukaPembayaran.addEventListener('click', bukaModalPembayaran);
btnBatalBayar.addEventListener('click', tutupModalPembayaran);
inputBayar.addEventListener('input', hitungKembalian);
btnProsesTransaksi.addEventListener('click', prosesTransaksi);

// JALANKAN CORE UTAMA
tampilkanPanelMeja();
updateStruk();

// ==========================================================================
// KODE BARU: FUNGSI JAM DIGITAL REAL-TIME UNTUK JUDUL HISTORY
// ==========================================================================
// ==========================================================================
// PERBAIKAN: FUNGSI JAM DIGITAL UNTUK SEKALIGUS DI HEADER & JUDUL HISTORY
// ==========================================================================
function jalankanJamRealTime() {
    const elemenJamHistory = document.getElementById('jam-realtime');
    const elemenJamHeader = document.getElementById('header-jam');
    
    setInterval(function() {
        const sekarang = new Date();
        const jam = String(sekarang.getHours()).padStart(2, '0');
        const menit = String(sekarang.getMinutes()).padStart(2, '0');
        const detik = String(sekarang.getSeconds()).padStart(2, '0');
        const formatWaktu = `${jam}:${menit}:${detik}`;
        
        // 1. Update jam di pojok kanan header (Selalu Jalan)
        if (elemenJamHeader) {
            elemenJamHeader.innerText = formatWaktu;
        }
        
        // 2. Update jam di judul halaman history (Jika sedang terbuka)
        if (elemenJamHistory) {
            elemenJamHistory.innerText = formatWaktu;
        }
    }, 1000); // Eksekusi berdetik setiap 1 detik
}

// Jalankan fungsinya langsung
jalankanJamRealTime();

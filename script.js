// 1. DATABASE DATA MENU
const daftarMenu = [
    // MINUMAN
    { id: 1, nama: "Es kopi", harga: 5000, kategori: "minuman" },
    { id: 2, nama: "kopi panas", harga: 4000, kategori: "minuman" },
    { id: 3, nama: "Nutrisari", harga: 3000, kategori: "minuman" },
    { id: 4, nama: "Es teh", harga: 3000, kategori: "minuman" },
    { id: 5, nama: "Teh Anget", harga: 2500, kategori: "minuman" },   
    { id: 6, nama: "Air Es", harga: 1000, kategori: "minuman" },
    { id: 7, nama: "Tea Jus", harga: 2000, kategori: "minuman" },
    { id: 8, nama: "Susu Jahe", harga: 7000, kategori: "minuman" },
    { id: 9, nama: "Kopi Jahe", harga: 5000, kategori: "minuman" },
    { id: 10, nama: "Robusta", harga: 5000, kategori: "minuman" },
    { id: 11, nama: "Jahe Polos", harga: 5000, kategori: "minuman" },
    // MAKANAN
    { id: 12, nama: "Seafood", harga: 3000, kategori: "makanan" },
    { id: 13, nama: "Jeroan", harga: 3500, kategori: "makanan" }, // 🛠️ Koma yang hilang sudah diperbaiki di sini
    { id: 13, nama: "Nasi", harga: 3000, kategori: "makanan" },
    { id: 14, nama: "Tempe", harga: 1000, kategori: "makanan" },
    { id: 15, nama: "mie", harga: 7000, kategori: "makanan" },
    { id: 16, nama: "Mie+Telur", harga: 10000, kategori: "makanan" },
    { id: 17, nama: "Kripik Usus", harga: 3000, kategori: "makanan" },
    { id: 18, nama: "Rambak", harga: 2500, kategori: "makanan" },
    { id: 19, nama: "Kripik Tempe", harga: 2500, kategori: "makanan" },
    { id: 19, nama: "intip", harga: 3000, kategori: "makanan" },
    { id: 19, nama: "cakar", harga: 3000, kategori: "makanan" },
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

// 2. STATE DATABASE STATUS MEJA
let dataMeja = JSON.parse(localStorage.getItem('cafe_data_meja')) || dataMejaDefault;
let mejaAktif = 1; 
let totalTagihanGlobal = 0;
let metodeSekarang = 'tunai'; 

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

const panelTunai = document.getElementById('panel-tunai');
const panelQr = document.getElementById('panel-qr');
const tabTunai = document.getElementById('tab-tunai');
const tabQr = document.getElementById('tab-qr');

const btnCetakBill = document.getElementById('btn-cetak-bill');
const btnBukaPembayaran = document.getElementById('btn-buka-pembayaran');
const btnBatalBayar = document.getElementById('btn-batal-bayar');
const btnProsesTransaksi = document.getElementById('btn-proses-transaksi');

function simpanKeLocalStorage() {
    localStorage.setItem('cafe_data_meja', JSON.stringify(dataMeja));
}

// 3. RENDER PANEL TOMBOL MEJA (1 - 7)
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

// 4. FUNGSI RENDER MENU
function tampilkanMenu() {
    menuMinumanContainer.innerHTML = '';
    menuMakananContainer.innerHTML = '';

    let keranjangSekarang = dataMeja[mejaAktif].keranjang;

    daftarMenu.forEach(item => {
        const itemDiKeranjang = keranjangSekarang[item.id];
        let tombolHTML = '';

        if (itemDiKeranjang && itemDiKeranjang.qty > 0) {
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

        // Ditambahkan class 'terpilih-biru' jika qty > 0 dan fungsi onclick pada seluruh kartu menu
        const htmlCard = `
            <div class="card-menu ${itemDiKeranjang && itemDiKeranjang.qty > 0 ? 'terpilih-biru' : ''}" onclick="tambahItem(${item.id})">
                <h3>${item.nama}</h3>
                <p class="harga">Rp ${item.harga.toLocaleString('id-ID')}</p>
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

// 5. MANAJEMEN KERANJANG PADA MEJA AKTIF
function tambahItem(id) {
    const produk = daftarMenu.find(item => item.id === id);
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

// 6. UPDATE STRUK DATA
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

// 7. SIMPAN HISTORI PESANAN / CETAK BILL SEMENTARA
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

// 8. INTERAKSI SWITCH METODE PEMBAYARAN
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
        panelQr.style.display = 'block';
        panelTunai.style.display = 'none';
    }
}

// 9. BUKA MODAL PEMBAYARAN AKHIR
function bukaModalPembayaran() {
    let keranjangSekarang = dataMeja[mejaAktif].keranjang;
    if (Object.keys(keranjangSekarang).length === 0) {
        alert('Tidak ada tagihan di meja ini!');
        return;
    }
    
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

// REALTIME KEMBALIAN
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

// 10. PROSES TRANSAKSI SELESAI
function prosesTransaksi() {
    if (metodeSekarang === 'tunai') {
        const nominalUang = parseFloat(inputBayar.value) || 0;

        if (nominalUang < totalTagihanGlobal) {
            alert('Gagal! Uang pembayaran tunai kurang.');
            return;
        }

        const kembalian = nominalUang - totalTagihanGlobal;
        alert(`TRANSAKSI TUNAI MEJA ${mejaAktif} LUNAS!\n\nKembalian: Rp ${kembalian.toLocaleString('id-ID')}\n\nMeja otomatis dikosongkan.`);
    } else {
        alert(`TRANSAKSI QR CODE MEJA ${mejaAktif} LUNAS!\n\nPembayaran digital berhasil diterima.\nMeja otomatis dikosongkan.`);
    }
    
    dataMeja[mejaAktif].interaksi = {};
    dataMeja[mejaAktif].keranjang = {};
    dataMeja[mejaAktif].status = "kosong";
    
    simpanKeLocalStorage();
    tampilkanPanelMeja();
    updateStruk();
    tutupModalPembayaran();
}

// TRIGGER EVENT LISTENERS
btnCetakBill.addEventListener('click', cetakBillSementara);
btnBukaPembayaran.addEventListener('click', bukaModalPembayaran);
btnBatalBayar.addEventListener('click', tutupModalPembayaran);
inputBayar.addEventListener('input', hitungKembalian);
btnProsesTransaksi.addEventListener('click', prosesTransaksi);

// JALANKAN CORE UTAMA
tampilkanPanelMeja();
updateStruk();

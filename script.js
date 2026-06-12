// 1. DATABASE DATA MENU
const daftarMenu = [
    { id: 1, nama: "Espresso", harga: 15000 },
    { id: 2, nama: "Caffe Latte", harga: 22000 },
    { id: 3, nama: "Americano", harga: 18000 },
    { id: 4, nama: "Matcha Latte", harga: 24000 },
    { id: 5, nama: "Croissant", harga: 20000 },
    { id: 6, nama: "Kentang Goreng", harga: 15000 },
    { id: 7, nama: "Moccacino", harga: 23000 },
    { id: 8, nama: "Donat Cokelat", harga: 12000 },
    { id: 9, nama: "Air Mineral", harga: 5000 }
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
let metodeSekarang = 'tunai'; // State melacak metode bayar aktif ('tunai' atau 'qr')

// DOM ELEMENTS
const menuContainer = document.getElementById('menu-container');
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
    labelMejaAktif.innerText = `Mengedit: Meja ${mejaAktif}`;
    tampilkanPanelMeja();
    updateStruk();
}

// 4. RENDER MENU UTAMA
function tampilkanMenu() {
    menuContainer.innerHTML = '';
    daftarMenu.forEach(item => {
        menuContainer.innerHTML += `
            <div class="card-menu">
                <h3>${item.nama}</h3>
                <p class="harga">Rp ${item.harga.toLocaleString('id-ID')}</p>
                <button class="btn-tambah" onclick="tambahItem(${item.id})">Tambah</button>
            </div>
        `;
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

// 6. UPDATE STRUK DATA REALTIME & HITUNG TOTAL (TANPA PAJAK)
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
        `*Status meja aman tersimpan (Warna Merah).*`
    );
}

// 8. INTERAKSI SWITCH ANTARA TUNAI DAN QR CODE
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
    
    // Kembalikan pilihan tab default ke tunai tiap buka modal
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
        // Jika pakai QR Code, langsung anggap lunas (karena nominal scan pasti pas)
        alert(`TRANSAKSI QR CODE MEJA ${mejaAktif} LUNAS!\n\nPembayaran digital berhasil diterima.\nMeja otomatis dikosongkan.`);
    }
    
    // Reset data meja aktif kembali kosong
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
tampilkanMenu();
tampilkanPanelMeja();
updateStruk();

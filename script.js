"use strict";

// Data vila (tanpa back-end: disimpan sebagai array objek)
const dataVila = [
  { id: 1, nama: "Vila Melati", tipe: "2 Kamar Tidur", lokasi: "Cisarua, Puncak", harga: 750000, kapasitas: 6, fasilitas: ["Kolam renang", "Dapur", "Parkir luas"], tersedia: true },
  { id: 2, nama: "Vila Anggrek", tipe: "3 Kamar Tidur", lokasi: "Ciawi, Bogor", harga: 1100000, kapasitas: 8, fasilitas: ["Pemandangan gunung", "Dapur", "Area BBQ"], tersedia: true },
  { id: 3, nama: "Vila Kenanga", tipe: "4 Kamar Tidur", lokasi: "Megamendung, Puncak", harga: 1500000, kapasitas: 10, fasilitas: ["Kolam renang", "Karaoke", "Taman"], tersedia: false }
];

const KUNCI_PESANAN = "villaPermaiPesanan";
const KUNCI_NAMA = "villaPermaiNamaTerakhir";

const elDaftar = document.querySelector("#daftar-vila-grid");
const elInfo = document.querySelector("#info-hasil");
const elCari = document.querySelector("#cari-vila");
const elForm = document.querySelector("#form-pesan");
const elNama = document.querySelector("#nama");
const elUnit = document.querySelector("#unit-vila");
const elCheckin = document.querySelector("#checkin");
const elCheckout = document.querySelector("#checkout");
const elTamu = document.querySelector("#tamu");
const elError = document.querySelector("#pesan-error");
const elRingkasan = document.querySelector("#ringkasan");
const elPesanan = document.querySelector("#daftar-pesanan");

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function buatElemen(tag, kelas, teks) {
  const el = document.createElement(tag);
  if (kelas) el.className = kelas;
  if (teks !== undefined) el.textContent = teks;
  return el;
}

// Render kartu vila memakai createElement dan appendChild
function tampilkanVila(daftar) {
  elDaftar.textContent = "";
  daftar.forEach(function (v) {
    const kartu = buatElemen("article", "villa-card");
    kartu.appendChild(buatElemen("h3", "villa-card__name", v.nama));
    kartu.appendChild(buatElemen("p", "villa-card__info", "Tipe: " + v.tipe));
    kartu.appendChild(buatElemen("p", "villa-card__info", "Lokasi: " + v.lokasi));
    kartu.appendChild(buatElemen("p", "villa-card__price", formatRupiah(v.harga) + " / malam"));
    const ul = buatElemen("ul", "villa-card__facilities");
    v.fasilitas.forEach(function (f) { ul.appendChild(buatElemen("li", "", f)); });
    kartu.appendChild(ul);
    const status = v.tersedia ? "Tersedia" : "Penuh";
    const kelasStatus = "villa-card__status villa-card__status--" + (v.tersedia ? "tersedia" : "penuh");
    kartu.appendChild(buatElemen("span", kelasStatus, status));
    elDaftar.appendChild(kartu);
  });
  elInfo.textContent = daftar.length === 0 ? "Vila tidak ditemukan. Coba kata kunci lain." : "Menampilkan " + daftar.length + " vila.";
}

function isiDropdown() {
  elUnit.textContent = "";
  dataVila.forEach(function (v) {
    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = v.nama + " - " + formatRupiah(v.harga) + "/malam";
    elUnit.appendChild(opt);
  });
}

function filterVila() {
  const kata = elCari.value.trim().toLowerCase();
  const hasil = dataVila.filter(function (v) {
    const teks = (v.nama + " " + v.tipe + " " + v.lokasi + " " + v.fasilitas.join(" ")).toLowerCase();
    return teks.includes(kata);
  });
  tampilkanVila(hasil);
}

function hitungMalam(checkin, checkout) {
  const selisih = new Date(checkout) - new Date(checkin);
  return Math.round(selisih / (1000 * 60 * 60 * 24));
}

// Total = harga per malam x jumlah malam (harga per unit vila, bukan per orang)
function hitungTotalHarga(vila, malam) {
  return vila.harga * malam;
}

function validasiForm() {
  const nama = elNama.value.trim();
  const tamu = Number(elTamu.value);
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  if (nama === "") return "Nama tamu wajib diisi.";
  if (!elCheckin.value) return "Tanggal check-in wajib diisi.";
  if (!elCheckout.value) return "Tanggal check-out wajib diisi.";
  if (new Date(elCheckin.value) < hariIni) return "Tanggal check-in tidak boleh di masa lalu.";
  if (new Date(elCheckout.value) <= new Date(elCheckin.value)) return "Tanggal check-out harus setelah tanggal check-in.";
  if (!Number.isInteger(tamu) || tamu < 1 || tamu > 10) return "Jumlah tamu harus antara 1 sampai 10 orang.";

  const vila = dataVila.find(function (v) { return v.id === Number(elUnit.value); });
  if (!vila) return "Silakan pilih unit vila.";
  if (tamu > vila.kapasitas) return vila.nama + " hanya muat maksimal " + vila.kapasitas + " tamu.";
  return "";
}

function tampilkanError(pesan, sukses) {
  elError.textContent = pesan;
  elError.className = sukses ? "message message--ok" : "message";
  elError.hidden = pesan === "";
}

function tampilkanRingkasan() {
  const vila = dataVila.find(function (v) { return v.id === Number(elUnit.value); });
  if (!vila || !elCheckin.value || !elCheckout.value) return;
  const malam = hitungMalam(elCheckin.value, elCheckout.value);
  if (malam < 1) return;
  const total = hitungTotalHarga(vila, malam);

  elRingkasan.textContent = "";
  elRingkasan.appendChild(buatElemen("h3", "summary__title", "Ringkasan Biaya"));
  elRingkasan.appendChild(buatElemen("p", "summary__text", "Vila: " + vila.nama));
  elRingkasan.appendChild(buatElemen("p", "summary__text", "Harga per malam: " + formatRupiah(vila.harga)));
  elRingkasan.appendChild(buatElemen("p", "summary__text", "Jumlah malam: " + malam));
  elRingkasan.appendChild(buatElemen("p", "summary__total", "Total: " + formatRupiah(total)));
}

function cekKetersediaan() {
  const pesan = validasiForm();
  if (pesan) { tampilkanError(pesan); return; }
  const vila = dataVila.find(function (v) { return v.id === Number(elUnit.value); });
  if (!vila.tersedia) {
    tampilkanError(vila.nama + " sedang penuh. Silakan pilih vila lain.");
    return;
  }
  tampilkanError(vila.nama + " tersedia untuk tanggal tersebut.", true);
  tampilkanRingkasan();
}

// localStorage dengan try...catch agar halaman tidak crash
function muatPesanan() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_PESANAN)) || [];
  } catch (e) {
    return [];
  }
}

function simpanPesanan(daftar) {
  try {
    localStorage.setItem(KUNCI_PESANAN, JSON.stringify(daftar));
  } catch (e) {
    tampilkanError("Pesanan tidak dapat disimpan di perangkat ini.");
  }
}

function tampilkanPesanan() {
  elPesanan.textContent = "";
  const daftar = muatPesanan();
  if (daftar.length === 0) {
    elPesanan.appendChild(buatElemen("li", "orders__item", "Belum ada pesanan."));
    return;
  }
  daftar.forEach(function (p) {
    const teks = p.nama + " - " + p.vila + ", " + p.checkin + " s/d " + p.checkout + " (" + p.malam + " malam) - " + formatRupiah(p.total);
    elPesanan.appendChild(buatElemen("li", "orders__item", teks));
  });
}

function kirimPesanan(event) {
  event.preventDefault();
  const pesan = validasiForm();
  if (pesan) { tampilkanError(pesan); return; }
  const vila = dataVila.find(function (v) { return v.id === Number(elUnit.value); });
  if (!vila.tersedia) {
    tampilkanError(vila.nama + " sedang penuh. Silakan pilih vila lain.");
    return;
  }
  const malam = hitungMalam(elCheckin.value, elCheckout.value);
  const pesanan = {
    nama: elNama.value.trim(),
    vila: vila.nama,
    checkin: elCheckin.value,
    checkout: elCheckout.value,
    tamu: Number(elTamu.value),
    malam: malam,
    total: hitungTotalHarga(vila, malam)
  };
  const daftar = muatPesanan();
  daftar.push(pesanan);
  simpanPesanan(daftar);
  try { localStorage.setItem(KUNCI_NAMA, pesanan.nama); } catch (e) { /* abaikan */ }
  tampilkanPesanan();
  tampilkanRingkasan();
  tampilkanError("Pesanan berhasil dikirim. Total: " + formatRupiah(pesanan.total), true);
}

function mulai() {
  try {
    tampilkanVila(dataVila);
    isiDropdown();
    tampilkanPesanan();
    const namaTerakhir = localStorage.getItem(KUNCI_NAMA);
    if (namaTerakhir) elNama.value = namaTerakhir;
    const hariIni = new Date().toISOString().split("T")[0];
    elCheckin.min = hariIni;
    elCheckout.min = hariIni;
  } catch (e) {
    elInfo.textContent = "Data vila gagal dimuat. Silakan muat ulang halaman.";
  }

  elCari.addEventListener("input", filterVila);
  elForm.addEventListener("submit", kirimPesanan);
  document.querySelector("#btn-cek").addEventListener("click", cekKetersediaan);
  [elUnit, elCheckin, elCheckout].forEach(function (el) {
    el.addEventListener("change", tampilkanRingkasan);
  });
}

document.addEventListener("DOMContentLoaded", mulai);

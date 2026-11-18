// data/rmo-hub-data.js
// Sumber data tunggal untuk SIERA-RMO Hub (data sampel untuk mock up Program Kerja 1).
// Ganti isi object ini nanti dengan hasil fetch dari Google Sheets / Apps Script
// tanpa perlu mengubah js/rmo-hub.js.

var RMO_HUB_DATA = {
  meta: {
    region: "Region 5",
    totalStores: 196,
    lastUpdated: "16 Nov 2026, 18.00",
    now: "Nov 2026",
    modulesIntegrated: { target: 6, targetDate: "Jun 2027" },
    visibility: { coveredStores: 135, totalStores: 196 },
    eligibleRateOverall: 20
  },

  filters: {
    periods: ["Nov 2026", "Okt 2026", "Sep 2026", "Agt 2026", "Jul 2026", "Jun 2026"],
    areas: ["Semua Area", "Jakarta Pusat", "Jakarta Barat", "Tangerang", "Tangerang Selatan", "Banten"],
    brands: ["Semua Brand", "Erafone", "iBox", "Samsung Store", "Xiaomi", "Huawei", "Honor"]
  },

  // Bobot KPI RMO Index. "live" menandai komponen yang datanya sudah bisa dihitung
  // (modul live/prototype). Komponen yang belum live ditandai abu-abu di UI dan
  // bobotnya dibagi ulang proporsional ke komponen yang live.
  kpiIndex: {
    weights: [
      { key: "visibility", label: "Compliance visibility (ERA-VIS)", weight: 30, moduleId: "visibility" },
      { key: "signtax", label: "Kepatuhan pajak reklame (SIGNTAX-ERA)", weight: 20, moduleId: "signtax" },
      { key: "exhibitionRoi", label: "% event dengan laporan ROI ≤ H+7", weight: 20, moduleId: "exhibition" },
      { key: "sosmedEligible", label: "Eligible rate konten 1W1C (target 40%)", weight: 15, moduleId: "sosmed" },
      { key: "planogram", label: "Compliance planogram rak aksesoris", weight: 15, moduleId: "planogram" }
    ]
  },

  scorecard: [
    { key: "modules", label: "Modul terintegrasi", unit: "", target: 6 },
    { key: "weeklyUpdate", label: "% toko update data mingguan", unit: "%", current: 74, target: 90 },
    { key: "reportTime", label: "Waktu penyusunan laporan bulanan", unit: " jam", current: 16, target: 8 },
    { key: "fine", label: "Denda pajak reklame", unit: "", current: 0, target: 0 },
    { key: "eligibleRate", label: "Eligible rate konten 1W1C", unit: "%", target: 40 }
  ],

  modules: [
    {
      id: "visibility",
      name: "Visibility",
      title: "VMD Compliance Monitoring",
      status: "live",
      url: "https://era-vis.netlify.app",
      inputSource: "Input: ERA-VIS",
      pic: "VM & Exhibition Asst. Manager",
      complianceScore: 86,
      kpis: [
        { label: "Toko tercakup", value: "135/196 (69%)" },
        { label: "Compliance", value: "86%" },
        { label: "Submit tepat waktu H+3", value: "82%" }
      ],
      description: "Compliance monitoring, upload foto audit, dan WA escalation 3 level (Store Leader → Area → Regional)."
    },
    {
      id: "signtax",
      name: "Pajak Reklame",
      title: "SIGNTAX-ERA",
      status: "live",
      url: "https://signtax-era.netlify.app",
      inputSource: "Input: SIGNTAX-ERA",
      pic: "VM & Exhibition Asst. Manager (backup: Admin RMO)",
      finesYtd: 0,
      overdueCount: 0,
      kpis: [
        { label: "Titik reklame aktif", value: "128" },
        { label: "Jatuh tempo H-60/H-30/H-7", value: "4 / 2 / 1" },
        { label: "Denda 2026 YTD", value: "Rp 0" }
      ],
      description: "Reminder otomatis H-60/H-30/H-7 via Fonnte, vendor ELFABI dan CAKRA, serta due-date tracking 102 toko."
    },
    {
      id: "exhibition",
      name: "Exhibition",
      title: "ERA-Exhibition",
      status: "prototype",
      url: "https://era-exhibition-siera.netlify.app",
      inputSource: "Input: ERA-Exhibition (prototype)",
      pic: "VM & Exhibition Asst. Manager",
      kpis: [
        { label: "Event 2027", value: "0/5" },
        { label: "% laporan ROI ≤ H+7", value: "—" },
        { label: "Cost per transaksi", value: "—" }
      ],
      description: "Pipeline event, tracking cost dan ROI per event, serta persentase co-funding brand."
    },
    {
      id: "activation",
      name: "Activation",
      title: "ERA-Activity",
      status: "prototype",
      url: "https://era-activity.netlify.app",
      inputSource: "Input: ERA-Activity (prototype)",
      pic: "Activation & Partnership Asst. Manager",
      kpis: [
        { label: "Activation 2027", value: "0/12" },
        { label: "Conversion", value: "—" },
        { label: "% co-funding", value: "—" }
      ],
      description: "Tracking activation lapangan, konversi transaksi per peserta, dan co-funding brand."
    },
    {
      id: "planogram",
      name: "Planogram Rak Aksesoris",
      title: "Planogram Compliance",
      status: "build",
      targetDate: "Jun 2027",
      inputSource: "Input via ERA-VIS",
      pic: "VM & Exhibition Asst. Manager",
      kpis: [
        { label: "% rak sesuai planogram", value: "Belum dihitung" },
        { label: "Toko temuan", value: "Belum dihitung" }
      ],
      description: "Compliance planogram rak aksesoris, input foto lewat modul ERA-VIS yang sudah berjalan.",
      previewTimeline: [
        { phase: "Jan–Feb 2027", text: "Desain standar planogram per brand" },
        { phase: "Mar–Apr 2027", text: "Pilot audit 20 toko" },
        { phase: "Mei–Jun 2027", text: "Roll-out 196 toko" }
      ]
    },
    {
      id: "sosmed",
      name: "Sosmed 1W1C",
      title: "Kurasi Konten 1 Week 1 Content",
      status: "build",
      targetDate: "Jun 2027",
      inputSource: "Input via ERA-VIS (kurasi)",
      pic: "Social Media Management Supervisor",
      kpis: [
        { label: "Submit", value: "98%" },
        { label: "Eligible rate", value: "20% (Tangerang 40% … Jakpus 5%)" }
      ],
      description: "Kurasi konten 1 Week 1 Content per store leader, eligible rate dihitung per area.",
      previewTimeline: [
        { phase: "Jan–Feb 2027", text: "Finalisasi kriteria eligible" },
        { phase: "Mar–Apr 2027", text: "Pilot kurasi 20 toko" },
        { phase: "Mei–Jun 2027", text: "Roll-out 196 toko" }
      ]
    }
  ],

  // storeCount per area WAJIB totalnya sama dengan meta.totalStores (divalidasi oleh validateData()).
  // kpiScore = skor gabungan area (sample): blend compliance VIS, submit 1W1C, dan eligible rate.
  leaderboard: [
    { area: "Jakarta Pusat", storeCount: 42, compliance: 79, submit1w1c: 95, eligibleRate: 5, kpiScore: 64 },
    { area: "Jakarta Barat", storeCount: 40, compliance: 85, submit1w1c: 97, eligibleRate: 22, kpiScore: 80 },
    { area: "Tangerang", storeCount: 38, compliance: 92, submit1w1c: 99, eligibleRate: 40, kpiScore: 90 },
    { area: "Tangerang Selatan", storeCount: 35, compliance: 88, submit1w1c: 98, eligibleRate: 18, kpiScore: 84 },
    { area: "Banten", storeCount: 41, compliance: 83, submit1w1c: 96, eligibleRate: 16, kpiScore: 76 }
  ],

  // Nilai terakhir (Nov) HARUS sama dengan hasil computeKpiIndex() di js/rmo-hub.js
  // (dihitung dari complianceScore Visibility + skor SIGNTAX-ERA, bobot live dinormalisasi).
  trend: {
    months: ["Jun", "Jul", "Agt", "Sep", "Okt", "Nov"],
    kpiIndex: [78, 81, 84, 87, 90, 92]
  },

  roadmap: [
    { month: "Jan 2027", label: "Mapping KPI & desain" },
    { month: "Feb–Jun 2027", label: "Build 4 modul (Exhibition, Activation, Planogram, Sosmed 1W1C)" },
    { month: "Apr 2027", label: "Pilot 20 toko" },
    { month: "Mei–Jun 2027", label: "Roll-out 196 toko" },
    { month: "Jul 2027", label: "Review" },
    { month: "Agt–Des 2027", label: "Perbaikan, SOP regional, usulan replikasi via HO" }
  ]
};

// Validasi konsistensi angka di data sampel. Dipanggil saat halaman load;
// warning ditulis ke console, tidak menghentikan render (data tetap tampil).
function validateRmoHubData(data) {
  var warnings = [];

  var storeSum = data.leaderboard.reduce(function (sum, row) {
    return sum + row.storeCount;
  }, 0);
  if (storeSum !== data.meta.totalStores) {
    warnings.push(
      "Jumlah storeCount leaderboard (" + storeSum + ") tidak sama dengan meta.totalStores (" + data.meta.totalStores + ")"
    );
  }

  if (data.modules.length !== 6) {
    warnings.push("Jumlah modul (" + data.modules.length + ") seharusnya 6");
  }

  var statusCount = { live: 0, prototype: 0, build: 0 };
  data.modules.forEach(function (m) {
    if (statusCount[m.status] === undefined) {
      warnings.push("Modul '" + m.id + "' punya status tidak dikenal: " + m.status);
    } else {
      statusCount[m.status]++;
    }
  });
  if (statusCount.live !== 2) warnings.push("Jumlah modul status 'live' seharusnya 2, sekarang " + statusCount.live);
  if (statusCount.prototype !== 2) warnings.push("Jumlah modul status 'prototype' seharusnya 2, sekarang " + statusCount.prototype);
  if (statusCount.build !== 2) warnings.push("Jumlah modul status 'build' seharusnya 2, sekarang " + statusCount.build);

  var modulesIntegratedCurrent = statusCount.live;
  if (modulesIntegratedCurrent > data.meta.modulesIntegrated.target) {
    warnings.push("modulesIntegrated current (" + modulesIntegratedCurrent + ") melebihi target (" + data.meta.modulesIntegrated.target + ")");
  }

  if (data.meta.visibility.coveredStores > data.meta.visibility.totalStores) {
    warnings.push("visibility.coveredStores melebihi visibility.totalStores");
  }

  var weightSum = data.kpiIndex.weights.reduce(function (sum, w) {
    return sum + w.weight;
  }, 0);
  if (weightSum !== 100) {
    warnings.push("Total bobot kpiIndex.weights (" + weightSum + ") seharusnya 100");
  }

  var weightedEligible = data.leaderboard.reduce(function (sum, row) {
    return sum + row.eligibleRate * row.storeCount;
  }, 0) / storeSum;
  if (Math.abs(weightedEligible - data.meta.eligibleRateOverall) > 3) {
    warnings.push(
      "Rata-rata eligibleRate (weighted: " + weightedEligible.toFixed(1) + "%) menyimpang dari meta.eligibleRateOverall (" + data.meta.eligibleRateOverall + "%)"
    );
  }

  var lowestArea = data.leaderboard.reduce(function (min, row) {
    return row.kpiScore < min.kpiScore ? row : min;
  }, data.leaderboard[0]);
  if (lowestArea.area !== "Jakarta Pusat") {
    warnings.push(
      "Area skor KPI RMO terendah sekarang '" + lowestArea.area + "', bukan 'Jakarta Pusat' — catatan buddy coaching di leaderboard perlu disesuaikan"
    );
  }

  if (warnings.length) {
    warnings.forEach(function (w) {
      console.warn("[RMO Hub data] " + w);
    });
  }

  return warnings;
}

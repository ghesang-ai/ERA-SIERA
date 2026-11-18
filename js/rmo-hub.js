// js/rmo-hub.js — render SIERA-RMO Hub (modal #launcher-rmo di dashboard.html)
// Tahap (a): data + layout header/filter + grid 6 modul.
// Tahap (b)/(c)/(d) akan menambah render KPI Index, scorecard, diagram, leaderboard, chart, roadmap.

var rmoHubState = {
  filters: { period: null, area: null, brand: null },
  leaderboardSort: { key: "kpiScore", dir: "desc" },
  chartsInitialized: false
};

var STATUS_LABEL = {
  live: "Live",
  prototype: "Prototype",
  build: "Build 2027"
};

function rmoHubFormatBadge(status, targetDate) {
  if (status === "build" && targetDate) {
    return "Build " + targetDate;
  }
  return STATUS_LABEL[status] || status;
}

function renderHubHeader(data) {
  var badge = document.getElementById("hub-progress-badge");
  if (badge) {
    var liveCount = data.modules.filter(function (m) { return m.status === "live"; }).length;
    badge.textContent =
      "Modul terintegrasi " + liveCount + "/" + data.modules.length +
      " → target " + data.meta.modulesIntegrated.target + "/" + data.modules.length +
      " (" + data.meta.modulesIntegrated.targetDate + ")";
  }

  var updateEl = document.getElementById("hub-update-date");
  if (updateEl) {
    updateEl.textContent = "Update " + data.meta.lastUpdated;
  }
}

function renderHubFilters(data) {
  var periodSelect = document.getElementById("hub-filter-period");
  var areaSelect = document.getElementById("hub-filter-area");
  var brandSelect = document.getElementById("hub-filter-brand");

  function fillSelect(select, options) {
    if (!select) return;
    select.innerHTML = "";
    options.forEach(function (opt) {
      var el = document.createElement("option");
      el.value = opt;
      el.textContent = opt;
      select.appendChild(el);
    });
  }

  fillSelect(periodSelect, data.filters.periods);
  fillSelect(areaSelect, data.filters.areas);
  fillSelect(brandSelect, data.filters.brands);

  rmoHubState.filters.period = data.filters.periods[0];
  rmoHubState.filters.area = data.filters.areas[0];
  rmoHubState.filters.brand = data.filters.brands[0];

  [periodSelect, areaSelect, brandSelect].forEach(function (select) {
    if (!select) return;
    select.addEventListener("change", function () {
      rmoHubState.filters.period = periodSelect ? periodSelect.value : null;
      rmoHubState.filters.area = areaSelect ? areaSelect.value : null;
      rmoHubState.filters.brand = brandSelect ? brandSelect.value : null;
      // Tahap (c): leaderboard & chart akan dipanggil ulang di sini mengikuti filter ini.
    });
  });
}

function renderHubModuleGrid(data) {
  var grid = document.getElementById("hub-module-grid");
  if (!grid) return;

  grid.innerHTML = data.modules.map(function (m) {
    var badgeClass = "badge-" + m.status;
    var badgeLabel = rmoHubFormatBadge(m.status, m.targetDate);

    var kpisHtml = m.kpis.map(function (kpi) {
      return (
        '<div class="hub-module-kpi-row">' +
          '<span class="hub-module-kpi-label">' + kpi.label + '</span>' +
          '<span class="hub-module-kpi-value">' + kpi.value + '</span>' +
        '</div>'
      );
    }).join("");

    var actionHtml;
    if (m.status === "build") {
      actionHtml = '<button type="button" class="hub-module-btn is-build" onclick="openModulePreview(\'' + m.id + '\')" aria-label="Lihat rencana modul ' + m.name + '">Lihat rencana</button>';
    } else {
      actionHtml = '<a class="hub-module-btn" href="' + m.url + '" target="_blank" rel="noopener noreferrer" aria-label="Buka modul ' + m.name + '">Buka modul</a>';
    }

    return (
      '<article class="hub-module-card status-' + m.status + '">' +
        '<div class="hub-module-top">' +
          '<div>' +
            '<div class="hub-module-name">' + m.name + '</div>' +
            '<div class="hub-module-input">' + m.inputSource + '</div>' +
          '</div>' +
          '<span class="hub-module-badge ' + badgeClass + '">' + badgeLabel + '</span>' +
        '</div>' +
        '<div class="hub-module-desc">' + m.description + '</div>' +
        '<div class="hub-module-kpis">' + kpisHtml + '</div>' +
        '<div class="hub-module-footer">' +
          '<div class="hub-module-pic">PIC: ' + m.pic + '</div>' +
          actionHtml +
        '</div>' +
      '</article>'
    );
  }).join("");
}

function computeWeightedEligibleRate(data) {
  var totalStores = data.leaderboard.reduce(function (sum, row) { return sum + row.storeCount; }, 0);
  var weightedSum = data.leaderboard.reduce(function (sum, row) { return sum + row.eligibleRate * row.storeCount; }, 0);
  return totalStores > 0 ? weightedSum / totalStores : 0;
}

function getKpiComponentScore(weightDef, data) {
  var module = data.modules.filter(function (m) { return m.id === weightDef.moduleId; })[0];
  if (!module || module.status !== "live") return null;

  if (weightDef.key === "visibility") {
    return module.complianceScore;
  }
  if (weightDef.key === "signtax") {
    var score = 100;
    if (module.finesYtd > 0) score -= 50;
    if (module.overdueCount > 0) score -= 30;
    return Math.max(0, score);
  }
  return null;
}

function computeKpiIndex(data) {
  var components = data.kpiIndex.weights.map(function (w) {
    var score = getKpiComponentScore(w, data);
    return { key: w.key, label: w.label, weight: w.weight, score: score, live: score !== null };
  });

  var totalLiveWeight = components.reduce(function (sum, c) { return c.live ? sum + c.weight : sum; }, 0);
  var weightedSum = components.reduce(function (sum, c) { return c.live ? sum + c.weight * c.score : sum; }, 0);
  var finalScore = totalLiveWeight > 0 ? Math.round(weightedSum / totalLiveWeight) : 0;

  components.forEach(function (c) {
    c.renormWeight = c.live && totalLiveWeight > 0 ? Math.round((c.weight / totalLiveWeight) * 100) : null;
  });

  return { score: finalScore, components: components, totalLiveWeight: totalLiveWeight };
}

function renderKpiGauge(score) {
  var gauge = document.getElementById("hub-kpi-gauge");
  if (!gauge) return;

  gauge.innerHTML =
    '<svg viewBox="0 0 220 140" class="hub-gauge-svg" role="img" aria-label="Skor KPI RMO Index ' + score + ' dari 100">' +
      '<defs>' +
        '<linearGradient id="hub-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">' +
          '<stop offset="0%" stop-color="var(--accent-deep)"/>' +
          '<stop offset="100%" stop-color="var(--accent-light)"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M25,115 A85,85 0 0 1 195,115" fill="none" stroke="#e2e8f0" stroke-width="18" stroke-linecap="round" pathLength="100"></path>' +
      '<path d="M25,115 A85,85 0 0 1 195,115" fill="none" stroke="url(#hub-gauge-gradient)" stroke-width="18" stroke-linecap="round" pathLength="100" stroke-dasharray="' + score + ' 100"></path>' +
      '<text x="110" y="104" text-anchor="middle" class="hub-gauge-score">' + score + '</text>' +
      '<text x="110" y="126" text-anchor="middle" class="hub-gauge-max">/ 100</text>' +
    '</svg>';
}

function renderKpiBreakdown(kpiIndexResult) {
  var breakdown = document.getElementById("hub-kpi-breakdown");
  var descEl = document.getElementById("hub-kpi-desc");
  if (!breakdown) return;

  var rowsHtml = kpiIndexResult.components.map(function (c) {
    if (c.live) {
      return (
        '<div class="hub-kpi-breakdown-row">' +
          '<span>' + c.label + ' &middot; bobot asli ' + c.weight + '% &rarr; dipakai ' + c.renormWeight + '%</span>' +
          '<strong>' + c.score + '</strong>' +
        '</div>'
      );
    }
    return (
      '<div class="hub-kpi-breakdown-row is-dimmed">' +
        '<span>' + c.label + ' &middot; bobot asli ' + c.weight + '%</span>' +
        '<strong>Belum dihitung</strong>' +
      '</div>'
    );
  }).join("");

  breakdown.innerHTML =
    rowsHtml +
    '<div class="hub-kpi-breakdown-note">Modul yang belum live tidak ikut dihitung dulu; bobotnya (' +
    (100 - kpiIndexResult.totalLiveWeight) +
    '%) dialihkan proporsional ke modul yang sudah live, lalu ikut masuk begitu live.</div>';

  if (descEl) {
    var liveLabels = kpiIndexResult.components.filter(function (c) { return c.live; }).map(function (c) { return c.label.split(" (")[0]; });
    descEl.textContent =
      "Skor gabungan dari " + liveLabels.length + " dari 5 komponen yang sudah live (" + liveLabels.join(", ") + "); bobot komponen lain menyusul saat modulnya live.";
  }
}

function renderScorecard(data, kpiIndexResult) {
  var grid = document.getElementById("hub-scorecard-grid");
  if (!grid) return;

  var liveModuleCount = data.modules.filter(function (m) { return m.status === "live"; }).length;
  var eligibleRateCurrent = Math.round(computeWeightedEligibleRate(data));

  var items = data.scorecard.map(function (item) {
    var current = item.current;
    if (item.key === "modules") current = liveModuleCount;
    if (item.key === "eligibleRate") current = eligibleRateCurrent;

    var direction = item.key === "reportTime" ? "down" : "up";
    var achieved = direction === "up" ? current >= item.target : current <= item.target;
    var progressPct;
    if (item.target === 0) {
      progressPct = current === 0 ? 100 : 0;
    } else if (direction === "up") {
      progressPct = Math.min(100, Math.round((current / item.target) * 100));
    } else {
      progressPct = Math.min(100, Math.round((item.target / Math.max(current, item.target)) * 100));
    }

    return {
      label: item.label,
      current: current,
      target: item.target,
      unit: item.unit,
      achieved: achieved,
      progressPct: progressPct
    };
  });

  grid.innerHTML = items.map(function (it) {
    return (
      '<article class="hub-scorecard-card">' +
        '<div class="hub-scorecard-label">' + it.label + '</div>' +
        '<div class="hub-scorecard-values">' +
          '<span class="hub-scorecard-current">' + it.current + it.unit + '</span>' +
          '<span class="hub-scorecard-arrow">&rarr;</span>' +
          '<span class="hub-scorecard-target">' + it.target + it.unit + '</span>' +
        '</div>' +
        '<div class="hub-scorecard-bar-track"><div class="hub-scorecard-bar-fill" style="width:' + it.progressPct + '%"></div></div>' +
        '<span class="hub-scorecard-status ' + (it.achieved ? "done" : "progress") + '">' + (it.achieved ? "Tercapai" : it.progressPct + "% menuju target") + '</span>' +
      '</article>'
    );
  }).join("");
}

function renderLeaderboardTable(data) {
  var tbody = document.getElementById("hub-leaderboard-body");
  if (!tbody) return;

  var sort = rmoHubState.leaderboardSort;
  var rows = data.leaderboard.slice().sort(function (a, b) {
    var dir = sort.dir === "asc" ? 1 : -1;
    var av = a[sort.key];
    var bv = b[sort.key];
    if (typeof av === "string") return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });

  var lowest = data.leaderboard.reduce(function (min, row) {
    return row.kpiScore < min.kpiScore ? row : min;
  }, data.leaderboard[0]);

  tbody.innerHTML = rows.map(function (row) {
    var isLowest = row.area === lowest.area;
    var rowHtml =
      '<tr class="' + (isLowest ? "is-lowest" : "") + '">' +
        "<td>" + row.area + "</td>" +
        "<td>" + row.compliance + "%</td>" +
        "<td>" + row.submit1w1c + "%</td>" +
        "<td>" + row.eligibleRate + "%</td>" +
        "<td>" + row.kpiScore + "</td>" +
      "</tr>";
    if (isLowest) {
      rowHtml +=
        '<tr class="hub-leaderboard-note-row"><td colspan="5">Catatan: ' +
        row.area +
        " skor KPI RMO terendah — buddy coaching dari Sosmed Ranger Tangerang.</td></tr>";
    }
    return rowHtml;
  }).join("");

  var headers = document.querySelectorAll("#hub-leaderboard-table th[data-sort]");
  headers.forEach(function (th) {
    th.classList.remove("sorted-asc", "sorted-desc");
    if (th.getAttribute("data-sort") === sort.key) {
      th.classList.add(sort.dir === "asc" ? "sorted-asc" : "sorted-desc");
    }
  });
}

function initLeaderboardSorting(data) {
  var headers = document.querySelectorAll("#hub-leaderboard-table th[data-sort]");
  headers.forEach(function (th) {
    th.addEventListener("click", function () {
      var key = th.getAttribute("data-sort");
      if (rmoHubState.leaderboardSort.key === key) {
        rmoHubState.leaderboardSort.dir = rmoHubState.leaderboardSort.dir === "asc" ? "desc" : "asc";
      } else {
        rmoHubState.leaderboardSort.key = key;
        rmoHubState.leaderboardSort.dir = "desc";
      }
      renderLeaderboardTable(data);
    });
  });
}

function renderCharts(data) {
  if (typeof Chart === "undefined") {
    console.warn("[RMO Hub] Chart.js belum termuat, grafik dilewati.");
    return;
  }

  var trendCanvas = document.getElementById("hub-chart-trend");
  if (trendCanvas) {
    new Chart(trendCanvas, {
      type: "line",
      data: {
        labels: data.trend.months,
        datasets: [{
          label: "KPI RMO Index",
          data: data.trend.kpiIndex,
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.14)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#d97706"
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } }
      }
    });
  }

  var eligibleCanvas = document.getElementById("hub-chart-eligible");
  if (eligibleCanvas) {
    var areas = data.leaderboard.map(function (row) { return row.area; });
    var rates = data.leaderboard.map(function (row) { return row.eligibleRate; });

    new Chart(eligibleCanvas, {
      data: {
        labels: areas,
        datasets: [
          {
            type: "bar",
            label: "Eligible rate",
            data: rates,
            backgroundColor: "#f59e0b",
            borderRadius: 8,
            maxBarThickness: 36
          },
          {
            type: "line",
            label: "Target 40%",
            data: areas.map(function () { return 40; }),
            borderColor: "#ef4444",
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } }
      }
    });
  }
}

function renderRoadmap(data) {
  var track = document.getElementById("hub-roadmap-track");
  if (!track) return;

  var nodesHtml =
    '<div class="hub-roadmap-node is-now">' +
      '<div class="hub-roadmap-dot"></div>' +
      '<div class="hub-roadmap-month">Sekarang</div>' +
      '<div class="hub-roadmap-label">' + data.meta.now + '</div>' +
    '</div>' +
    '<div class="hub-roadmap-connector"></div>';

  nodesHtml += data.roadmap.map(function (item, index) {
    var node =
      '<div class="hub-roadmap-node">' +
        '<div class="hub-roadmap-dot"></div>' +
        '<div class="hub-roadmap-month">' + item.month + '</div>' +
        '<div class="hub-roadmap-label">' + item.label + '</div>' +
      '</div>';
    if (index < data.roadmap.length - 1) {
      node += '<div class="hub-roadmap-connector"></div>';
    }
    return node;
  }).join("");

  track.innerHTML = nodesHtml;
}

function onRmoHubOpen() {
  if (rmoHubState.chartsInitialized) return;
  renderCharts(window.RMO_HUB_DATA);
  rmoHubState.chartsInitialized = true;
}

function openModulePreview(moduleId) {
  var data = window.RMO_HUB_DATA;
  var module = data.modules.filter(function (m) { return m.id === moduleId; })[0];
  if (!module) return;

  var content = document.getElementById("hub-preview-content");
  if (!content) return;

  var kpisHtml = module.kpis.map(function (kpi) {
    return (
      '<div class="hub-module-kpi-row">' +
        '<span class="hub-module-kpi-label">' + kpi.label + '</span>' +
        '<span class="hub-module-kpi-value">' + kpi.value + '</span>' +
      '</div>'
    );
  }).join("");

  var timelineHtml = "";
  if (module.previewTimeline && module.previewTimeline.length) {
    timelineHtml =
      '<div class="hub-preview-kpis-label">Timeline</div>' +
      '<div class="hub-preview-timeline">' +
      module.previewTimeline.map(function (t) {
        return (
          '<div class="hub-preview-timeline-item">' +
            '<span class="hub-preview-timeline-phase">' + t.phase + '</span>' +
            '<span>' + t.text + '</span>' +
          '</div>'
        );
      }).join("") +
      '</div>';
  }

  content.innerHTML =
    '<div class="hub-module-badge badge-build" style="margin-bottom:10px;">' + rmoHubFormatBadge(module.status, module.targetDate) + '</div>' +
    '<div class="hub-preview-title">' + module.name + '</div>' +
    '<div class="hub-preview-desc">' + module.description + '</div>' +
    '<div class="hub-preview-kpis">' +
      '<div class="hub-preview-kpis-label">KPI yang akan diukur</div>' +
      kpisHtml +
    '</div>' +
    timelineHtml;

  var modal = document.getElementById("hub-module-preview");
  if (modal) modal.classList.add("open");
}

function closeModulePreview() {
  var modal = document.getElementById("hub-module-preview");
  if (modal) modal.classList.remove("open");
}

function initRmoHub() {
  var data = window.RMO_HUB_DATA;
  if (!data) return;

  if (typeof validateRmoHubData === "function") {
    validateRmoHubData(data);
  }

  renderHubHeader(data);
  renderHubFilters(data);

  var kpiIndexResult = computeKpiIndex(data);
  renderKpiGauge(kpiIndexResult.score);
  renderKpiBreakdown(kpiIndexResult);
  renderScorecard(data, kpiIndexResult);

  renderHubModuleGrid(data);

  renderLeaderboardTable(data);
  initLeaderboardSorting(data);
  renderRoadmap(data);

  var previewModal = document.getElementById("hub-module-preview");
  if (previewModal) {
    previewModal.addEventListener("click", function (event) {
      if (event.target === previewModal) closeModulePreview();
    });
  }
}

document.addEventListener("DOMContentLoaded", initRmoHub);

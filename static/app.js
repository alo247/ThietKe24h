document.addEventListener("DOMContentLoaded", () => {
  const deptCarousel = document.getElementById("deptCarousel");
  const stackContainer = document.getElementById("stackSectionsContainer");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");
  const drawerItemName = document.getElementById("drawerItemName");
  const drawerTypeBadge = document.getElementById("drawerTypeBadge");
  const drawerDesc = document.getElementById("drawerDesc");
  const drawerCodeContent = document.getElementById("drawerCodeContent");
  const copyContentBtn = document.getElementById("copyContentBtn");
  const openFolderBtn = document.getElementById("openFolderBtn");

  let stackData = null;
  let currentFilter = "all";

  // Mascot SVG generator
  function getMascotSvg(color, id) {
    if (id === "director") {
      return `
        <svg viewBox="0 0 80 80" width="48" height="48">
          <circle cx="40" cy="40" r="32" fill="#0f172a"/>
          <circle cx="28" cy="38" r="9" fill="#ffffff"/>
          <circle cx="28" cy="38" r="5" fill="#0f172a"/>
          <circle cx="52" cy="38" r="9" fill="#ffffff"/>
          <circle cx="52" cy="38" r="5" fill="#0f172a"/>
          <ellipse cx="40" cy="54" rx="7" ry="2" fill="#ffffff" opacity="0.6"/>
        </svg>`;
    } else if (id === "engine") {
      return `
        <svg viewBox="0 0 80 80" width="48" height="48">
          <path d="M40 10 C40 10 64 42 64 54 C64 68 53 74 40 74 C27 74 16 68 16 54 C16 42 40 10 40 10 Z" fill="#06b6d4"/>
          <circle cx="32" cy="50" r="4" fill="#ffffff"/>
          <circle cx="48" cy="50" r="4" fill="#ffffff"/>
        </svg>`;
    } else if (id === "art-audio") {
      return `
        <svg viewBox="0 0 80 80" width="48" height="48">
          <path d="M40 12 C58 12 70 28 68 50 C66 66 54 72 40 72 C26 72 14 66 12 50 C10 28 22 12 40 12 Z" fill="#ec4899"/>
          <circle cx="30" cy="42" r="3" fill="#ffffff"/>
          <circle cx="40" cy="42" r="3" fill="#ffffff"/>
          <circle cx="50" cy="42" r="3" fill="#ffffff"/>
        </svg>`;
    } else if (id === "qa") {
      return `
        <svg viewBox="0 0 80 80" width="48" height="48">
          <rect x="14" y="18" width="52" height="52" rx="20" fill="#10b981"/>
          <ellipse cx="30" cy="42" rx="4" ry="7" fill="#ffffff"/>
          <ellipse cx="50" cy="42" rx="4" ry="7" fill="#ffffff"/>
        </svg>`;
    } else if (id === "code") {
      return `
        <svg viewBox="0 0 80 80" width="48" height="48">
          <rect x="12" y="24" width="56" height="42" rx="16" fill="#3b82f6"/>
          <circle cx="28" cy="44" r="5" fill="#ffffff"/>
          <circle cx="52" cy="44" r="5" fill="#ffffff"/>
        </svg>`;
    } else if (id === "story") {
      return `
        <svg viewBox="0 0 80 80" width="48" height="48">
          <polygon points="40,14 66,28 66,58 40,72 14,58 14,28" fill="#f59e0b"/>
          <circle cx="32" cy="42" r="4" fill="#ffffff"/>
          <circle cx="48" cy="42" r="4" fill="#ffffff"/>
        </svg>`;
    } else if (id === "release") {
      return `
        <svg viewBox="0 0 80 80" width="48" height="48">
          <polygon points="40,12 68,68 12,68" rx="12" fill="#f97316"/>
          <circle cx="34" cy="48" r="4" fill="#ffffff"/>
          <circle cx="46" cy="48" r="4" fill="#ffffff"/>
        </svg>`;
    } else {
      // Design (Purple)
      return `
        <svg viewBox="0 0 80 80" width="48" height="48">
          <circle cx="40" cy="44" r="30" fill="#8b5cf6"/>
          <circle cx="28" cy="42" r="5" fill="#ffffff"/>
          <circle cx="52" cy="42" r="5" fill="#ffffff"/>
        </svg>`;
    }
  }

  // Fetch Data
  fetch("/api/stack")
    .then(res => res.json())
    .then(data => {
      stackData = data;
      renderCarousel(data.departments);
      renderSections(data.departments);
    });

  // Render 8 Carousel Mascot Cards
  function renderCarousel(depts) {
    deptCarousel.innerHTML = "";
    depts.forEach(dept => {
      const card = document.createElement("div");
      card.className = `dept-card ${dept.id === 'art-audio' ? 'active' : ''}`;
      card.id = `card-${dept.id}`;

      let pillClass = "dept-status-pill";
      if (dept.id === "art-audio") pillClass += " highlight";
      if (dept.status.includes("in")) pillClass += " green-in";

      card.innerHTML = `
        <span class="dept-header-name">${dept.name}</span>
        <div class="dept-mascot">
          ${getMascotSvg(dept.color, dept.id)}
        </div>
        <span class="dept-lead-name">${dept.lead}</span>
        <span class="${pillClass}">${dept.status}</span>
      `;

      card.addEventListener("click", () => {
        document.querySelectorAll(".dept-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        const targetSection = document.getElementById(`section-${dept.id}`);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      deptCarousel.appendChild(card);
    });
  }

  // Render Department Sections
  function renderSections(depts) {
    stackContainer.innerHTML = "";

    depts.forEach(dept => {
      const filteredItems = dept.items.filter(item => {
        if (currentFilter === "all") return true;
        return item.type === currentFilter;
      });

      if (filteredItems.length === 0) return;

      const sec = document.createElement("div");
      sec.className = "section-card";
      sec.id = `section-${dept.id}`;

      const tagClass = `tag-${dept.tag.toLowerCase()}`;

      sec.innerHTML = `
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-name">${dept.name}</span>
            <span class="section-badge-tag ${tagClass}">${dept.tag}</span>
          </div>
          <span class="section-summary">${dept.bots_count} bots + ${dept.skills_count} skills + ${dept.lead.replace('@', '')}</span>
        </div>
        <div class="items-table" id="table-${dept.id}">
        </div>
      `;

      const table = sec.querySelector(`#table-${dept.id}`);
      filteredItems.forEach(item => {
        const row = document.createElement("div");
        const isSelected = (item.id === "074"); // highlight asset-spec as in screenshot
        row.className = `item-row ${isSelected ? 'selected-pink' : ''}`;

        const isBot = item.type === "bot";
        const isSkill = item.type === "skill";
        const isGate = item.type === "gate";

        let nameClass = isBot ? "bot-name" : isSkill ? "skill-name" : "gate-name";
        let prefix = isBot ? "@" : "";
        let badgeClass = isBot ? "badge-bot" : isSkill ? "badge-skill" : "badge-gate";

        row.innerHTML = `
          <div class="item-left">
            <span class="item-id">${item.id}</span>
            <span class="item-name ${nameClass}">${prefix}${item.name}</span>
          </div>
          <div class="item-right">
            <span class="item-desc">${item.desc}</span>
            <span class="item-type-badge ${badgeClass}">${item.type.toUpperCase()}</span>
          </div>
        `;

        row.addEventListener("click", () => {
          openDrawer(item);
        });

        table.appendChild(row);
      });

      stackContainer.appendChild(sec);
    });
  }

  // Open Drawer and Fetch Content
  function openDrawer(item) {
    drawerItemName.textContent = (item.type === 'bot' ? '@' : '') + item.name;
    drawerTypeBadge.textContent = item.type.toUpperCase();
    drawerTypeBadge.className = `drawer-badge badge-${item.type}`;
    drawerDesc.textContent = item.desc;
    drawerCodeContent.textContent = "Đang đọc dữ liệu từ kho lưu trữ...";

    drawerOverlay.classList.add("active");

    fetch(`/api/item/${item.type}/${item.name}`)
      .then(res => res.json())
      .then(data => {
        drawerCodeContent.textContent = data.content;
      })
      .catch(() => {
        drawerCodeContent.textContent = "Không thể đọc nội dung file.";
      });
  }

  // Close Drawer
  drawerCloseBtn.addEventListener("click", () => {
    drawerOverlay.classList.remove("active");
  });
  drawerOverlay.addEventListener("click", (e) => {
    if (e.target === drawerOverlay) {
      drawerOverlay.classList.remove("active");
    }
  });

  // Copy Content Button
  copyContentBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(drawerCodeContent.textContent).then(() => {
      const oldText = copyContentBtn.textContent;
      copyContentBtn.textContent = "✅ Đã sao chép!";
      setTimeout(() => copyContentBtn.textContent = oldText, 2000);
    });
  });

  // Open Local Folder
  openFolderBtn.addEventListener("click", () => {
    alert("Thư mục đã được tải về máy tại:\nC:\\Users\\alo24\\.gemini\\antigravity-ide\\scratch\\claude_code_game_studios");
  });

  // Filters
  document.querySelectorAll(".pill-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pill-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      if (stackData) {
        renderSections(stackData.departments);
      }
    });
  });
});

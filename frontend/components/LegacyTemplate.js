import { promises as fs } from "node:fs";
import path from "node:path";
import { localHrefMaps } from "@/lib/route-map";

const demoRootCandidates = [
  path.join(process.cwd(), "Spinova Demo"),
  path.join(process.cwd(), "..", "Spinova Demo")
];

async function resolveDemoFile(relativeFile) {
  for (const root of demoRootCandidates) {
    try {
      const p = path.join(root, relativeFile);
      await fs.access(p);
      return p;
    } catch {}
  }
  return path.join(demoRootCandidates[0], relativeFile);
}

function buildTopbarUser(user) {
  return `
    <div class="topbar-user" id="topbar-user">
      <span class="role-badge">${user.role.toUpperCase()}</span>
      <span>${user.name}</span>
      <button class="logout-btn" onclick="logout()">Logout</button>
    </div>
  `;
}

function extractHeadAssets(source) {
  const styleBlocks = source.match(/<style[\s\S]*?<\/style>/gi) || [];
  const stylesheetLinks = source.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
  return [...stylesheetLinks, ...styleBlocks].join("");
}

function buildDataScript(file, user) {
  const scripts = {
    "admin/dashboard.html": `
      (async function () {
        const escapeHtml = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        const toDate = (value) => {
          if (!value) return "—";
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) return "—";
          return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
        };
        const normalizeStatus = (value) => String(value || "draft").toLowerCase();
        const reportBadge = (statusRaw) => {
          const status = normalizeStatus(statusRaw);
          if (status.includes("publish")) return '<span class="badge badge-green">Published</span>';
          if (status.includes("pending")) return '<span class="badge badge-orange">Pending Approval</span>';
          if (status.includes("process")) return '<span class="badge badge-blue">Processing</span>';
          return '<span class="badge">Draft</span>';
        };
        const reportAction = (statusRaw) => {
          const status = normalizeStatus(statusRaw);
          if (status.includes("pending")) return '<a href="/admin/reports/pending" class="btn btn-primary btn-sm">Review</a>';
          if (status.includes("publish")) return '<a href="/admin/reports" class="btn btn-ghost btn-sm">View</a>';
          return "—";
        };
        try {
          const [playersRes, coachesRes, reportsRes] = await Promise.all([
            fetch("/api/players", { cache: "no-store" }),
            fetch("/api/coaches", { cache: "no-store" }),
            fetch("/api/reports", { cache: "no-store" })
          ]);
          const [playersJson, coachesJson, reportsJson] = await Promise.all([
            playersRes.ok ? playersRes.json() : { items: [] },
            coachesRes.ok ? coachesRes.json() : { items: [] },
            reportsRes.ok ? reportsRes.json() : { items: [] }
          ]);
          const players = Array.isArray(playersJson.items) ? playersJson.items : [];
          const coaches = Array.isArray(coachesJson.items) ? coachesJson.items : [];
          const reports = Array.isArray(reportsJson.items) ? reportsJson.items : [];
          const pendingProfiles =
            players.filter((item) => String(item.status || "").toLowerCase().includes("pending")).length +
            coaches.filter((item) => String(item.status || "").toLowerCase().includes("pending")).length;
          const pendingReports = reports.filter((item) => normalizeStatus(item.status).includes("pending")).length;
          const statNodes = document.querySelectorAll(".stat-row .stat-box .stat-num");
          if (statNodes.length >= 4) {
            statNodes[0].textContent = String(pendingProfiles);
            statNodes[1].textContent = String(pendingReports);
            statNodes[2].textContent = String(players.length);
            statNodes[3].textContent = String(coaches.length);
          }
          const recentBody = document.querySelector(".table-wrap table.sp-table tbody");
          if (recentBody) {
            const recent = reports.slice(0, 5);
            recentBody.innerHTML = recent.length
              ? recent
                  .map((item) => {
                    const teams = item.teams?.name || "—";
                    return [
                      "<tr>",
                      "<td>" + escapeHtml(item.title || "Untitled Report") + "</td>",
                      "<td>" + escapeHtml(teams) + "</td>",
                      "<td>" + escapeHtml(toDate(item.created_at)) + "</td>",
                      "<td>" + reportBadge(item.status) + "</td>",
                      "<td>" + reportAction(item.status) + "</td>",
                      "</tr>"
                    ].join("");
                  })
                  .join("")
              : '<tr><td colspan="5">No reports available.</td></tr>';
          }
        } catch (error) {
          console.error("dashboard data load failed", error);
        }
      })();
    `,
    "admin/reports.html": `
      (async function () {
        const escapeHtml = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        const toDate = (value) => {
          if (!value) return "—";
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) return "—";
          return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
        };
        const normalizeStatus = (value) => String(value || "draft").toLowerCase();
        const badge = (statusRaw) => {
          const status = normalizeStatus(statusRaw);
          if (status.includes("publish")) return '<span class="badge badge-green">Published</span>';
          if (status.includes("pending")) return '<span class="badge badge-orange">Pending Approval</span>';
          if (status.includes("process")) return '<span class="badge badge-blue">Processing</span>';
          return '<span class="badge">Draft</span>';
        };
        const action = (statusRaw) => {
          const status = normalizeStatus(statusRaw);
          if (status.includes("pending")) return '<a href="/admin/reports/pending" class="btn btn-primary btn-sm">Review</a>';
          if (status.includes("publish")) return '<a href="/admin/reports" class="btn btn-ghost btn-sm">View</a>';
          return "—";
        };
        try {
          const response = await fetch("/api/reports", { cache: "no-store" });
          if (!response.ok) return;
          const payload = await response.json();
          const allReports = Array.isArray(payload.items) ? payload.items : [];
          const tableBody = document.querySelector(".table-wrap table.sp-table tbody");
          if (!tableBody) return;
          const tabs = Array.from(document.querySelectorAll(".filter-tabs .tab"));
          const renderRows = (filter) => {
            const rows = allReports.filter((item) => {
              const status = normalizeStatus(item.status);
              if (filter === "all") return true;
              if (filter === "pending") return status.includes("pending");
              if (filter === "published") return status.includes("publish");
              if (filter === "processing") return status.includes("process");
              if (filter === "draft") return !status || status.includes("draft");
              return true;
            });
            tableBody.innerHTML = rows.length
              ? rows
                  .map((item) => {
                    return [
                      "<tr>",
                      "<td>" + escapeHtml(item.title || "Untitled Report") + "</td>",
                      "<td>" + escapeHtml(item.teams?.name || "—") + "</td>",
                      "<td>" + escapeHtml(toDate(item.created_at)) + "</td>",
                      "<td>" + badge(item.status) + "</td>",
                      "<td>—</td>",
                      "<td>" + action(item.status) + "</td>",
                      "</tr>"
                    ].join("");
                  })
                  .join("")
              : '<tr><td colspan="6">No reports found.</td></tr>';
          };
          tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
              tabs.forEach((node) => node.classList.remove("active"));
              tab.classList.add("active");
              renderRows(String(tab.textContent || "All").trim().toLowerCase());
            });
          });
          renderRows("all");
        } catch (error) {
          console.error("reports data load failed", error);
        }
      })();
    `,
    "admin/profiles-players.html": `
      (async function () {
        const escapeHtml = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        try {
          const response = await fetch("/api/players", { cache: "no-store" });
          if (!response.ok) return;
          const payload = await response.json();
          const allPlayers = Array.isArray(payload.items) ? payload.items : [];
          const tableBody = document.querySelector(".table-wrap table.sp-table tbody");
          const searchInput = document.querySelector('input[placeholder="Search players..."]');
          if (!tableBody) return;
          const renderRows = (query) => {
            const normalizedQuery = String(query || "").toLowerCase().trim();
            const rows = allPlayers.filter((item) => {
              if (!normalizedQuery) return true;
              const fullName = (item.first_name || "") + " " + (item.last_name || "");
              return fullName.toLowerCase().includes(normalizedQuery);
            });
            tableBody.innerHTML = rows.length
              ? rows
                  .map((item) => {
                    const fullName = [item.first_name, item.last_name].filter(Boolean).join(" ") || "Unknown Player";
                    return [
                      "<tr>",
                      "<td>" + escapeHtml(fullName) + "</td>",
                      '<td><span class="badge badge-navy">' + escapeHtml(item.position || "—") + "</span></td>",
                      "<td>" + escapeHtml(item.teams?.name || "—") + "</td>",
                      "<td>" + escapeHtml(item.status || "active") + "</td>",
                      "<td>—</td>",
                      '<td><a href="#" class="btn btn-ghost btn-sm">View</a></td>',
                      "</tr>"
                    ].join("");
                  })
                  .join("")
              : '<tr><td colspan="6">No players found.</td></tr>';
          };
          if (searchInput) {
            searchInput.addEventListener("input", (event) => renderRows(event.target.value));
          }
          renderRows("");
        } catch (error) {
          console.error("players data load failed", error);
        }
      })();
    `,
    "admin/profiles-coaches.html": `
      (async function () {
        const escapeHtml = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        try {
          const response = await fetch("/api/coaches", { cache: "no-store" });
          if (!response.ok) return;
          const payload = await response.json();
          const coaches = Array.isArray(payload.items) ? payload.items : [];
          const tableBody = document.querySelector(".table-wrap table.sp-table tbody");
          if (!tableBody) return;
          tableBody.innerHTML = coaches.length
            ? coaches
                .map((item) => {
                  const fullName = [item.first_name, item.last_name].filter(Boolean).join(" ") || "Unknown Coach";
                  return [
                    "<tr>",
                    "<td>" + escapeHtml(fullName) + "</td>",
                    "<td>" + escapeHtml(item.email || "—") + "</td>",
                    "<td>" + escapeHtml(item.status || "active") + "</td>",
                    "<td>—</td>",
                    '<td><a href="#" class="btn btn-ghost btn-sm">View</a></td>',
                    "</tr>"
                  ].join("");
                })
                .join("")
            : '<tr><td colspan="5">No coaches found.</td></tr>';
        } catch (error) {
          console.error("coaches data load failed", error);
        }
      })();
    `,
    "admin/users-invite.html": `
      (function () {
        const roleCards = Array.from(document.querySelectorAll(".role-card[data-role]"));
        const firstNameInput = document.querySelector('input[placeholder="First Name"]');
        const lastNameInput = document.querySelector('input[placeholder="Last Name"]');
        const emailInput = document.querySelector('input[type="email"]');
        const submitButton = document.querySelector(".btn.btn-primary.btn-lg");
        const card = document.querySelector(".page-container .card");
        let selectedRole = "player";
        const showMessage = (message, isError) => {
          let node = document.getElementById("invite-result-message");
          if (!node) {
            node = document.createElement("p");
            node.id = "invite-result-message";
            node.style.marginTop = "12px";
            node.style.fontSize = "13px";
            card?.appendChild(node);
          }
          node.style.color = isError ? "#d53939" : "#1f7a1f";
          node.textContent = message;
        };
        roleCards.forEach((roleCard) => {
          roleCard.addEventListener("click", () => {
            selectedRole = roleCard.dataset.role || "player";
            roleCards.forEach((item) => item.classList.remove("selected"));
            roleCard.classList.add("selected");
          });
        });
        submitButton?.addEventListener("click", async () => {
          const firstName = String(firstNameInput?.value || "").trim();
          const lastName = String(lastNameInput?.value || "").trim();
          const email = String(emailInput?.value || "").trim();
          if (!firstName || !lastName) {
            showMessage("First and last name are required.", true);
            return;
          }
          try {
            submitButton.disabled = true;
            submitButton.textContent = "Saving...";
            const endpoint = selectedRole === "coach" ? "/api/coaches" : "/api/players";
            const body = selectedRole === "coach"
              ? { firstName, lastName, email, status: "active" }
              : { firstName, lastName, status: "active" };
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            });
            if (!response.ok) {
              const payload = await response.json().catch(() => ({}));
              throw new Error(payload.error || "Failed to create profile.");
            }
            firstNameInput.value = "";
            lastNameInput.value = "";
            if (emailInput) emailInput.value = "";
            showMessage(selectedRole === "coach" ? "Coach profile created." : "Player profile created.", false);
          } catch (error) {
            showMessage(error.message || "Failed to create profile.", true);
          } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send Invite Email →";
          }
        });
      })();
    `,
    "onboarding/player.html": `
      (function () {
        let currentStep = 1;
        const totalSteps = 6;
        const langEn = document.getElementById("lang-en");
        const langAr = document.getElementById("lang-ar");
        const form = document.getElementById("onboarding-form");
        const nextButtons = form ? Array.from(form.querySelectorAll('button[onclick="nextStep()"]')) : [];
        const prevButtons = form ? Array.from(form.querySelectorAll('button[onclick="prevStep()"]')) : [];
        const fullNameInput = document.querySelector('input[placeholder="Ali Ahmed"]');
        const dobInput = document.querySelector('input[type="date"]');
        const emailInput = document.querySelector('input[placeholder="player@email.com"]');
        const positionSelect = document.querySelector('[data-step="2"] select.input');
        const dominantHandSelect = document.querySelectorAll('[data-step="2"] select.input')[2];
        const heightInput = document.querySelector('input[placeholder="183"]');
        const weightInput = document.querySelector('input[placeholder="78"]');
        const photoInput = document.querySelector('input[type="file"]');
        const submitButton = form?.querySelector('button[type="submit"]');
        const showMessage = (message, isError) => {
          let node = document.getElementById("onboarding-result-message");
          if (!node) {
            node = document.createElement("p");
            node.id = "onboarding-result-message";
            node.style.marginTop = "12px";
            node.style.fontSize = "13px";
            node.style.textAlign = "center";
            form?.appendChild(node);
          }
          node.style.color = isError ? "#d53939" : "#1f7a1f";
          node.textContent = message;
        };
        const updateProgress = () => {
          const steps = document.querySelectorAll(".progress-step");
          const contents = document.querySelectorAll(".step-content");
          steps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove("active", "completed");
            if (stepNum < currentStep) step.classList.add("completed");
            if (stepNum === currentStep) step.classList.add("active");
          });
          contents.forEach((content) => {
            content.classList.toggle("active", Number(content.dataset.step) === currentStep);
          });
        };
        const nextStep = () => {
          if (currentStep < totalSteps) {
            currentStep += 1;
            updateProgress();
          }
        };
        const prevStep = () => {
          if (currentStep > 1) {
            currentStep -= 1;
            updateProgress();
          }
        };
        window.nextStep = nextStep;
        window.prevStep = prevStep;
        nextButtons.forEach((btn) => btn.addEventListener("click", nextStep));
        prevButtons.forEach((btn) => btn.addEventListener("click", prevStep));
        langEn?.addEventListener("click", () => {
          langEn.classList.add("active");
          langAr?.classList.remove("active");
          document.documentElement.setAttribute("dir", "ltr");
        });
        langAr?.addEventListener("click", () => {
          langAr.classList.add("active");
          langEn?.classList.remove("active");
          document.documentElement.setAttribute("dir", "rtl");
        });
        async function fileToDataUrl(file) {
          if (!file) return null;
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
        form?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const avatarUrl = await fileToDataUrl(photoInput?.files?.[0]);
          const payload = {
            fullName: fullNameInput?.value,
            dateOfBirth: dobInput?.value,
            email: emailInput?.value,
            position: positionSelect?.value,
            dominantHand: dominantHandSelect?.value,
            heightCm: heightInput?.value ? Number(heightInput.value) : null,
            weightKg: weightInput?.value ? Number(weightInput.value) : null,
            avatarUrl
          };
          if (!String(payload.fullName || "").trim()) {
            showMessage("Full name is required.", true);
            currentStep = 1;
            updateProgress();
            return;
          }
          try {
            if (submitButton) {
              submitButton.disabled = true;
              submitButton.textContent = "Saving...";
            }
            const response = await fetch("/api/onboarding/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              const payloadError = await response.json().catch(() => ({}));
              throw new Error(payloadError.error || "Could not save your profile.");
            }
            window.location.href = "/onboarding/complete";
          } catch (error) {
            showMessage(error.message || "Could not save your profile.", true);
          } finally {
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = "Complete Profile →";
            }
          }
        });
      })();
    `,
    "onboarding/coach.html": `
      (function () {
        let currentStep = 1;
        const totalSteps = 6;
        const langEn = document.getElementById("lang-en");
        const langAr = document.getElementById("lang-ar");
        const form = document.getElementById("onboarding-form");
        const nextButtons = form ? Array.from(form.querySelectorAll('button[onclick="nextStep()"]')) : [];
        const prevButtons = form ? Array.from(form.querySelectorAll('button[onclick="prevStep()"]')) : [];
        const fullNameInput = document.querySelector('input[placeholder="Coach Omar Salah"]');
        const phoneInput = document.querySelector('input[placeholder="+966..."]');
        const emailInput = document.querySelector('input[placeholder="coach@email.com"]');
        const specializationInput = document.querySelector('input[placeholder="FIBA Level 2"]');
        const photoInput = document.querySelector('input[type="file"]');
        const submitButton = form?.querySelector('button[type="submit"]');
        const showMessage = (message, isError) => {
          let node = document.getElementById("onboarding-result-message");
          if (!node) {
            node = document.createElement("p");
            node.id = "onboarding-result-message";
            node.style.marginTop = "12px";
            node.style.fontSize = "13px";
            node.style.textAlign = "center";
            form?.appendChild(node);
          }
          node.style.color = isError ? "#d53939" : "#1f7a1f";
          node.textContent = message;
        };
        const updateProgress = () => {
          const steps = document.querySelectorAll(".progress-step");
          const contents = document.querySelectorAll(".step-content");
          steps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove("active", "completed");
            if (stepNum < currentStep) step.classList.add("completed");
            if (stepNum === currentStep) step.classList.add("active");
          });
          contents.forEach((content) => {
            content.classList.toggle("active", Number(content.dataset.step) === currentStep);
          });
        };
        const nextStep = () => {
          if (currentStep < totalSteps) {
            currentStep += 1;
            updateProgress();
          }
        };
        const prevStep = () => {
          if (currentStep > 1) {
            currentStep -= 1;
            updateProgress();
          }
        };
        window.nextStep = nextStep;
        window.prevStep = prevStep;
        nextButtons.forEach((btn) => btn.addEventListener("click", nextStep));
        prevButtons.forEach((btn) => btn.addEventListener("click", prevStep));
        langEn?.addEventListener("click", () => {
          langEn.classList.add("active");
          langAr?.classList.remove("active");
          document.documentElement.setAttribute("dir", "ltr");
        });
        langAr?.addEventListener("click", () => {
          langAr.classList.add("active");
          langEn?.classList.remove("active");
          document.documentElement.setAttribute("dir", "rtl");
        });
        async function fileToDataUrl(file) {
          if (!file) return null;
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
        form?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const avatarUrl = await fileToDataUrl(photoInput?.files?.[0]);
          const payload = {
            fullName: fullNameInput?.value,
            phone: phoneInput?.value,
            email: emailInput?.value,
            specialization: specializationInput?.value,
            avatarUrl
          };
          if (!String(payload.fullName || "").trim()) {
            showMessage("Full name is required.", true);
            currentStep = 1;
            updateProgress();
            return;
          }
          try {
            if (submitButton) {
              submitButton.disabled = true;
              submitButton.textContent = "Saving...";
            }
            const response = await fetch("/api/onboarding/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              const payloadError = await response.json().catch(() => ({}));
              throw new Error(payloadError.error || "Could not save your profile.");
            }
            window.location.href = "/onboarding/complete";
          } catch (error) {
            showMessage(error.message || "Could not save your profile.", true);
          } finally {
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = "Complete Profile →";
            }
          }
        });
      })();
    `,
    "onboarding/complete.html": `
      (function () {
        const role = ${JSON.stringify(user?.role || "player")};
        setTimeout(() => {
          if (role === "admin" || role === "coach" || role === "player") {
            window.location.href = "/" + role + "/dashboard";
            return;
          }
          window.location.href = "/login";
        }, 1500);
      })();
    `,
    "player/dashboard.html": `
      (async function () {
        const escapeHtml = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        const toDate = (value) => {
          if (!value) return "—";
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) return "—";
          return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
        };
        try {
          const [profileRes, reportsRes] = await Promise.all([
            fetch("/api/profile/me", { cache: "no-store" }),
            fetch("/api/reports", { cache: "no-store" })
          ]);
          if (!profileRes.ok) return;
          const profilePayload = await profileRes.json();
          const reportsPayload = reportsRes.ok ? await reportsRes.json() : { items: [] };
          const profile = profilePayload.item || {};
          const reports = Array.isArray(reportsPayload.items) ? reportsPayload.items : [];
          const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Player";
          const firstName = fullName.split(" ")[0] || "Player";
          const avatar = profile.users?.avatar_url || "../assets/images/avatar.webp";
          const position = profile.position || "Add from profile";
          const team = profile.teams?.name || "Add from profile";
          const heroTitle = document.querySelector(".hero h1");
          const heroSub = document.querySelector(".hero p");
          if (heroTitle) heroTitle.innerHTML = "Welcome back, <em>" + escapeHtml(firstName) + "</em>.";
          if (heroSub) heroSub.textContent = position + " · " + team;
          const statNums = document.querySelectorAll(".stat-row .stat-box .stat-num");
          if (statNums.length >= 3) {
            statNums[0].textContent = String(reports.length);
            statNums[1].textContent = String(reports.filter((item) => String(item.status || "").toLowerCase().includes("publish")).length);
            statNums[2].textContent = reports.length > 0 ? "100%" : "0%";
          }
          const summaryCard = document.querySelector(".card .card-title")?.closest(".card");
          if (summaryCard) {
            summaryCard.innerHTML = [
              '<div class="card-title">My Profile Summary</div>',
              '<div style="display: flex; gap: 20px; align-items: start; margin-top: 16px;">',
              '<img src="' + escapeHtml(avatar) + '" alt="Profile Avatar" class="avatar large" style="object-fit: cover;">',
              '<div style="flex: 1;">',
              '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;"><span class="badge badge-navy">' + escapeHtml(position) + "</span></div>",
              '<div style="font-size: 14px; color: var(--mid); margin-bottom: 8px;"><strong>Team:</strong> ' + escapeHtml(team) + "</div>",
              '<p style="color: var(--mid); font-size: 14px;">Profile synced from your onboarding details.</p>',
              '<a href="/player/profile" class="btn btn-primary btn-sm" style="margin-top: 16px;">View Full Profile →</a>',
              "</div></div>"
            ].join("");
          }
          const reportsGrid = document.querySelector(".page-header + .two-col");
          if (reportsGrid) {
            const recent = reports.slice(0, 2);
            reportsGrid.innerHTML = recent.length
              ? recent
                  .map((item) => [
                    '<div class="card interactive">',
                    '<div class="card-title">' + escapeHtml(item.title || "Untitled Report") + "</div>",
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">',
                    '<span style="font-size: 13px; color: var(--light);">' + escapeHtml(toDate(item.created_at)) + "</span>",
                    "</div>",
                    '<a href="/player/reports" class="btn btn-ghost btn-sm">View</a>',
                    "</div>"
                  ].join(""))
                  .join("")
              : '<div class="card"><div class="card-title">No reports yet</div><p style="color: var(--mid);">Reports will appear here once generated.</p></div>';
          }
        } catch (error) {
          console.error("player dashboard load failed", error);
        }
      })();
    `,
    "player/profile.html": `
      (async function () {
        const escapeHtml = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        const formatDate = (value) => {
          if (!value) return "Add from profile";
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) return "Add from profile";
          return parsed.toLocaleDateString();
        };
        try {
          const response = await fetch("/api/profile/me", { cache: "no-store" });
          if (!response.ok) return;
          const payload = await response.json();
          const item = payload.item || {};
          const fullName = [item.first_name, item.last_name].filter(Boolean).join(" ") || "Complete your profile";
          const position = item.position || "Add from profile";
          const team = item.teams?.name || "Add from profile";
          const hand = item.dominant_hand || "Add from profile";
          const status = item.status || "active";
          const height = item.height_cm ? item.height_cm + " cm" : "Add from profile";
          const weight = item.weight_kg ? item.weight_kg + " kg" : "Add from profile";
          const avatar = item.users?.avatar_url || "../assets/images/avatar.webp";
          const hero = document.querySelector(".hero .hero-content");
          if (hero) {
            hero.innerHTML = [
              '<img src="' + escapeHtml(avatar) + '" alt="Profile Avatar" class="avatar large" style="object-fit: cover;">',
              "<div>",
              '<div class="hero-eyebrow">My Profile</div>',
              "<h1>" + escapeHtml(fullName.split(" ")[0] || "My") + " <em>" + escapeHtml(fullName.split(" ").slice(1).join(" ") || "Profile") + "</em></h1>",
              '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">',
              '<span class="badge badge-navy">' + escapeHtml(position) + "</span>",
              '<span class="badge badge-green">' + escapeHtml(status) + "</span>",
              '<span class="badge badge-navy">' + escapeHtml(team) + "</span>",
              "</div>",
              "<p style='margin-top: 8px;'>" + escapeHtml(height) + " · " + escapeHtml(weight) + " · " + escapeHtml(hand) + "</p>",
              "</div>"
            ].join("");
          }
          const container = document.querySelector(".page-container");
          if (container) {
            container.innerHTML = [
              '<div class="card">',
              '<div class="card-title">Personal Information</div>',
              '<div class="two-col" style="margin-top: 12px;">',
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Full Name</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(fullName) + "</div></div>",
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Date of Birth</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(formatDate(item.date_of_birth)) + "</div></div>",
              "</div></div>",
              '<div class="card" style="margin-top:16px;">',
              '<div class="card-title">Basketball Profile</div>',
              '<div class="two-col" style="margin-top: 12px;">',
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Primary Position</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(position) + "</div></div>",
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Dominant Hand</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(hand) + "</div></div>",
              "</div>",
              '<div class="two-col" style="margin-top: 12px;">',
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Height</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(height) + "</div></div>",
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Weight</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(weight) + "</div></div>",
              "</div></div>",
              '<div class="card" style="margin-top:16px; border-top:3px solid var(--court);">',
              '<div class="card-title">Complete Remaining Details</div>',
              "<p style='color: var(--mid);'>Fields not captured in onboarding are intentionally left empty. Add them manually from your profile edit flow.</p>",
              "</div>"
            ].join("");
          }
        } catch (error) {
          console.error("player profile load failed", error);
        }
      })();
    `,
    "coach/profile.html": `
      (async function () {
        const escapeHtml = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
        try {
          const response = await fetch("/api/profile/me", { cache: "no-store" });
          if (!response.ok) return;
          const payload = await response.json();
          const item = payload.item || {};
          const fullName = [item.first_name, item.last_name].filter(Boolean).join(" ") || "Complete your profile";
          const specialization = item.specialization || "Add from profile";
          const phone = item.phone || "Add from profile";
          const email = item.email || "Add from profile";
          const status = item.status || "active";
          const team = item.teams?.name || "Add from profile";
          const avatar = item.users?.avatar_url || "../assets/images/avatar.webp";
          const hero = document.querySelector(".hero .hero-content");
          if (hero) {
            hero.innerHTML = [
              '<img src="' + escapeHtml(avatar) + '" alt="Profile Avatar" class="avatar large" style="object-fit: cover;">',
              "<div>",
              '<div class="hero-eyebrow">My Profile</div>',
              "<h1>" + escapeHtml(fullName.split(" ")[0] || "My") + " <em>" + escapeHtml(fullName.split(" ").slice(1).join(" ") || "Profile") + "</em></h1>",
              '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">',
              '<span class="badge badge-green">' + escapeHtml(specialization) + "</span>",
              '<span class="badge badge-navy">' + escapeHtml(status) + "</span>",
              '<span class="badge badge-navy">' + escapeHtml(team) + "</span>",
              "</div>",
              "<p style='margin-top: 8px;'>Phone: " + escapeHtml(phone) + "</p>",
              "</div>"
            ].join("");
          }
          const container = document.querySelector(".page-container");
          if (container) {
            container.innerHTML = [
              '<div class="card">',
              '<div class="card-title">Personal Information</div>',
              '<div class="two-col" style="margin-top: 12px;">',
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Full Name</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(fullName) + "</div></div>",
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Email</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(email) + "</div></div>",
              "</div>",
              '<div style="margin-top: 12px;"><div style="font-size: 12px; color: var(--light); text-transform: uppercase;">Phone</div><div style="font-weight: 600; color: var(--navy);">' + escapeHtml(phone) + "</div></div>",
              "</div>",
              '<div class="card" style="margin-top:16px;">',
              '<div class="card-title">Coaching Profile</div>',
              '<div class="two-col" style="margin-top: 12px;">',
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Specialization</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(specialization) + "</div></div>",
              "<div><div style='font-size: 12px; color: var(--light); text-transform: uppercase;'>Team</div><div style='font-weight: 600; color: var(--navy);'>" + escapeHtml(team) + "</div></div>",
              "</div></div>",
              '<div class="card" style="margin-top:16px; border-top:3px solid var(--court);">',
              '<div class="card-title">Complete Remaining Details</div>',
              "<p style='color: var(--mid);'>Fields outside onboarding are left empty by design so you can add them manually from profile settings.</p>",
              "</div>"
            ].join("");
          }
        } catch (error) {
          console.error("coach profile load failed", error);
        }
      })();
    `
  };
  const pageScript = scripts[file];
  if (!pageScript) return "";
  return `<script>${pageScript}</script>`;
}

function rewriteBody(body, role, user, file) {
  let html = body;
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  html = html.replace(
    '<div class="topbar-user" id="topbar-user"></div>',
    buildTopbarUser(user)
  );
  html = html.replace(/href="\.\.\/login\.html"/g, 'href="/login"');
  html = html.replace(/href="login\.html"/g, 'href="/login"');

  const map = localHrefMaps[role] || {};
  for (const [from, to] of Object.entries(map)) {
    html = html.split(from).join(to);
  }
  html += buildDataScript(file, user);
  return html;
}

export default async function LegacyTemplate({ file, role, user }) {
  const filePath = await resolveDemoFile(file);
  const source = await fs.readFile(filePath, "utf8");
  const headAssets = extractHeadAssets(source);
  const bodyMatch = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : source;
  const output = headAssets + rewriteBody(bodyHtml, role, user, file);

  return <div dangerouslySetInnerHTML={{ __html: output }} />;
}

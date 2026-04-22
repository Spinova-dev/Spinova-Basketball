export const demoUsers = [
  { email: "admin@spinova.app", password: "Admin2026!", name: "Khalid Al-Mansouri", role: "admin" },
  { email: "coach@spinova.app", password: "Coach2026!", name: "Omar Salah", role: "coach" },
  { email: "player@spinova.app", password: "Player2026!", name: "Ahmed Al-Rashidi", role: "player" }
];

export const players = [
  { name: "Ahmed Al-Rashidi", position: "PG", team: "Falcon U18 Elite", level: "Competitive", coach: "Omar Salah", status: "Published" },
  { name: "Youssef Samir", position: "SF", team: "Falcon U18 Elite", level: "Elite", coach: "Omar Salah", status: "Published" },
  { name: "Kareem Mostafa", position: "C", team: "-", level: "Competitive", coach: "-", status: "Pending" }
];

export const coaches = [
  { name: "Omar Salah", certification: "FIBA Level 2", status: "Academy-based", activeStudents: 12, profileStatus: "Published" },
  { name: "Hassan Al-Zahrawi", certification: "FIBA Level 3", status: "Independent", activeStudents: 0, profileStatus: "Pending" }
];

export const reports = [
  { id: "R01", title: "Falcon U18 vs Al-Nassr Youth", teams: "Falcon U18 · Al-Nassr Youth", date: "Apr 10, 2026", status: "Published", linked: "Ahmed, Youssef" },
  { id: "R02", title: "Falcon U18 vs Al-Ahly Youth", teams: "Falcon U18 · Al-Ahly Youth", date: "Apr 3, 2026", status: "Published", linked: "Ahmed, Youssef" },
  { id: "R03", title: "Saudi U20 Championship — Match 7", teams: "National U20 · Riyadh Stars", date: "Apr 15, 2026", status: "Pending", linked: "Ahmed, Youssef" },
  { id: "R04", title: "Falcon U18 vs Jeddah Eagles", teams: "Falcon U18 · Jeddah Eagles", date: "Apr 17, 2026", status: "Processing", linked: "Ahmed" }
];

export const teams = ["Falcon U18 Elite", "Al-Nassr Youth", "Al-Ahly Youth", "Jeddah Eagles", "Riyadh Stars", "National U20"];

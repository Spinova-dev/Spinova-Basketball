export const roleRouteToFile = {
  admin: {
    "dashboard": "admin/dashboard.html",
    "reports": "admin/reports.html",
    "reports/new": "admin/reports-new.html",
    "reports/pending": "admin/reports-pending.html",
    "reports/requested": "admin/reports-requested.html",
    "profiles/players": "admin/profiles-players.html",
    "profiles/coaches": "admin/profiles-coaches.html",
    "profiles/pending": "admin/profiles-pending.html",
    "users": "admin/users.html",
    "users/invite": "admin/users-invite.html",
    "settings": "admin/settings.html"
  },
  coach: {
    "dashboard": "coach/dashboard.html",
    "profile": "coach/profile.html",
    "team": "coach/team.html",
    "reports": "coach/reports.html"
  },
  player: {
    "dashboard": "player/dashboard.html",
    "profile": "player/profile.html",
    "reports": "player/reports.html",
    "reports/request": "player/reports-request.html"
  }
};

export const localHrefMaps = {
  admin: {
    'href="dashboard.html"': 'href="/admin/dashboard"',
    'href="reports.html"': 'href="/admin/reports"',
    'href="reports-new.html"': 'href="/admin/reports/new"',
    'href="reports-requested.html"': 'href="/admin/reports/requested"',
    'href="reports-pending.html"': 'href="/admin/reports/pending"',
    'href="profiles-players.html"': 'href="/admin/profiles/players"',
    'href="profiles-coaches.html"': 'href="/admin/profiles/coaches"',
    'href="profiles-pending.html"': 'href="/admin/profiles/pending"',
    'href="users.html"': 'href="/admin/users"',
    'href="users-invite.html"': 'href="/admin/users/invite"',
    'href="settings.html"': 'href="/admin/settings"'
  },
  coach: {
    'href="dashboard.html"': 'href="/coach/dashboard"',
    'href="profile.html"': 'href="/coach/profile"',
    'href="team.html"': 'href="/coach/team"',
    'href="reports.html"': 'href="/coach/reports"',
    'href="../player/reports-request.html"': 'href="/player/reports/request"'
  },
  player: {
    'href="dashboard.html"': 'href="/player/dashboard"',
    'href="profile.html"': 'href="/player/profile"',
    'href="reports.html"': 'href="/player/reports"',
    'href="reports-request.html"': 'href="/player/reports/request"',
    'href="../coach/reports-request.html"': 'href="/player/reports/request"'
  }
};

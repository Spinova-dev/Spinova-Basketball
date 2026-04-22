const demoUsers = [
  {
    email: 'admin@spinova.app',
    password: 'Admin2026!',
    name: 'Khalid Al-Mansouri',
    role: 'admin',
    redirect: 'admin/dashboard.html'
  },
  {
    email: 'coach@spinova.app',
    password: 'Coach2026!',
    name: 'Omar Salah',
    role: 'coach',
    redirect: 'coach/dashboard.html'
  },
  {
    email: 'player@spinova.app',
    password: 'Player2026!',
    name: 'Ahmed Al-Rashidi',
    role: 'player',
    redirect: 'player/dashboard.html'
  }
];

function login(email, password) {
  console.log('login() called with:', email, password);
  const user = demoUsers.find(u => u.email === email && u.password === password);
  console.log('Found demo user:', user);
  if (user) {
    const userData = {
      name: user.name,
      role: user.role,
      email: user.email
    };
    localStorage.setItem('spinova_user', JSON.stringify(userData));
    console.log('Saved to localStorage:', localStorage.getItem('spinova_user'));
    return { success: true, redirect: user.redirect };
  }
  return { success: false, error: 'Incorrect email or password' };
}

function getCurrentUser() {
  try {
    const user = localStorage.getItem('spinova_user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

function logout() {
  localStorage.removeItem('spinova_user');
  const pathParts = window.location.pathname.split('/');
  let loginPath = 'login.html';
  if (pathParts.includes('admin') || pathParts.includes('coach') || pathParts.includes('player') || pathParts.includes('onboarding')) {
    loginPath = '../login.html';
  }
  window.location.href = loginPath;
}

function checkAuth(allowedRoles) {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.href = '../' + user.role + '/dashboard.html';
    return false;
  }
  return true;
}

function setActiveNav() {
  const links = document.querySelectorAll('.sidenav a');
  const currentPage = window.location.href.split('/').pop();
  links.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function initTopbar() {
  console.log('initTopbar() called');
  const user = getCurrentUser();
  console.log('Current user:', user);
  const topbarUser = document.getElementById('topbar-user');
  console.log('topbarUser element:', topbarUser);
  
  if (topbarUser && user) {
    topbarUser.innerHTML = `
      <span class="role-badge">${user.role.toUpperCase()}</span>
      <span>${user.name}</span>
      <button class="logout-btn" onclick="logout()">Logout</button>
    `;
    console.log('Topbar content set');
  } else if (topbarUser) {
    topbarUser.innerHTML = `<span style="color: var(--mid);">Not logged in</span>`;
    console.log('Topbar set to not logged in');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
  const user = getCurrentUser();
  if (user) {
    initTopbar();
    setActiveNav();
  }
});

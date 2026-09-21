/**
 * PixelKids - Sistema de Gestão Interna
 * Arquivo de Scripts (script.js)
 * 
 * Responsável pelas interações da interface:
 * 1. Controle de Acesso e Login (permite entrar com Login e Senha em branco)
 * 2. Barra Lateral (Aside) Reduzida por padrão com expansão/compactação pelo botão do cabeçalho
 * 3. Destaque do módulo ativo e feedback tátil
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initSidebarNavigation();
  initButtonFeedback();
});

/**
 * 1. Gerencia o Acesso e Autenticação Simples
 * Permite acesso após a tela de login, aceitando campos em branco.
 */
function initAuth() {
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.endsWith('login.html');

  // Tratamento da tela de Login (login.html)
  if (isLoginPage) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userInput = document.getElementById('loginUser');
        const customName = userInput && userInput.value.trim() ? userInput.value.trim() : 'PixelKidsADM';

        // Registra a sessão de login
        sessionStorage.setItem('pixelkids_logged_in', 'true');
        sessionStorage.setItem('pixelkids_user_name', customName);

        // Redireciona para o painel principal
        window.location.href = 'index.html';
      });
    }
    return;
  }

  // Verificação de autenticação nas páginas internas do sistema
  const isLoggedIn = sessionStorage.getItem('pixelkids_logged_in');
  if (isLoggedIn !== 'true') {
    // Redireciona para a tela de login caso ainda não tenha acessado
    window.location.replace('login.html');
    return;
  }

  // Atualiza o nome exibido no cabeçalho se houver nome personalizado
  const storedUser = sessionStorage.getItem('pixelkids_user_name');
  if (storedUser) {
    // 1. Atualiza todos os locais com a classe .user-name (cabeçalho)
  document.querySelectorAll('.user-name').forEach(el => el.textContent = storedUser);

  // 2. Troca o nome no H1 de forma simples
  const h1 = document.getElementById('welcomeTitle');
  if (h1) h1.textContent = `Olá, ${storedUser}!`;
}

  // Intercepta ações de Sair / Logout
  const logoutButtons = document.querySelectorAll('#btnLogoutHome, #btnLogoutHeader, .header-logout-btn, .logout-link-btn');
  logoutButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('pixelkids_logged_in');
      window.location.href = 'login.html';
    });
  });
}

/**
 * 2. Gerencia a Barra Lateral (Aside) Reduzida e sua Expansão/Compactação
 */
function initSidebarNavigation() {
  const sidebar = document.querySelector('.system-sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle-btn');
  const backdrop = document.querySelector('.sidebar-backdrop');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

  // Restaura o estado da barra lateral expandida (se o usuário expandiu previamente nesta sessão)
  const isExpanded = sessionStorage.getItem('pixelkids_sidebar_expanded') === 'true';
  if (isExpanded && window.innerWidth > 768) {
    document.body.classList.add('sidebar-expanded');
  }

  if (!sidebar || !toggleBtn) return;

  // Alterna o estado da sidebar (compactar / expandir) ao clicar no botão do cabeçalho
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (window.innerWidth <= 768) {
      // Dispositivos móveis: abre/fecha como gaveta flutuante (drawer)
      const isOpen = sidebar.classList.toggle('sidebar-open');
      if (backdrop) {
        backdrop.classList.toggle('active', isOpen);
      }
    } else {
      // Telas desktop: alterna entre a visualização reduzida (apenas ícones) e expandida (com rótulos)
      const nowExpanded = document.body.classList.toggle('sidebar-expanded');
      sessionStorage.setItem('pixelkids_sidebar_expanded', nowExpanded ? 'true' : 'false');
      
      toggleBtn.setAttribute('title', nowExpanded ? 'Compactar Menu Lateral' : 'Expandir Menu Lateral');
      toggleBtn.setAttribute('aria-expanded', nowExpanded ? 'true' : 'false');
    }
  });

  // Fecha gaveta móvel ao clicar no fundo escurecido
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }

  // Tecla 'Escape' fecha o menu móvel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (sidebar.classList.contains('sidebar-open')) {
        closeMobileSidebar();
      }
    }
  });

  // Fecha o menu lateral móvel ao clicar em qualquer link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      }
    });
  });

  function closeMobileSidebar() {
    sidebar.classList.remove('sidebar-open');
    if (backdrop) {
      backdrop.classList.remove('active');
    }
  }

  // Destaque visual da página atual
  highlightCurrentPage(navLinks);
}

/**
 * Destaca o link correspondente à página atual no menu lateral
 */
function highlightCurrentPage(links) {
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  links.forEach((link) => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentFile) {
      link.classList.add('active');
    }
  });
}

/**
 * 3. Microinterações táteis nos botões do sistema
 */
function initButtonFeedback() {
  const buttons = document.querySelectorAll(
    '.big-nav-button, .sidebar-toggle-btn, .user-profile-badge, .header-logout-btn, .logout-link-btn, .btn-pixel-primary'
  );
  
  buttons.forEach((btn) => {
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'scale(0.97)';
    });

    btn.addEventListener('mouseup', () => {
      btn.style.transform = '';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

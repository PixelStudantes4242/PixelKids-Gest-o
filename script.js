/**
 * PixelKids - Sistema de Gestão Interna
 * Arquivo de Scripts (script.js)
 * 
 * Responsável pelas interações da interface:
 * 1. Controle de Acesso e Login (permite entrar com Login e Senha em branco)
 * 2. Barra Lateral (Aside) Reduzida por padrão com expansão/compactação pelo botão do cabeçalho
 * 3. Destaque do módulo ativo e feedback tátil
 */

function initApp() {
  initAuth();
  initSidebarNavigation();
  initButtonFeedback();
  initEstoque();
  initEquipe();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/**
 * 1. Gerencia o Acesso e Autenticação Simples
 * Permite acesso após a tela de login, aceitando campos em branco.
 */
function initAuth() {
  const currentPath = window.location.pathname;
  const isLoginPage = Boolean(document.getElementById('loginForm')) || currentPath.endsWith('login.html') || currentPath.includes('login');

  // Tratamento da tela de Login (login.html)
  if (isLoginPage) {
    // Ao entrar na tela de login, limpa a sessão anterior para permitir novo acesso
    sessionStorage.removeItem('pixelkids_logged_in');

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
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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

  // Fecha gaveta ao redimensionar para tela grande
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sidebar.classList.contains('sidebar-open')) {
      closeMobileSidebar();
    }
  });

  function closeMobileSidebar() {
    sidebar.classList.remove('sidebar-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
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

/**
 * 4. Módulo de Gestão de Estoque (estoque.html)
 * Manipulações de UI:
 * - Abertura e fechamento de modal (cadastrar novo e detalhar/editar)
 * - Preenchimento dinâmico dos dados simulados nos campos do modal
 * - Grade de tamanhos com badges/checkboxes interativos
 * - Filtro de busca em tempo real na tabela de produtos
 * - Simulação de auditoria visual com o usuário ativo do sessionStorage e data/hora atual
 * - Simulação de exclusão e feedback visual com toast
 */
function initEstoque() {
  const tabelaEstoque = document.getElementById('tabelaEstoque');
  const modalProduto = document.getElementById('modalProduto');
  if (!tabelaEstoque || !modalProduto) return;

  // Elementos do Modal
  const btnCadastrar = document.getElementById('btnCadastrarProduto');
  const btnFecharModal = document.getElementById('btnFecharModal');
  const btnCancelarModal = document.getElementById('btnCancelarModal');
  const btnSalvar = document.getElementById('btnSalvarProduto');
  const btnExcluir = document.getElementById('btnExcluirProduto');
  const formProduto = document.getElementById('formProduto');

  const modalTitulo = document.getElementById('modalTitulo');
  const modalSubtitulo = document.getElementById('modalSubtitulo');
  const modalStatusText = document.getElementById('modalStatusText');

  // Campos do formulário
  const inputCodigo = document.getElementById('inputProdutoCodigo');
  const inputNome = document.getElementById('inputProdutoNome');
  const selectCategoria = document.getElementById('selectProdutoCategoria');
  const inputPreco = document.getElementById('inputProdutoPreco');
  const inputQtd = document.getElementById('inputProdutoQtd');
  const inputMinimo = document.getElementById('inputProdutoMinimo');

  const forn1Nome = document.getElementById('forn1Nome');
  const forn1Custo = document.getElementById('forn1Custo');
  const forn2Nome = document.getElementById('forn2Nome');
  const forn2Custo = document.getElementById('forn2Custo');
  const forn3Nome = document.getElementById('forn3Nome');
  const forn3Custo = document.getElementById('forn3Custo');

  const textareaObs = document.getElementById('textareaProdutoObs');
  const auditUser = document.getElementById('auditUser');
  const auditDate = document.getElementById('auditDate');

  // Busca e Filtros
  const inputBusca = document.getElementById('inputBuscaEstoque');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const produtosContador = document.getElementById('produtosContador');
  const emptySearchRow = document.getElementById('emptySearchRow');

  // Toast
  const estoqueToast = document.getElementById('estoqueToast');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout = null;

  // Linha atualmente em edição
  let activeEditingRow = null;
  const tbody = document.getElementById('estoqueTableBody');
  let naturalRowsOrder = tbody ? Array.from(tbody.querySelectorAll('.produto-row')) : [];

  // Configuração da Integração Google Planilhas via Google Apps Script
  const API_URL = "https://script.google.com/macros/s/AKfycbyMyWOqGnk-tCmyx4-I7tAj10jSexxj3AClyGH3aIzedi6HuU4LHIN_8tYoXpsOUnEEVg/exec";
  let gasUrl = localStorage.getItem('pixelkids_gas_url') || API_URL;
  const btnSyncGoogleSheets = document.getElementById('btnSyncGoogleSheets');
  const btnConfigSheets = document.getElementById('btnConfigSheets');
  const syncSheetsText = document.getElementById('syncSheetsText');
  const modalSheetsConfig = document.getElementById('modalSheetsConfig');
  const btnFecharModalSheets = document.getElementById('btnFecharModalSheets');
  const btnCancelarModalSheets = document.getElementById('btnCancelarModalSheets');
  const btnSalvarGasUrl = document.getElementById('btnSalvarGasUrl');
  const btnTestarGasUrl = document.getElementById('btnTestarGasUrl');
  const btnRestaurarUrlPadrao = document.getElementById('btnRestaurarUrlPadrao');
  const inputGasUrl = document.getElementById('inputGasUrl');
  const sheetsDiagnosticBox = document.getElementById('sheetsDiagnosticBox');
  const diagTitle = document.getElementById('diagTitle');
  const diagBody = document.getElementById('diagBody');
  const diagIcon = document.getElementById('diagIcon');
  const sheetsDotStatus = document.getElementById('sheetsDotStatus');
  const sheetsStatusBadgeText = document.getElementById('sheetsStatusBadgeText');

  function updateSheetsStatusBadge(isConnected, customText) {
    if (!sheetsDotStatus) return;
    if (isConnected) {
      sheetsDotStatus.style.backgroundColor = 'var(--color-green)';
      if (sheetsStatusBadgeText) sheetsStatusBadgeText.textContent = customText || 'Google Planilhas: Conectado';
    } else {
      sheetsDotStatus.style.backgroundColor = 'var(--color-red)';
      if (sheetsStatusBadgeText) sheetsStatusBadgeText.textContent = customText || 'Google Planilhas: Ajuste de Permissão Necessário';
    }
  }

  function openModalSheets() {
    if (!modalSheetsConfig) return;
    if (inputGasUrl) inputGasUrl.value = gasUrl || API_URL;
    if (sheetsDiagnosticBox) sheetsDiagnosticBox.style.display = 'none';
    modalSheetsConfig.classList.add('active');
    modalSheetsConfig.setAttribute('aria-hidden', 'false');
  }

  function closeModalSheets() {
    if (!modalSheetsConfig) return;
    modalSheetsConfig.classList.remove('active');
    modalSheetsConfig.setAttribute('aria-hidden', 'true');
  }

  if (btnConfigSheets) btnConfigSheets.addEventListener('click', openModalSheets);
  if (btnFecharModalSheets) btnFecharModalSheets.addEventListener('click', closeModalSheets);
  if (btnCancelarModalSheets) btnCancelarModalSheets.addEventListener('click', closeModalSheets);
  if (modalSheetsConfig) {
    modalSheetsConfig.addEventListener('click', (e) => {
      if (e.target === modalSheetsConfig) closeModalSheets();
    });
  }

  if (btnRestaurarUrlPadrao && inputGasUrl) {
    btnRestaurarUrlPadrao.addEventListener('click', () => {
      inputGasUrl.value = API_URL;
      showToast('URL padrão restaurada no formulário!');
    });
  }

  // Testador de Conexão com Diagnóstico Automático
  if (btnTestarGasUrl && inputGasUrl) {
    btnTestarGasUrl.addEventListener('click', async () => {
      const urlParaTestar = inputGasUrl.value.trim();
      if (!urlParaTestar) {
        showToast('Por favor, informe a URL do Apps Script para testar.', 'warning');
        return;
      }

      btnTestarGasUrl.classList.add('testing');
      btnTestarGasUrl.querySelector('span').textContent = 'Testando...';
      if (sheetsDiagnosticBox) sheetsDiagnosticBox.style.display = 'none';

      try {
        const testEndpoint = urlParaTestar.includes('?') 
          ? `${urlParaTestar}&action=ping` 
          : `${urlParaTestar}?action=ping`;

        const response = await fetch(testEndpoint, { method: 'GET' });
        const text = await response.text();

        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
          // Não retornou JSON, possivelmente HTML da Google de bloqueio
        }

        if (sheetsDiagnosticBox && diagTitle && diagBody && diagIcon) {
          sheetsDiagnosticBox.style.display = 'block';

          if (json && (json.status === 'success' || Array.isArray(json.data))) {
            sheetsDiagnosticBox.className = 'sheets-diagnostic-box success';
            diagIcon.textContent = '✅';
            diagTitle.textContent = 'Conexão Bem-Sucedida!';
            diagBody.innerHTML = `O Web App do Google Apps Script respondeu corretamente com JSON. A planilha está acessível e pronta para leitura e gravação de produtos.`;
            updateSheetsStatusBadge(true, 'Google Planilhas: Conectado');
            showToast('Conexão com Google Apps Script verificada com sucesso!', 'success');
          } else if (text.includes('<!DOCTYPE html>') || text.includes('accounts.google.com') || text.includes('You need access')) {
            sheetsDiagnosticBox.className = 'sheets-diagnostic-box error';
            diagIcon.textContent = '❌';
            diagTitle.textContent = 'Erro de Permissão ("You need access")';
            diagBody.innerHTML = `
              O Apps Script retornou uma página de bloqueio de acesso do Google.<br>
              <strong>Como corrigir:</strong><br>
              1. No editor do Apps Script, selecione no menu suspenso a função <code>autorizarETestarScript</code> e clique em <strong>Executar</strong> para conceder permissão à planilha.<br>
              2. Clique em <strong>Implantar &gt; Gerenciar implantações</strong> (ou Nova implantação).<br>
              3. Configure <strong>Quem tem acesso</strong> como <strong>"Qualquer pessoa" (Anyone)</strong>.<br>
              4. Salve como <strong>Nova versão</strong> e cole a URL atualizada aqui.
            `;
            updateSheetsStatusBadge(false, 'Google Planilhas: Permissão Pendente');
            showToast('Erro de permissão no Apps Script: configure como "Qualquer pessoa" (Anyone).', 'warning', 6000);
          } else {
            sheetsDiagnosticBox.className = 'sheets-diagnostic-box warning';
            diagIcon.textContent = '⚠️';
            diagTitle.textContent = 'Resposta Inesperada';
            diagBody.innerHTML = `O servidor respondeu com status HTTP ${response.status}, mas o conteúdo não foi reconhecido: <code>${text.slice(0, 160)}...</code>`;
          }
        }
      } catch (err) {
        console.error('Falha no teste da URL do Apps Script:', err);
        if (sheetsDiagnosticBox && diagTitle && diagBody && diagIcon) {
          sheetsDiagnosticBox.style.display = 'block';
          sheetsDiagnosticBox.className = 'sheets-diagnostic-box error';
          diagIcon.textContent = '❌';
          diagTitle.textContent = 'Bloqueio de CORS ou Conexão';
          diagBody.innerHTML = `
            O navegador bloqueou a requisição (CORS / Failed to fetch).<br>
            <strong>Causa mais comum no Google Apps Script:</strong> O Web App está configurado com <em>"Quem pode acessar: Somente eu"</em>, o que faz o Google redirecionar a chamada para a tela de login do Google (bloqueada pelo navegador).<br>
            <strong>Solução:</strong> Altere a implantação no Apps Script para <strong>"Quem tem acesso: Qualquer pessoa" (Anyone)</strong> e certifique-se de executar a função <code>autorizarETestarScript</code> pelo menos uma vez no editor.
          `;
          updateSheetsStatusBadge(false);
          showToast('Bloqueio no Apps Script. Verifique os passos de permissão no modal.', 'warning', 6000);
        }
      } finally {
        btnTestarGasUrl.classList.remove('testing');
        btnTestarGasUrl.querySelector('span').textContent = 'Testar Conexão';
      }
    });
  }

  if (btnSalvarGasUrl && inputGasUrl) {
    btnSalvarGasUrl.addEventListener('click', () => {
      const novaUrl = inputGasUrl.value.trim();
      if (novaUrl) {
        gasUrl = novaUrl;
        localStorage.setItem('pixelkids_gas_url', gasUrl);
        showToast('URL do Apps Script salva com sucesso!');
        closeModalSheets();
        carregarEstoqueGoogleSheets();
      } else {
        localStorage.removeItem('pixelkids_gas_url');
        gasUrl = '';
        showToast('Integração com Google Sheets desvinculada.', 'warning');
        closeModalSheets();
      }
    });
  }

  if (btnSyncGoogleSheets) {
    btnSyncGoogleSheets.addEventListener('click', () => {
      if (!gasUrl) {
        openModalSheets();
      } else {
        carregarEstoqueGoogleSheets();
      }
    });
  }

  /**
   * Exibe notificação flutuante tipo Toast
   */
  function showToast(message, type = 'success', duration = 3500) {
    if (!estoqueToast || !toastMessage) return;
    toastMessage.textContent = message;
    estoqueToast.className = 'estoque-toast show';
    if (type === 'warning') estoqueToast.classList.add('toast-warning');
    if (type === 'error') estoqueToast.classList.add('toast-error');
    if (type === 'success') estoqueToast.classList.add('toast-success');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      estoqueToast.classList.remove('show');
    }, duration);
  }

  /**
   * Obtém o nome do usuário logado (sessionStorage)
   */
  function getActiveUserName() {
    return sessionStorage.getItem('pixelkids_user_name') || 'PixelKidsADM';
  }

  /**
   * Formata data e hora no padrão pt-BR
   */
  function getCurrentFormattedDateTime() {
    const now = new Date();
    const dataStr = now.toLocaleDateString('pt-BR');
    const horaStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dataStr} às ${horaStr}`;
  }

  /**
   * Abre o Modal
   */
  function openModal() {
    modalProduto.classList.add('active');
    modalProduto.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Fecha o Modal
   */
  function closeModal() {
    modalProduto.classList.remove('active');
    modalProduto.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeEditingRow = null;
  }

  // Elementos da Grade de Tamanhos Quantitativa
  const btnZerarGrade = document.getElementById('btnZerarGrade');
  const gradeTotalUnits = document.getElementById('gradeTotalUnits');
  const gradeActiveSizesCount = document.getElementById('gradeActiveSizesCount');
  const sizeCards = document.querySelectorAll('.size-stock-card');
  const sizeInputs = document.querySelectorAll('.size-qty-input');

  /**
   * Recalcula a soma total da grade de tamanhos e sincroniza o estoque geral
   */
  function updateGradeCalculations(syncToTotalInput = true) {
    let totalUnidades = 0;
    let tamanhosComEstoque = 0;

    sizeCards.forEach((card) => {
      const input = card.querySelector('.size-qty-input');
      const qtyDisplay = card.querySelector('.size-card-qty-display');
      if (!input) return;

      let val = parseInt(input.value || '0', 10);
      if (isNaN(val) || val < 0) {
        val = 0;
        input.value = '0';
      }

      if (qtyDisplay) {
        qtyDisplay.textContent = `${val} un`;
      }

      if (val > 0) {
        card.classList.add('has-stock');
        totalUnidades += val;
        tamanhosComEstoque++;
      } else {
        card.classList.remove('has-stock');
      }
    });

    if (gradeTotalUnits) {
      gradeTotalUnits.textContent = totalUnidades.toString();
    }
    if (gradeActiveSizesCount) {
      gradeActiveSizesCount.textContent = tamanhosComEstoque.toString();
    }

    // Mantém o campo de Estoque Geral sincronizado em tempo real
    if (syncToTotalInput && inputQtd) {
      inputQtd.value = totalUnidades.toString();
    }

    return { totalUnidades, tamanhosComEstoque };
  }

  // Eventos de stepper (+ / -) e inputs numéricos da grade
  sizeCards.forEach((card) => {
    const input = card.querySelector('.size-qty-input');
    const btnMinus = card.querySelector('.btn-stepper.btn-minus');
    const btnPlus = card.querySelector('.btn-stepper.btn-plus');
    const label = card.querySelector('.size-card-label');

    if (btnPlus && input) {
      btnPlus.addEventListener('click', (e) => {
        e.preventDefault();
        let current = parseInt(input.value || '0', 10);
        if (isNaN(current)) current = 0;
        input.value = (current + 1).toString();
        updateGradeCalculations(true);
      });
    }

    if (btnMinus && input) {
      btnMinus.addEventListener('click', (e) => {
        e.preventDefault();
        let current = parseInt(input.value || '0', 10);
        if (isNaN(current)) current = 0;
        if (current > 0) {
          input.value = (current - 1).toString();
          updateGradeCalculations(true);
        }
      });
    }

    if (input) {
      input.addEventListener('input', () => {
        let val = parseInt(input.value || '0', 10);
        if (isNaN(val) || val < 0) {
          input.value = '0';
        }
        updateGradeCalculations(true);
      });

      input.addEventListener('blur', () => {
        if (!input.value.trim()) {
          input.value = '0';
          updateGradeCalculations(true);
        }
      });
    }

    // Clique no label ativa rapidamente 1 un se estiver zerado
    if (label && input) {
      label.addEventListener('click', () => {
        let current = parseInt(input.value || '0', 10);
        if (isNaN(current) || current === 0) {
          input.value = '1';
          updateGradeCalculations(true);
        }
        input.focus();
        input.select();
      });
    }
  });

  // Botão de Ação Rápida: Zerar Grade
  if (btnZerarGrade) {
    btnZerarGrade.addEventListener('click', () => {
      sizeInputs.forEach((inp) => {
        inp.value = '0';
      });
      updateGradeCalculations(true);
    });
  }

  /**
   * Limpa o formulário para cadastro de novo produto
   */
  function resetFormForNewProduct() {
    activeEditingRow = null;
    formProduto.reset();

    // Zera todos os inputs de tamanho da grade
    sizeInputs.forEach((inp) => {
      inp.value = '0';
    });
    updateGradeCalculations(true);

    modalTitulo.textContent = 'Cadastrar Novo Produto';
    modalSubtitulo.textContent = 'Insira os dados técnicos, categoria, grade infantil e fornecedores';
    modalStatusText.textContent = 'Novo Cadastro';

    // Gera um código sugerido sequencial simples
    inputCodigo.value = '#PK-0106';

    // Preenche campo de auditoria inicial
    auditUser.textContent = getActiveUserName();
    auditDate.textContent = 'Novo item ainda não salvo no sistema';

    if (btnExcluir) {
      btnExcluir.style.display = 'none';
    }

    openModal();
    inputNome.focus();
  }

  /**
   * Preenche o modal com os dados da linha selecionada
   */
  /**
   * Helper para renderizar os pills de distribuição de tamanhos
   */
  function renderSizesBreakdownHtml(qtds) {
    if (!qtds) return '<span class="size-chip-stock chip-zero">Sem grade</span>';
    const keys = Object.keys(qtds).filter(k => (Number(qtds[k]) || 0) > 0);
    if (keys.length === 0) {
      return '<span class="size-chip-stock chip-zero">Sem grade</span>';
    }
    return keys
      .map((sz) => `<span class="size-chip-stock chip-has-stock">${sz}: <strong>${qtds[sz]} un</strong></span>`)
      .join('');
  }

  /**
   * Preenche o modal com os dados existentes (inclusive as quantidades de cada tamanho)
   * quando o usuário clica no botão "Detalhar / Editar"
   */
  function preencherModalParaEdicao(row) {
    populateModalFromRow(row);
  }

  function populateModalFromRow(row) {
    activeEditingRow = row;
    const ds = row.dataset;

    modalTitulo.textContent = 'Detalhar e Editar Produto';
    modalSubtitulo.textContent = 'Atualize informações de estoque, preços e especificações técnicas';
    modalStatusText.textContent = 'Ficha Técnica';

    inputCodigo.value = ds.codigo || '';
    inputNome.value = ds.nome || '';
    selectCategoria.value = ds.categoria || '';
    inputPreco.value = ds.preco || '';
    inputMinimo.value = ds.minimo || '5';

    forn1Nome.value = ds.forn1Nome || '';
    forn1Custo.value = ds.forn1Custo || '';
    forn2Nome.value = ds.forn2Nome || '';
    forn2Custo.value = ds.forn2Custo || '';
    forn3Nome.value = ds.forn3Nome || '';
    forn3Custo.value = ds.forn3Custo || '';

    textareaObs.value = ds.obs || '';

    // Auditoria visual inicial
    auditUser.textContent = ds.auditoriaUser || 'PixelKidsADM';
    auditDate.textContent = ds.auditoriaData || '24/09/2026 às 12:00';

    // Zera primeiro todas as quantidades da grade
    sizeInputs.forEach((inp) => {
      inp.value = '0';
    });

    // Lê as quantidades por tamanho salvas na linha (JSON)
    let tamanhosQtd = {};
    if (ds.tamanhosQtd) {
      try {
        tamanhosQtd = JSON.parse(ds.tamanhosQtd);
      } catch (e) {
        tamanhosQtd = {};
      }
    } else if (ds.tamanhos) {
      // Fallback: se houver lista de tamanhos em string
      const lista = ds.tamanhos.split(',').map((t) => t.trim());
      const qtdTotal = parseInt(ds.qtd || '0', 10);
      const porTam = lista.length > 0 ? Math.max(1, Math.floor(qtdTotal / lista.length)) : 0;
      lista.forEach((t) => {
        tamanhosQtd[t] = porTam;
      });
    }

    // Preenche cada input da grade
    Object.keys(tamanhosQtd).forEach((tamanho) => {
      const input = document.querySelector(`.size-qty-input[data-size="${tamanho}"]`);
      if (input) {
        input.value = (tamanhosQtd[tamanho] || 0).toString();
      }
    });

    // Atualiza cálculos visuais da grade e sincroniza campo geral
    updateGradeCalculations(false);
    if (inputQtd) {
      inputQtd.value = ds.qtd || '0';
    }

    if (btnExcluir) {
      btnExcluir.style.display = 'inline-flex';
    }

    openModal();
  }

  // Evento: Botão "+ Cadastrar Novo Produto"
  if (btnCadastrar) {
    btnCadastrar.addEventListener('click', () => {
      resetFormForNewProduct();
    });
  }

  // Evento: Botões "Detalhar / Editar" em cada linha da tabela
  function bindDetailButtons() {
    const detailButtons = tabelaEstoque.querySelectorAll('.btn-action-detail');
    detailButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const row = btn.closest('.produto-row');
        if (row) {
          preencherModalParaEdicao(row);
        }
      });
    });
  }
  bindDetailButtons();

  // Fechar modal
  if (btnFecharModal) btnFecharModal.addEventListener('click', closeModal);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', closeModal);

  modalProduto.addEventListener('click', (e) => {
    if (e.target === modalProduto) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalProduto.classList.contains('active')) {
      closeModal();
    }
  });

  /**
   * Função assíncrona salvarProdutoNoEstoque(event):
   * Disparada ao salvar no modal. Coleta os valores de todos os campos
   * (incluindo os inputs numéricos de cada tamanho da grade), anexa o usuário ativo
   * do sessionStorage com data/hora e envia via fetch (POST) para o Google Apps Script.
   */
  async function salvarProdutoNoEstoque(event) {
    if (event) event.preventDefault();

    const userAtual = getActiveUserName();
    const dataHoraAtual = getCurrentFormattedDateTime();

    // Atualiza o campo de auditoria visual no modal
    auditUser.textContent = userAtual;
    auditDate.textContent = dataHoraAtual;

    const codigoVal = inputCodigo.value.trim() || '#PK-0000';
    const nomeVal = inputNome.value.trim() || 'Produto sem nome';
    const precoVal = parseFloat(inputPreco.value || '0');
    const categoriaVal = selectCategoria.value || 'Geral';
    const minimoVal = parseInt(inputMinimo.value || '5', 10);

    // Coleta quantidades de cada tamanho da grade
    const tamanhosQtd = {};
    let somaGrade = 0;
    sizeCards.forEach((card) => {
      const input = card.querySelector('.size-qty-input');
      if (!input) return;
      const sz = input.dataset.size;
      const val = parseInt(input.value || '0', 10);
      if (val > 0) {
        tamanhosQtd[sz] = val;
        somaGrade += val;
      }
    });

    const tamanhosAtivos = Object.keys(tamanhosQtd);
    const qtdFinal = somaGrade > 0 ? somaGrade : parseInt(inputQtd.value || '0', 10);

    if (activeEditingRow) {
      // Atualiza os dados da linha existente
      activeEditingRow.dataset.codigo = codigoVal;
      activeEditingRow.dataset.nome = nomeVal;
      activeEditingRow.dataset.categoria = categoriaVal;
      activeEditingRow.dataset.preco = precoVal.toFixed(2);
      activeEditingRow.dataset.qtd = qtdFinal.toString();
      activeEditingRow.dataset.minimo = minimoVal.toString();
      activeEditingRow.dataset.tamanhos = tamanhosAtivos.join(',');
      activeEditingRow.dataset.tamanhosQtd = JSON.stringify(tamanhosQtd);
      activeEditingRow.dataset.forn1Nome = forn1Nome.value;
      activeEditingRow.dataset.forn1Custo = forn1Custo.value;
      activeEditingRow.dataset.forn2Nome = forn2Nome.value;
      activeEditingRow.dataset.forn2Custo = forn2Custo.value;
      activeEditingRow.dataset.forn3Nome = forn3Nome.value;
      activeEditingRow.dataset.forn3Custo = forn3Custo.value;
      activeEditingRow.dataset.auditoriaUser = userAtual;
      activeEditingRow.dataset.auditoriaData = dataHoraAtual;
      activeEditingRow.dataset.obs = textareaObs.value;

      // Atualiza textos visuais na tabela
      const cellCode = activeEditingRow.querySelector('.code-badge');
      if (cellCode) cellCode.textContent = codigoVal;

      const cellName = activeEditingRow.querySelector('.product-primary-name');
      if (cellName) cellName.textContent = nomeVal;

      // Atualiza os pills de tamanhos na linha
      let breakdownContainer = activeEditingRow.querySelector('.product-sizes-breakdown');
      if (!breakdownContainer) {
        breakdownContainer = document.createElement('div');
        breakdownContainer.className = 'product-sizes-breakdown';
        activeEditingRow.querySelector('.product-title-group')?.appendChild(breakdownContainer);
      }
      breakdownContainer.innerHTML = renderSizesBreakdownHtml(tamanhosQtd);

      const cellPrice = activeEditingRow.querySelector('.cell-price strong');
      if (cellPrice) {
        cellPrice.textContent = `R$ ${precoVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      const cellStock = activeEditingRow.querySelector('.stock-quantity');
      const indicatorBadge = activeEditingRow.querySelector('.stock-indicator-badge');
      if (cellStock) {
        cellStock.textContent = `${qtdFinal} un.`;
      }

      // Atualiza status de estoque visual
      if (qtdFinal <= minimoVal) {
        activeEditingRow.className = 'produto-row row-critical';
        if (cellStock) cellStock.className = 'stock-quantity text-danger';
        if (indicatorBadge) {
          indicatorBadge.className = 'stock-indicator-badge badge-danger';
          indicatorBadge.textContent = 'Estoque Baixo';
        }
      } else if (qtdFinal <= minimoVal + 3) {
        activeEditingRow.className = 'produto-row row-warning';
        if (cellStock) cellStock.className = 'stock-quantity text-warning';
        if (indicatorBadge) {
          indicatorBadge.className = 'stock-indicator-badge badge-warning';
          indicatorBadge.textContent = 'Giro Lento';
        }
      } else {
        activeEditingRow.className = 'produto-row';
        if (cellStock) cellStock.className = 'stock-quantity text-success';
        if (indicatorBadge) {
          indicatorBadge.className = 'stock-indicator-badge badge-success';
          indicatorBadge.textContent = 'Em Estoque';
        }
      }

      showToast(`Alterações do produto ${codigoVal} salvas com ${qtdFinal} un. (${tamanhosAtivos.length} tamanhos) por ${userAtual}!`);
    } else {
      // Novo produto cadastrado: insere nova linha visual na tabela
      const tbody = document.getElementById('estoqueTableBody');
      if (tbody) {
        const newRow = document.createElement('tr');
        const isCritical = qtdFinal <= minimoVal;
        const isWarning = !isCritical && qtdFinal <= minimoVal + 3;
        newRow.className = 'produto-row' + (isCritical ? ' row-critical' : isWarning ? ' row-warning' : '');
        newRow.dataset.codigo = codigoVal;
        newRow.dataset.nome = nomeVal;
        newRow.dataset.categoria = categoriaVal;
        newRow.dataset.tamanhos = tamanhosAtivos.join(',');
        newRow.dataset.tamanhosQtd = JSON.stringify(tamanhosQtd);
        newRow.dataset.preco = precoVal.toFixed(2);
        newRow.dataset.qtd = qtdFinal.toString();
        newRow.dataset.minimo = minimoVal.toString();
        newRow.dataset.forn1Nome = forn1Nome.value;
        newRow.dataset.forn1Custo = forn1Custo.value;
        newRow.dataset.forn2Nome = forn2Nome.value;
        newRow.dataset.forn2Custo = forn2Custo.value;
        newRow.dataset.forn3Nome = forn3Nome.value;
        newRow.dataset.forn3Custo = forn3Custo.value;
        newRow.dataset.obs = textareaObs.value;
        newRow.dataset.auditoriaUser = userAtual;
        newRow.dataset.auditoriaData = dataHoraAtual;

        const catSlug = categoriaVal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        newRow.innerHTML = `
          <td class="cell-code">
            <span class="code-badge">${codigoVal}</span>
          </td>
          <td class="cell-name">
            <div class="product-title-group">
              <span class="product-primary-name">${nomeVal}</span>
              <span class="product-secondary-meta">${categoriaVal} &bull; Cadastro Recente</span>
              <div class="product-sizes-breakdown" title="Distribuição de estoque por tamanho">
                ${renderSizesBreakdownHtml(tamanhosQtd)}
              </div>
            </div>
          </td>
          <td class="cell-category">
            <span class="category-pill cat-${catSlug}">${categoriaVal}</span>
          </td>
          <td class="cell-price col-price">
            <strong>R$ ${precoVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </td>
          <td class="cell-stock col-stock">
            <div class="stock-status-cell">
              <span class="stock-quantity ${isCritical ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'}">${qtdFinal} un.</span>
              <span class="stock-indicator-badge ${isCritical ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-success'}">${isCritical ? 'Estoque Baixo' : isWarning ? 'Giro Lento' : 'Em Estoque'}</span>
            </div>
          </td>
          <td class="cell-actions col-actions">
            <button type="button" class="btn-action-detail" title="Detalhar e Editar este produto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span>Detalhar / Editar</span>
            </button>
          </td>
        `;

        tbody.prepend(newRow);
        if (typeof naturalRowsOrder !== 'undefined') {
          naturalRowsOrder.unshift(newRow);
        }
        bindDetailButtons();
        updateCountersAndFilter();
      }

      showToast(`Novo produto ${codigoVal} cadastrado com ${qtdFinal} un. na grade por ${userAtual}!`);
    }

    // Envio para o Google Apps Script / Google Planilhas
    const targetUrl = gasUrl || API_URL;
    if (targetUrl) {
      const payloadGas = {
        codigo: codigoVal,
        nome: nomeVal,
        categoria: categoriaVal,
        preco_venda: precoVal,
        tam_rn: tamanhosQtd['RN'] || 0,
        tam_p: tamanhosQtd['P'] || 0,
        tam_m: tamanhosQtd['M'] || 0,
        tam_g: tamanhosQtd['G'] || 0,
        tam_gg: tamanhosQtd['GG'] || 0,
        tam_1: tamanhosQtd['1'] || 0,
        tam_2: tamanhosQtd['2'] || 0,
        tam_3: tamanhosQtd['3'] || 0,
        tam_4: tamanhosQtd['4'] || 0,
        tam_6: tamanhosQtd['6'] || 0,
        tam_8: tamanhosQtd['8'] || 0,
        tam_10: tamanhosQtd['10'] || 0,
        tam_12: tamanhosQtd['12'] || 0,
        tam_14: tamanhosQtd['14'] || 0,
        tam_16: tamanhosQtd['16'] || 0,
        qtd_total: qtdFinal,
        estoque_minimo: minimoVal,
        fornecedor_1: forn1Nome ? forn1Nome.value.trim() : '',
        custo_1: forn1Custo && forn1Custo.value ? parseFloat(forn1Custo.value) : '',
        fornecedor_2: forn2Nome ? forn2Nome.value.trim() : '',
        custo_2: forn2Custo && forn2Custo.value ? parseFloat(forn2Custo.value) : '',
        fornecedor_3: forn3Nome ? forn3Nome.value.trim() : '',
        custo_3: forn3Custo && forn3Custo.value ? parseFloat(forn3Custo.value) : '',
        anotacoes: textareaObs ? textareaObs.value.trim() : '',
        usuario: userAtual,
        ultima_alteracao: `${userAtual} em ${dataHoraAtual}`
      };

      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payloadGas)
        });
        const text = await response.text();
        let resData = null;
        try {
          resData = JSON.parse(text);
        } catch (pe) {
          if (text.includes('<!DOCTYPE html>') || text.includes('accounts.google.com') || text.includes('You need access')) {
            showToast('Erro ao salvar na Planilha: Permissão pendente ("Quem tem acesso" deve ser Qualquer pessoa).', 'warning', 7000);
          }
        }
        if (resData && resData.status === 'success') {
          showToast(`Planilha Google: ${resData.message || 'Gravado com sucesso!'}`, 'success');
          updateSheetsStatusBadge(true);
        } else if (resData && resData.status === 'error') {
          showToast(`Aviso da Planilha: ${resData.message}`, 'warning', 6000);
        }
      } catch (err) {
        console.warn('Aviso ao sincronizar produto com Google Sheets:', err);
        showToast('Produto salvo no sistema. Verifique a permissão do Apps Script para envio à planilha.', 'warning', 6000);
      }
    }

    // Fecha o modal após o salvamento
    setTimeout(() => {
      closeModal();
    }, 350);
  }

  if (formProduto) {
    formProduto.addEventListener('submit', salvarProdutoNoEstoque);
  }

  /**
   * Função assíncrona carregarEstoque():
   * Realiza o fetch (GET), limpa o <tbody> da tabela do estoque.html e insere
   * dinamicamente as linhas com os produtos da planilha, exibindo:
   * Código, Nome, Categoria, Preço de Venda e Quantidade Total (qtd_total).
   */
  async function carregarEstoque() {
    const targetUrl = gasUrl || API_URL;
    if (!targetUrl) return;

    if (btnSyncGoogleSheets) {
      btnSyncGoogleSheets.classList.add('syncing');
      if (syncSheetsText) syncSheetsText.textContent = 'Carregando...';
    }

    try {
      const response = await fetch(targetUrl, { method: 'GET' });
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (jsonErr) {
        if (text.includes('<!DOCTYPE html>') || text.includes('accounts.google.com') || text.includes('You need access') || text.includes('drive.google.com')) {
          throw new Error('PERMISSAO_APPS_SCRIPT');
        }
        throw new Error('A resposta do Apps Script não é um JSON válido: ' + text.slice(0, 100));
      }

      if (result.status === 'success' && Array.isArray(result.data)) {
        if (result.data.length > 0) {
          popularTabelaComDadosSheets(result.data);
          showToast(`Planilha sincronizada: ${result.data.length} produtos carregados!`, 'success');
        } else {
          showToast('Aba "Estoque" conectada (nenhum produto na linha 3 ainda).', 'info');
        }
        updateSheetsStatusBadge(true);
      } else {
        throw new Error(result.message || 'Erro ao processar dados da planilha.');
      }
    } catch (err) {
      console.warn('Erro ao sincronizar com Google Sheets:', err);
      updateSheetsStatusBadge(false);

      if (err.message === 'PERMISSAO_APPS_SCRIPT' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
        showToast('Falha no Apps Script: Acesso bloqueado pelo Google. Configure "Quem pode acessar: Qualquer pessoa" (clique na engrenagem ⚙️).', 'warning', 8000);
      } else {
        showToast(`Falha na sincronização: ${err.message || 'Verifique a URL do Apps Script.'}`, 'warning', 6000);
      }
    } finally {
      if (btnSyncGoogleSheets) {
        btnSyncGoogleSheets.classList.remove('syncing');
        if (syncSheetsText) syncSheetsText.textContent = 'Sincronizar Planilha';
      }
    }
  }

  // Alias para manter compatibilidade com referências anteriores
  const carregarEstoqueGoogleSheets = carregarEstoque;

  /**
   * Preenche a tabela com produtos retornados pela planilha Google
   */
  function popularTabelaComDadosSheets(produtos) {
    const tbody = document.getElementById('estoqueTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    produtos.forEach((prod) => {
      const codigo = prod.codigo || '';
      const nome = prod.nome || '';
      const categoria = prod.categoria || 'Vestidos';
      const preco = Number(prod.preco_venda) || 0;
      const qtdTotal = Number(prod.qtd_total) || 0;
      const minimo = Number(prod.estoque_minimo) || 5;

      const tamanhosQtd = {
        'RN': Number(prod.tam_rn) || 0,
        'P': Number(prod.tam_p) || 0,
        'M': Number(prod.tam_m) || 0,
        'G': Number(prod.tam_g) || 0,
        'GG': Number(prod.tam_gg) || 0,
        '1': Number(prod.tam_1) || 0,
        '2': Number(prod.tam_2) || 0,
        '3': Number(prod.tam_3) || 0,
        '4': Number(prod.tam_4) || 0,
        '6': Number(prod.tam_6) || 0,
        '8': Number(prod.tam_8) || 0,
        '10': Number(prod.tam_10) || 0,
        '12': Number(prod.tam_12) || 0,
        '14': Number(prod.tam_14) || 0,
        '16': Number(prod.tam_16) || 0
      };

      const tamanhosAtivos = Object.keys(tamanhosQtd).filter(k => tamanhosQtd[k] > 0);
      const isCritical = qtdTotal <= minimo;
      const isWarning = !isCritical && qtdTotal <= minimo + 3;

      const row = document.createElement('tr');
      row.className = 'produto-row' + (isCritical ? ' row-critical' : isWarning ? ' row-warning' : '');
      row.dataset.codigo = codigo;
      row.dataset.nome = nome;
      row.dataset.categoria = categoria;
      row.dataset.tamanhos = tamanhosAtivos.join(',');
      row.dataset.tamanhosQtd = JSON.stringify(tamanhosQtd);
      row.dataset.preco = preco.toFixed(2);
      row.dataset.qtd = qtdTotal.toString();
      row.dataset.minimo = minimo.toString();
      row.dataset.forn1Nome = prod.fornecedor_1 || '';
      row.dataset.forn1Custo = prod.custo_1 !== '' && prod.custo_1 !== undefined ? String(prod.custo_1) : '';
      row.dataset.forn2Nome = prod.fornecedor_2 || '';
      row.dataset.forn2Custo = prod.custo_2 !== '' && prod.custo_2 !== undefined ? String(prod.custo_2) : '';
      row.dataset.forn3Nome = prod.fornecedor_3 || '';
      row.dataset.forn3Custo = prod.custo_3 !== '' && prod.custo_3 !== undefined ? String(prod.custo_3) : '';
      row.dataset.obs = prod.anotacoes || '';
      row.dataset.auditoriaData = prod.ultima_alteracao || '';

      const catSlug = categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      row.innerHTML = `
        <td class="cell-code">
          <span class="code-badge">${codigo}</span>
        </td>
        <td class="cell-name">
          <div class="product-title-group">
            <span class="product-primary-name">${nome}</span>
            <span class="product-secondary-meta">${categoria} &bull; Google Sheets</span>
            <div class="product-sizes-breakdown" title="Distribuição de estoque por tamanho">
              ${renderSizesBreakdownHtml(tamanhosQtd)}
            </div>
          </div>
        </td>
        <td class="cell-category">
          <span class="category-pill cat-${catSlug}">${categoria}</span>
        </td>
        <td class="cell-price col-price">
          <strong>R$ ${preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </td>
        <td class="cell-stock col-stock">
          <div class="stock-status-cell">
            <span class="stock-quantity ${isCritical ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'}">${qtdTotal} un.</span>
            <span class="stock-indicator-badge ${isCritical ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-success'}">${isCritical ? 'Estoque Baixo' : isWarning ? 'Giro Lento' : 'Em Estoque'}</span>
          </div>
        </td>
        <td class="cell-actions col-actions">
          <button type="button" class="btn-action-detail" title="Detalhar e Editar este produto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Detalhar / Editar</span>
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });

    bindDetailButtons();
    naturalRowsOrder = Array.from(tbody.querySelectorAll('.produto-row'));
    updateCountersAndFilter();
  }

  // Expõe no escopo global para acesso direto ou chamadas externas
  window.API_URL = API_URL;
  window.carregarEstoque = carregarEstoque;
  window.salvarProdutoNoEstoque = salvarProdutoNoEstoque;
  window.preencherModalParaEdicao = preencherModalParaEdicao;

  // Tenta carregar automaticamente ao inicializar se houver URL configurada
  if (gasUrl) {
    carregarEstoque();
  }

  // Excluir produto (simulação visual)
  if (btnExcluir) {
    btnExcluir.addEventListener('click', () => {
      if (activeEditingRow) {
        const codigo = activeEditingRow.dataset.codigo || 'Produto';
        activeEditingRow.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        activeEditingRow.style.opacity = '0';
        activeEditingRow.style.transform = 'scale(0.96)';

        setTimeout(() => {
          activeEditingRow.style.display = 'none';
          updateCountersAndFilter();
          showToast(`Produto ${codigo} removido da visualização.`, 'warning');
        }, 250);
      }
      closeModal();
    });
  }

  // Ordenação Dinâmica em Memória (retorna à ordem natural ao mudar de página ou recarregar)
  const btnFiltrarOrdenar = document.getElementById('btnFiltrarOrdenar');
  const filterDropdownMenu = document.getElementById('filterDropdownMenu');
  const btnResetSort = document.getElementById('btnResetSort');
  const filterOptionBtns = document.querySelectorAll('.filter-option-btn');
  let currentSortType = 'padrao';

  function applySort(sortType) {
    if (!tbody) return;
    currentSortType = sortType;
    const rows = Array.from(tbody.querySelectorAll('.produto-row'));

    if (sortType === 'padrao') {
      naturalRowsOrder.forEach((row) => {
        tbody.appendChild(row);
      });
    } else {
      rows.sort((a, b) => {
        const nomeA = (a.dataset.nome || '').trim().toLowerCase();
        const nomeB = (b.dataset.nome || '').trim().toLowerCase();
        const precoA = parseFloat(a.dataset.preco || '0');
        const precoB = parseFloat(b.dataset.preco || '0');
        const qtdA = parseInt(a.dataset.qtd || '0', 10);
        const qtdB = parseInt(b.dataset.qtd || '0', 10);
        const catA = (a.dataset.categoria || '').trim().toLowerCase();
        const catB = (b.dataset.categoria || '').trim().toLowerCase();

        switch (sortType) {
          case 'nome-asc':
            return nomeA.localeCompare(nomeB, 'pt-BR');
          case 'nome-desc':
            return nomeB.localeCompare(nomeA, 'pt-BR');
          case 'estoque-asc':
            return qtdA - qtdB;
          case 'estoque-desc':
            return qtdB - qtdA;
          case 'preco-desc':
            return precoB - precoA;
          case 'preco-asc':
            return precoA - precoB;
          case 'categoria-asc':
            return catA.localeCompare(catB, 'pt-BR');
          default:
            return 0;
        }
      });

      rows.forEach((row) => {
        tbody.appendChild(row);
      });
    }

    // Atualiza estado ativo dos botões no menu
    filterOptionBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.sort === sortType);
    });

    if (btnFiltrarOrdenar) {
      btnFiltrarOrdenar.classList.toggle('active', sortType !== 'padrao');
      const sortLabels = {
        'padrao': 'Ordenar',
        'nome-asc': 'Nome: A-Z',
        'nome-desc': 'Nome: Z-A',
        'estoque-asc': 'Menor Estoque',
        'estoque-desc': 'Maior Estoque',
        'preco-desc': 'Maior Preço',
        'preco-asc': 'Menor Preço',
        'categoria-asc': 'Categoria: A-Z'
      };
      const labelSpan = btnFiltrarOrdenar.querySelector('.btn-filter-label');
      if (labelSpan) {
        labelSpan.textContent = sortLabels[sortType] || 'Ordenar';
      }
    }

    updateCountersAndFilter();
  }

  if (btnFiltrarOrdenar && filterDropdownMenu) {
    btnFiltrarOrdenar.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = filterDropdownMenu.classList.toggle('show');
      btnFiltrarOrdenar.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    filterOptionBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sortType = btn.dataset.sort || 'padrao';
        applySort(sortType);
        filterDropdownMenu.classList.remove('show');
        btnFiltrarOrdenar.setAttribute('aria-expanded', 'false');
      });
    });

    if (btnResetSort) {
      btnResetSort.addEventListener('click', (e) => {
        e.stopPropagation();
        applySort('padrao');
        filterDropdownMenu.classList.remove('show');
        btnFiltrarOrdenar.setAttribute('aria-expanded', 'false');
      });
    }

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!btnFiltrarOrdenar.contains(e.target) && !filterDropdownMenu.contains(e.target)) {
        filterDropdownMenu.classList.remove('show');
        btnFiltrarOrdenar.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Filtro Interativo por Cards do Dashboard (Estoque Baixo, Baixa Rotatividade, etc.)
  const statCards = document.querySelectorAll('.stat-card');
  const activeDashboardFilterChip = document.getElementById('activeDashboardFilterChip');
  const activeDashboardFilterText = document.getElementById('activeDashboardFilterText');
  const btnClearDashboardFilter = document.getElementById('btnClearDashboardFilter');
  let activeDashboardFilter = null; // null | 'critico' | 'warning'

  function setDashboardFilter(filterType) {
    if (activeDashboardFilter === filterType) {
      // Clicar novamente no mesmo card desativa o filtro (toggle)
      activeDashboardFilter = null;
    } else if (filterType === 'todos' || filterType === 'valor') {
      activeDashboardFilter = null;
      if (filterType === 'valor') {
        showToast('Exibindo catálogo total para avaliação de patrimônio.');
      }
    } else {
      activeDashboardFilter = filterType;
      if (filterType === 'critico') {
        showToast('Filtro ativo: Exibindo apenas itens com Estoque Baixo.', 'warning');
      } else if (filterType === 'warning') {
        showToast('Filtro ativo: Exibindo apenas itens com Baixa Rotatividade.');
      }
    }

    // Atualiza classes visuais nos cards do dashboard
    statCards.forEach((card) => {
      const cardFilter = card.dataset.dashboardFilter;
      if (activeDashboardFilter && cardFilter === activeDashboardFilter) {
        card.classList.add('active-filter');
      } else {
        card.classList.remove('active-filter');
      }
    });

    // Atualiza o chip indicador de filtro na toolbar
    if (activeDashboardFilterChip && activeDashboardFilterText) {
      if (activeDashboardFilter === 'critico') {
        activeDashboardFilterChip.style.display = 'inline-flex';
        activeDashboardFilterChip.className = 'active-filter-chip chip-critical';
        activeDashboardFilterText.textContent = 'Estoque Baixo';
      } else if (activeDashboardFilter === 'warning') {
        activeDashboardFilterChip.style.display = 'inline-flex';
        activeDashboardFilterChip.className = 'active-filter-chip chip-warning';
        activeDashboardFilterText.textContent = 'Baixa Rotatividade';
      } else {
        activeDashboardFilterChip.style.display = 'none';
      }
    }

    updateCountersAndFilter();

    // Rola suavemente até a tabela se o usuário clicou no card
    if (activeDashboardFilter && tabelaEstoque) {
      tabelaEstoque.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  statCards.forEach((card) => {
    card.addEventListener('click', () => {
      const filterType = card.dataset.dashboardFilter;
      if (filterType) {
        setDashboardFilter(filterType);
      }
    });

    // Acessibilidade via teclado (Enter / Espaço)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const filterType = card.dataset.dashboardFilter;
        if (filterType) {
          setDashboardFilter(filterType);
        }
      }
    });
  });

  if (btnClearDashboardFilter) {
    btnClearDashboardFilter.addEventListener('click', () => {
      setDashboardFilter(null);
      showToast('Filtro removido. Exibindo todos os produtos.');
    });
  }

  /**
   * Filtro de Busca em Tempo Real e Integração com Dashboard
   */
  function updateCountersAndFilter() {
    if (!inputBusca) return;
    const termo = inputBusca.value.toLowerCase().trim();

    if (btnClearSearch) {
      btnClearSearch.style.display = termo ? 'block' : 'none';
    }

    const rows = tabelaEstoque.querySelectorAll('.produto-row');
    let visiveis = 0;

    rows.forEach((row) => {
      if (row.style.opacity === '0' && row.style.display === 'none') {
        // Produto simulado como excluído
        return;
      }

      const codigo = (row.dataset.codigo || '').toLowerCase();
      const nome = (row.dataset.nome || '').toLowerCase();
      const categoria = (row.dataset.categoria || '').toLowerCase();
      const qtd = parseInt(row.dataset.qtd || '0', 10);
      const min = parseInt(row.dataset.minimo || '0', 10);

      const matchText = !termo || codigo.includes(termo) || nome.includes(termo) || categoria.includes(termo);

      let matchDashboard = true;
      if (activeDashboardFilter === 'critico') {
        matchDashboard = row.classList.contains('row-critical') || (qtd < min);
      } else if (activeDashboardFilter === 'warning') {
        matchDashboard = row.classList.contains('row-warning');
      }

      if (matchText && matchDashboard) {
        row.style.display = '';
        visiveis++;
      } else {
        row.style.display = 'none';
      }
    });

    if (produtosContador) {
      produtosContador.textContent = visiveis.toString();
    }

    if (emptySearchRow) {
      emptySearchRow.style.display = visiveis === 0 ? '' : 'none';
    }
  }

  if (inputBusca) {
    inputBusca.addEventListener('input', updateCountersAndFilter);
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      inputBusca.value = '';
      updateCountersAndFilter();
      inputBusca.focus();
    });
  }
}

/**
 * ============================================================================
 * MÓDULO: EQUIPE & FORNECEDORES (equipe.html)
 * ============================================================================
 * Gerencia o cadastro e controle de colaboradores da loja e de fornecedores
 * parceiros, com persistência local, filtros, ordenação e modais estruturados.
 */
function initEquipe() {
  const tabelaFuncionarios = document.getElementById('tabelaFuncionarios');
  const tabelaFornecedores = document.getElementById('tabelaFornecedores');
  if (!tabelaFuncionarios && !tabelaFornecedores) return;

  // 1. DADOS INICIAIS (SEED DATA)
  const defaultFuncionarios = [
    {
      id: 'func_1',
      nome_completo: 'Carla Cristina Silveira',
      funcao: 'Gerente de Loja',
      login: 'carla.gerente',
      senha: 'pixel@123',
      email: 'carla.silveira@pixelkids.com.br',
      telefone: '(11) 98765-4321',
      anotacoes: 'Responsável pelo fechamento diário de caixa, compras de reposição e escala da equipe.',
      ultimo_acesso: 'Hoje às 09:24'
    },
    {
      id: 'func_2',
      nome_completo: 'Marcos Vinícius Ferreira',
      funcao: 'Administrador',
      login: 'marcos.adm',
      senha: 'adm#2026',
      email: 'marcos.ti@pixelkids.com.br',
      telefone: '(11) 97123-8899',
      anotacoes: 'Gestor de tecnologia, parametrizações gerais do sistema e segurança de acessos.',
      ultimo_acesso: 'Hoje às 10:12'
    },
    {
      id: 'func_3',
      nome_completo: 'Juliana Prado Alencar',
      funcao: 'Vendedora Sênior',
      login: 'juliana.vendas',
      senha: 'vendas@kids',
      email: 'juliana.prado@pixelkids.com.br',
      telefone: '(11) 98234-5678',
      anotacoes: 'Especialista em moda bebê e infantil de 0 a 6 anos, pós-venda e atendimento VIP.',
      ultimo_acesso: 'Ontem às 18:45'
    },
    {
      id: 'func_4',
      nome_completo: 'Rodrigo Mendes Santos',
      funcao: 'Caixa / Atendimento',
      login: 'rodrigo.caixa',
      senha: 'caixa@2026',
      email: 'rodrigo.mendes@pixelkids.com.br',
      telefone: '(11) 96543-2109',
      anotacoes: 'Operador de frente de caixa, recebimento de pagamentos e emissão de notas fiscais.',
      ultimo_acesso: 'Ontem às 17:30'
    },
    {
      id: 'func_5',
      nome_completo: 'Beatriz Nogueira Lima',
      funcao: 'Estoquista / Logística',
      login: 'beatriz.estoque',
      senha: 'estoque#pk',
      email: 'beatriz.lima@pixelkids.com.br',
      telefone: '(11) 99876-1234',
      anotacoes: 'Conferência física no recebimento de mercadorias, etiquetagem e controle de perdas.',
      ultimo_acesso: '23/09/2026 às 16:10'
    }
  ];

  const defaultFornecedores = [
    {
      id: 'forn_1',
      nome_fornecedor: 'Têxtil Kids Confecções Ltda',
      cnpj: '14.285.912/0001-78',
      endereco: 'Rua das Malhas, 420 - Bom Retiro, São Paulo/SP - CEP 01124-000',
      telefone: '(11) 3224-8800',
      email: 'contato@textilkids.com.br',
      anotacoes: 'Fornecedor principal de vestidos florais e conjuntinhos de verão. Faturamento 28/56 dias. Pedido mínimo 50 peças.'
    },
    {
      id: 'forn_2',
      nome_fornecedor: 'Malhas Encanto Infantil ME',
      cnpj: '22.841.633/0001-45',
      endereco: 'Av. Tiradentes, 1580 - Brás, São Paulo/SP - CEP 03002-010',
      telefone: '(11) 2694-1122',
      email: 'pedidos@malhasencanto.com.br',
      anotacoes: 'Especialista em body de bebê, mijões e kits maternidade em suedine 100% algodão egípcio.'
    },
    {
      id: 'forn_3',
      nome_fornecedor: 'Algodão Doce Indústria Têxtil',
      cnpj: '08.452.190/0001-32',
      endereco: 'Rodovia SC-411, Km 14 - Gaspar/SC - CEP 89110-000',
      telefone: '(47) 3332-9090',
      email: 'vendas@algodaodocetextil.com.br',
      anotacoes: 'Camisetas em algodão penteado e bermudas moletom juvenil. Frete CIF acima de R$ 3.000.'
    },
    {
      id: 'forn_4',
      nome_fornecedor: 'Mini Moda Confecção & Estilo',
      cnpj: '31.904.552/0001-90',
      endereco: 'Rua 25 de Março, 890, Sl. 4 - Centro, São Paulo/SP - CEP 01021-000',
      telefone: '(11) 3105-7766',
      email: 'comercial@minimodakids.com.br',
      anotacoes: 'Acessórios, laços artesanais, meias e faixas de cabelo para bebês e crianças.'
    }
  ];

  // Recupera ou inicializa no LocalStorage
  let funcionarios = [];
  try {
    const salvoFunc = localStorage.getItem('pixelkids_equipe_funcionarios');
    funcionarios = salvoFunc ? JSON.parse(salvoFunc) : defaultFuncionarios;
  } catch (e) {
    funcionarios = defaultFuncionarios;
  }

  let fornecedores = [];
  try {
    const salvoForn = localStorage.getItem('pixelkids_equipe_fornecedores');
    fornecedores = salvoForn ? JSON.parse(salvoForn) : defaultFornecedores;
  } catch (e) {
    fornecedores = defaultFornecedores;
  }

  function persistirDados() {
    try {
      localStorage.setItem('pixelkids_equipe_funcionarios', JSON.stringify(funcionarios));
      localStorage.setItem('pixelkids_equipe_fornecedores', JSON.stringify(fornecedores));
    } catch (e) {
      console.warn('Erro ao salvar no LocalStorage:', e);
    }
    atualizarCardsContadores();
  }

  // Elementos do Toast
  const equipeToast = document.getElementById('equipeToast');
  const toastEquipeMessage = document.getElementById('toastEquipeMessage');
  let equipeToastTimeout = null;

  function showToastEquipe(msg, type = 'success') {
    if (!equipeToast || !toastEquipeMessage) return;
    toastEquipeMessage.textContent = msg;
    equipeToast.className = 'estoque-toast show';
    if (type === 'warning') equipeToast.classList.add('toast-warning');
    if (type === 'error') equipeToast.classList.add('toast-error');
    if (type === 'success') equipeToast.classList.add('toast-success');

    if (equipeToastTimeout) clearTimeout(equipeToastTimeout);
    equipeToastTimeout = setTimeout(() => {
      equipeToast.classList.remove('show');
    }, 3500);
  }

  // Elementos de Contadores
  const cardTotalFuncionarios = document.getElementById('cardTotalFuncionarios');
  const cardTotalFornecedores = document.getElementById('cardTotalFornecedores');
  const contadorFuncionarios = document.getElementById('contadorFuncionarios');
  const totalFuncionariosBadge = document.getElementById('totalFuncionariosBadge');
  const contadorFornecedores = document.getElementById('contadorFornecedores');
  const totalFornecedoresBadge = document.getElementById('totalFornecedoresBadge');

  function atualizarCardsContadores() {
    if (cardTotalFuncionarios) cardTotalFuncionarios.textContent = funcionarios.length.toString();
    if (totalFuncionariosBadge) totalFuncionariosBadge.textContent = funcionarios.length.toString();
    if (cardTotalFornecedores) cardTotalFornecedores.textContent = fornecedores.length.toString();
    if (totalFornecedoresBadge) totalFornecedoresBadge.textContent = fornecedores.length.toString();
  }

  // Formatação de Máscaras
  function formatarTelefone(v) {
    let digits = v.replace(/\D/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3').replace(/-$/, '');
    }
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3').replace(/-$/, '');
  }

  function formatarCnpj(v) {
    let digits = v.replace(/\D/g, '');
    if (digits.length > 14) digits = digits.slice(0, 14);
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})$/, '$1.$2.$3/$4-$5').replace(/[.\-/]+$/, '');
  }

  // Retorna iniciais do nome para o avatar
  function getIniciaisNome(nome) {
    if (!nome) return 'PK';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  // Retorna a classe visual de badge da função
  function getClasseRole(funcao) {
    const f = (funcao || '').toLowerCase();
    if (f.includes('gerente')) return 'role-gerente';
    if (f.includes('admin')) return 'role-adm';
    if (f.includes('venda')) return 'role-vendas';
    if (f.includes('caixa')) return 'role-caixa';
    if (f.includes('estoque') || f.includes('logística')) return 'role-estoque';
    return 'role-adm';
  }

  // =========================================================================
  // 2. RENDERIZAÇÃO DA TABELA DE FUNCIONÁRIOS
  // =========================================================================
  const funcionariosTbody = document.getElementById('funcionariosTableBody');
  const inputBuscaFuncionarios = document.getElementById('inputBuscaFuncionarios');
  const btnClearSearchFuncionarios = document.getElementById('btnClearSearchFuncionarios');
  let currentSortFuncionarios = 'padrao';

  function renderFuncionarios() {
    if (!funcionariosTbody) return;
    funcionariosTbody.innerHTML = '';

    const termo = (inputBuscaFuncionarios ? inputBuscaFuncionarios.value.trim().toLowerCase() : '');

    // Filtragem
    let listaFiltrada = funcionarios.filter((item) => {
      if (!termo) return true;
      const nome = (item.nome_completo || '').toLowerCase();
      const func = (item.funcao || '').toLowerCase();
      const login = (item.login || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const tel = (item.telefone || '').toLowerCase();
      return nome.includes(termo) || func.includes(termo) || login.includes(termo) || email.includes(termo) || tel.includes(termo);
    });

    // Ordenação
    if (currentSortFuncionarios === 'nome-asc') {
      listaFiltrada.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo, 'pt-BR'));
    } else if (currentSortFuncionarios === 'nome-desc') {
      listaFiltrada.sort((a, b) => b.nome_completo.localeCompare(a.nome_completo, 'pt-BR'));
    } else if (currentSortFuncionarios === 'funcao-asc') {
      listaFiltrada.sort((a, b) => a.funcao.localeCompare(b.funcao, 'pt-BR'));
    }

    if (contadorFuncionarios) {
      contadorFuncionarios.textContent = listaFiltrada.length.toString();
    }

    if (listaFiltrada.length === 0) {
      const trEmpty = document.createElement('tr');
      trEmpty.innerHTML = `
        <td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--text-light);">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span style="font-weight: 600;">Nenhum colaborador encontrado com o filtro atual.</span>
          </div>
        </td>
      `;
      funcionariosTbody.appendChild(trEmpty);
      return;
    }

    listaFiltrada.forEach((func, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'produto-row';
      tr.id = `row-func-${func.id}`;

      // Semântica estrita: atributos data-* no elemento HTML para facilitar integração
      tr.dataset.id = func.id;
      tr.dataset.nome = func.nome_completo;
      tr.dataset.funcao = func.funcao;
      tr.dataset.login = func.login;
      tr.dataset.senha = func.senha;
      tr.dataset.email = func.email;
      tr.dataset.telefone = func.telefone;
      tr.dataset.anotacoes = func.anotacoes || '';
      tr.dataset.ultimoAcesso = func.ultimo_acesso || '';

      const colorClass = `avatar-color-${idx % 5}`;
      const iniciais = getIniciaisNome(func.nome_completo);
      const roleClass = getClasseRole(func.funcao);

      tr.innerHTML = `
        <td>
          <div class="user-cell">
            <div class="user-avatar-circle ${colorClass}" aria-hidden="true">${iniciais}</div>
            <div>
              <div class="user-name-title">${func.nome_completo}</div>
              ${func.anotacoes ? `<div class="notes-snippet" title="${func.anotacoes}">${func.anotacoes}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span class="badge-role ${roleClass}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            ${func.funcao}
          </span>
        </td>
        <td>
          <span class="credential-tag" title="Login de acesso">
            @${func.login}
          </span>
        </td>
        <td>
          <div class="contact-stack">
            <a href="mailto:${func.email}" class="contact-item-link" title="Enviar e-mail">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>${func.email}</span>
            </a>
            <a href="tel:${func.telefone.replace(/\D/g, '')}" class="contact-item-link" title="Ligar para o colaborador">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>${func.telefone}</span>
            </a>
          </div>
        </td>
        <td>
          <span class="last-access-badge" title="Registro do último acesso">
            <span class="access-dot" aria-hidden="true"></span>
            <span>${func.ultimo_acesso || 'Sem registros'}</span>
          </span>
        </td>
        <td class="cell-actions col-actions">
          <button type="button" class="btn-action-detail btn-detail-func" data-id="${func.id}" title="Detalhar e Editar este colaborador" aria-label="Detalhar ${func.nome_completo}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Detalhar / Editar</span>
          </button>
        </td>
      `;

      funcionariosTbody.appendChild(tr);
    });

    // Vincula botão de Detalhar / Editar
    funcionariosTbody.querySelectorAll('.btn-detail-func').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = funcionarios.find((f) => f.id === id);
        if (item) abrirModalFuncionario(item);
      });
    });
  }

  // =========================================================================
  // 3. RENDERIZAÇÃO DA TABELA DE FORNECEDORES
  // =========================================================================
  const fornecedoresTbody = document.getElementById('fornecedoresTableBody');
  const inputBuscaFornecedores = document.getElementById('inputBuscaFornecedores');
  const btnClearSearchFornecedores = document.getElementById('btnClearSearchFornecedores');
  let currentSortFornecedores = 'padrao';

  function renderFornecedores() {
    if (!fornecedoresTbody) return;
    fornecedoresTbody.innerHTML = '';

    const termo = (inputBuscaFornecedores ? inputBuscaFornecedores.value.trim().toLowerCase() : '');

    let listaFiltrada = fornecedores.filter((item) => {
      if (!termo) return true;
      const nome = (item.nome_fornecedor || '').toLowerCase();
      const cnpj = (item.cnpj || '').toLowerCase();
      const end = (item.endereco || '').toLowerCase();
      const tel = (item.telefone || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      return nome.includes(termo) || cnpj.includes(termo) || end.includes(termo) || tel.includes(termo) || email.includes(termo);
    });

    if (currentSortFornecedores === 'nome-asc') {
      listaFiltrada.sort((a, b) => a.nome_fornecedor.localeCompare(b.nome_fornecedor, 'pt-BR'));
    } else if (currentSortFornecedores === 'nome-desc') {
      listaFiltrada.sort((a, b) => b.nome_fornecedor.localeCompare(a.nome_fornecedor, 'pt-BR'));
    }

    if (contadorFornecedores) {
      contadorFornecedores.textContent = listaFiltrada.length.toString();
    }

    if (listaFiltrada.length === 0) {
      const trEmpty = document.createElement('tr');
      trEmpty.innerHTML = `
        <td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--text-light);">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span style="font-weight: 600;">Nenhum fornecedor encontrado com o filtro atual.</span>
          </div>
        </td>
      `;
      fornecedoresTbody.appendChild(trEmpty);
      return;
    }

    listaFiltrada.forEach((forn) => {
      const tr = document.createElement('tr');
      tr.className = 'produto-row';
      tr.id = `row-forn-${forn.id}`;

      // Semântica estrita de dataset
      tr.dataset.id = forn.id;
      tr.dataset.nome = forn.nome_fornecedor;
      tr.dataset.cnpj = forn.cnpj;
      tr.dataset.endereco = forn.endereco;
      tr.dataset.telefone = forn.telefone;
      tr.dataset.email = forn.email;
      tr.dataset.anotacoes = forn.anotacoes || '';

      tr.innerHTML = `
        <td>
          <div class="supplier-cell">
            <div class="supplier-icon-box" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div>
              <div class="supplier-name-title">${forn.nome_fornecedor}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="cnpj-badge" title="Cadastro Nacional da Pessoa Jurídica">
            ${forn.cnpj}
          </span>
        </td>
        <td>
          <div class="address-snippet" title="${forn.endereco}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${forn.endereco}</span>
          </div>
        </td>
        <td>
          <div class="contact-stack">
            <a href="tel:${forn.telefone.replace(/\D/g, '')}" class="contact-item-link" title="Ligar para o fornecedor">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>${forn.telefone}</span>
            </a>
            <a href="mailto:${forn.email}" class="contact-item-link" title="Enviar e-mail de pedidos">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>${forn.email}</span>
            </a>
          </div>
        </td>
        <td>
          <div class="notes-snippet" title="${forn.anotacoes}">
            ${forn.anotacoes || '<span style="color: var(--text-light); font-style: italic;">Sem observações</span>'}
          </div>
        </td>
        <td class="cell-actions col-actions">
          <button type="button" class="btn-action-detail btn-detail-forn" data-id="${forn.id}" title="Detalhar e Editar este fornecedor" aria-label="Detalhar ${forn.nome_fornecedor}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Detalhar / Editar</span>
          </button>
        </td>
      `;

      fornecedoresTbody.appendChild(tr);
    });

    // Vincula botão de Detalhar / Editar
    fornecedoresTbody.querySelectorAll('.btn-detail-forn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = fornecedores.find((f) => f.id === id);
        if (item) abrirModalFornecedor(item);
      });
    });
  }

  // =========================================================================
  // 4. FILTROS E BUSCA (FUNCIONÁRIOS E FORNECEDORES)
  // =========================================================================
  if (inputBuscaFuncionarios) {
    inputBuscaFuncionarios.addEventListener('input', () => {
      if (btnClearSearchFuncionarios) {
        btnClearSearchFuncionarios.style.display = inputBuscaFuncionarios.value ? 'block' : 'none';
      }
      renderFuncionarios();
    });
  }

  if (btnClearSearchFuncionarios && inputBuscaFuncionarios) {
    btnClearSearchFuncionarios.addEventListener('click', () => {
      inputBuscaFuncionarios.value = '';
      btnClearSearchFuncionarios.style.display = 'none';
      renderFuncionarios();
      inputBuscaFuncionarios.focus();
    });
  }

  const btnFiltrarFuncionarios = document.getElementById('btnFiltrarFuncionarios');
  const dropdownSortFuncionarios = document.getElementById('dropdownSortFuncionarios');
  if (btnFiltrarFuncionarios && dropdownSortFuncionarios) {
    btnFiltrarFuncionarios.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdownSortFuncionarios.classList.toggle('active');
      btnFiltrarFuncionarios.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    dropdownSortFuncionarios.querySelectorAll('.filter-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        dropdownSortFuncionarios.querySelectorAll('.filter-option-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentSortFuncionarios = btn.getAttribute('data-sort-func') || 'padrao';
        dropdownSortFuncionarios.classList.remove('active');
        btnFiltrarFuncionarios.setAttribute('aria-expanded', 'false');
        renderFuncionarios();
      });
    });
  }

  // Busca Fornecedores
  if (inputBuscaFornecedores) {
    inputBuscaFornecedores.addEventListener('input', () => {
      if (btnClearSearchFornecedores) {
        btnClearSearchFornecedores.style.display = inputBuscaFornecedores.value ? 'block' : 'none';
      }
      renderFornecedores();
    });
  }

  if (btnClearSearchFornecedores && inputBuscaFornecedores) {
    btnClearSearchFornecedores.addEventListener('click', () => {
      inputBuscaFornecedores.value = '';
      btnClearSearchFornecedores.style.display = 'none';
      renderFornecedores();
      inputBuscaFornecedores.focus();
    });
  }

  const btnFiltrarFornecedores = document.getElementById('btnFiltrarFornecedores');
  const dropdownSortFornecedores = document.getElementById('dropdownSortFornecedores');
  if (btnFiltrarFornecedores && dropdownSortFornecedores) {
    btnFiltrarFornecedores.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdownSortFornecedores.classList.toggle('active');
      btnFiltrarFornecedores.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    dropdownSortFornecedores.querySelectorAll('.filter-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        dropdownSortFornecedores.querySelectorAll('.filter-option-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentSortFornecedores = btn.getAttribute('data-sort-forn') || 'padrao';
        dropdownSortFornecedores.classList.remove('active');
        btnFiltrarFornecedores.setAttribute('aria-expanded', 'false');
        renderFornecedores();
      });
    });
  }

  // Fecha menus ao clicar fora
  document.addEventListener('click', (e) => {
    if (dropdownSortFuncionarios && !dropdownSortFuncionarios.contains(e.target) && e.target !== btnFiltrarFuncionarios) {
      dropdownSortFuncionarios.classList.remove('active');
      if (btnFiltrarFuncionarios) btnFiltrarFuncionarios.setAttribute('aria-expanded', 'false');
    }
    if (dropdownSortFornecedores && !dropdownSortFornecedores.contains(e.target) && e.target !== btnFiltrarFornecedores) {
      dropdownSortFornecedores.classList.remove('active');
      if (btnFiltrarFornecedores) btnFiltrarFornecedores.setAttribute('aria-expanded', 'false');
    }
  });

  // =========================================================================
  // 5. MODAL DE FUNCIONÁRIO (CADASTRO / EDIÇÃO)
  // =========================================================================
  const modalFuncionario = document.getElementById('modalFuncionario');
  const formFuncionario = document.getElementById('formFuncionario');
  const modalFuncionarioTitle = document.getElementById('modalFuncionarioTitle');
  const modalFuncBadgeText = document.getElementById('modalFuncBadgeText');
  const btnCadastrarFuncionario = document.getElementById('btnCadastrarFuncionario');
  const btnFecharModalFunc = document.getElementById('btnFecharModalFunc');
  const btnCancelarFunc = document.getElementById('btnCancelarFunc');
  const btnExcluirFuncionarioModal = document.getElementById('btnExcluirFuncionarioModal');

  const funcEditId = document.getElementById('funcEditId');
  const funcNome = document.getElementById('funcNome');
  const funcFuncao = document.getElementById('funcFuncao');
  const funcLogin = document.getElementById('funcLogin');
  const funcSenha = document.getElementById('funcSenha');
  const funcEmail = document.getElementById('funcEmail');
  const funcTelefone = document.getElementById('funcTelefone');
  const funcAnotacoes = document.getElementById('funcAnotacoes');
  const funcAuditText = document.getElementById('funcAuditText');
  const btnToggleSenhaFunc = document.getElementById('btnToggleSenhaFunc');
  const iconEyeOpen = document.getElementById('iconEyeOpen');
  const iconEyeClosed = document.getElementById('iconEyeClosed');

  // Toggle de visualização da senha
  if (btnToggleSenhaFunc && funcSenha) {
    btnToggleSenhaFunc.addEventListener('click', () => {
      const isPass = funcSenha.type === 'password';
      funcSenha.type = isPass ? 'text' : 'password';
      if (iconEyeOpen) iconEyeOpen.style.display = isPass ? 'none' : 'block';
      if (iconEyeClosed) iconEyeClosed.style.display = isPass ? 'block' : 'none';
    });
  }

  // Máscara de telefone do funcionário
  if (funcTelefone) {
    funcTelefone.addEventListener('input', (e) => {
      e.target.value = formatarTelefone(e.target.value);
    });
  }

  function abrirModalFuncionario(funcExistente = null) {
    if (!modalFuncionario) return;
    if (formFuncionario) formFuncionario.reset();

    // Restaura visualização da senha como oculta
    if (funcSenha) funcSenha.type = 'password';
    if (iconEyeOpen) iconEyeOpen.style.display = 'block';
    if (iconEyeClosed) iconEyeClosed.style.display = 'none';

    if (funcExistente) {
      if (modalFuncionarioTitle) modalFuncionarioTitle.textContent = 'Detalhes do Colaborador';
      if (modalFuncBadgeText) modalFuncBadgeText.textContent = 'Edição / Detalhes';
      if (btnExcluirFuncionarioModal) {
        btnExcluirFuncionarioModal.style.display = 'inline-flex';
        btnExcluirFuncionarioModal.onclick = () => {
          abrirConfirmacaoExclusao('func', funcExistente.id, funcExistente.nome_completo);
        };
      }
      if (funcEditId) funcEditId.value = funcExistente.id;
      if (funcNome) funcNome.value = funcExistente.nome_completo;
      if (funcFuncao) funcFuncao.value = funcExistente.funcao;
      if (funcLogin) funcLogin.value = funcExistente.login;
      if (funcSenha) funcSenha.value = funcExistente.senha;
      if (funcEmail) funcEmail.value = funcExistente.email;
      if (funcTelefone) funcTelefone.value = funcExistente.telefone;
      if (funcAnotacoes) funcAnotacoes.value = funcExistente.anotacoes || '';
      if (funcAuditText) funcAuditText.textContent = funcExistente.ultimo_acesso || 'Sem registros';
    } else {
      if (modalFuncionarioTitle) modalFuncionarioTitle.textContent = 'Cadastrar Funcionário';
      if (modalFuncBadgeText) modalFuncBadgeText.textContent = 'Novo Cadastro';
      if (btnExcluirFuncionarioModal) {
        btnExcluirFuncionarioModal.style.display = 'none';
        btnExcluirFuncionarioModal.onclick = null;
      }
      if (funcEditId) funcEditId.value = '';
      if (funcAuditText) funcAuditText.textContent = 'Novo cadastro (será registrado no 1º login)';
    }

    modalFuncionario.classList.add('active');
    modalFuncionario.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (funcNome) funcNome.focus();
    }, 100);
  }

  function fecharModalFuncionario() {
    if (!modalFuncionario) return;
    modalFuncionario.classList.remove('active');
    modalFuncionario.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnCadastrarFuncionario) {
    btnCadastrarFuncionario.addEventListener('click', () => abrirModalFuncionario(null));
  }
  if (btnFecharModalFunc) btnFecharModalFunc.addEventListener('click', fecharModalFuncionario);
  if (btnCancelarFunc) btnCancelarFunc.addEventListener('click', fecharModalFuncionario);
  if (modalFuncionario) {
    modalFuncionario.addEventListener('click', (e) => {
      if (e.target === modalFuncionario) fecharModalFuncionario();
    });
  }

  if (formFuncionario) {
    formFuncionario.addEventListener('submit', (e) => {
      e.preventDefault();

      const nomeVal = funcNome ? funcNome.value.trim() : '';
      const funcaoVal = funcFuncao ? funcFuncao.value : '';
      const loginVal = funcLogin ? funcLogin.value.trim().replace(/^@/, '') : '';
      const senhaVal = funcSenha ? funcSenha.value.trim() : '';
      const emailVal = funcEmail ? funcEmail.value.trim() : '';
      const telVal = funcTelefone ? funcTelefone.value.trim() : '';
      const anotVal = funcAnotacoes ? funcAnotacoes.value.trim() : '';
      const idVal = funcEditId ? funcEditId.value : '';

      if (!nomeVal || !funcaoVal || !loginVal || !senhaVal || !emailVal || !telVal) {
        showToastEquipe('Preencha todos os campos obrigatórios (*)', 'warning');
        return;
      }

      if (idVal) {
        // Atualizar
        const idx = funcionarios.findIndex((f) => f.id === idVal);
        if (idx !== -1) {
          funcionarios[idx] = {
            ...funcionarios[idx],
            nome_completo: nomeVal,
            funcao: funcaoVal,
            login: loginVal,
            senha: senhaVal,
            email: emailVal,
            telefone: telVal,
            anotacoes: anotVal
          };
          showToastEquipe(`Colaborador "${nomeVal}" atualizado com sucesso!`);
        }
      } else {
        // Inserir novo
        const novoFunc = {
          id: 'func_' + Date.now(),
          nome_completo: nomeVal,
          funcao: funcaoVal,
          login: loginVal,
          senha: senhaVal,
          email: emailVal,
          telefone: telVal,
          anotacoes: anotVal,
          ultimo_acesso: 'Recém-cadastrado'
        };
        funcionarios.unshift(novoFunc);
        showToastEquipe(`Colaborador "${nomeVal}" cadastrado com sucesso!`);
      }

      persistirDados();
      renderFuncionarios();
      fecharModalFuncionario();
    });
  }

  // =========================================================================
  // 6. MODAL DE FORNECEDOR (CADASTRO / EDIÇÃO)
  // =========================================================================
  const modalFornecedor = document.getElementById('modalFornecedor');
  const formFornecedor = document.getElementById('formFornecedor');
  const modalFornecedorTitle = document.getElementById('modalFornecedorTitle');
  const modalFornBadgeText = document.getElementById('modalFornBadgeText');
  const btnCadastrarFornecedor = document.getElementById('btnCadastrarFornecedor');
  const btnFecharModalForn = document.getElementById('btnFecharModalForn');
  const btnCancelarForn = document.getElementById('btnCancelarForn');
  const btnExcluirFornecedorModal = document.getElementById('btnExcluirFornecedorModal');

  const fornEditId = document.getElementById('fornEditId');
  const fornNome = document.getElementById('fornNome');
  const fornCnpj = document.getElementById('fornCnpj');
  const fornEndereco = document.getElementById('fornEndereco');
  const fornTelefone = document.getElementById('fornTelefone');
  const fornEmail = document.getElementById('fornEmail');
  const fornAnotacoes = document.getElementById('fornAnotacoes');

  // Máscaras de fornecedor
  if (fornCnpj) {
    fornCnpj.addEventListener('input', (e) => {
      e.target.value = formatarCnpj(e.target.value);
    });
  }
  if (fornTelefone) {
    fornTelefone.addEventListener('input', (e) => {
      e.target.value = formatarTelefone(e.target.value);
    });
  }

  function abrirModalFornecedor(fornExistente = null) {
    if (!modalFornecedor) return;
    if (formFornecedor) formFornecedor.reset();

    if (fornExistente) {
      if (modalFornecedorTitle) modalFornecedorTitle.textContent = 'Detalhes do Fornecedor';
      if (modalFornBadgeText) modalFornBadgeText.textContent = 'Edição / Detalhes';
      if (btnExcluirFornecedorModal) {
        btnExcluirFornecedorModal.style.display = 'inline-flex';
        btnExcluirFornecedorModal.onclick = () => {
          abrirConfirmacaoExclusao('forn', fornExistente.id, fornExistente.nome_fornecedor);
        };
      }
      if (fornEditId) fornEditId.value = fornExistente.id;
      if (fornNome) fornNome.value = fornExistente.nome_fornecedor;
      if (fornCnpj) fornCnpj.value = fornExistente.cnpj;
      if (fornEndereco) fornEndereco.value = fornExistente.endereco;
      if (fornTelefone) fornTelefone.value = fornExistente.telefone;
      if (fornEmail) fornEmail.value = fornExistente.email;
      if (fornAnotacoes) fornAnotacoes.value = fornExistente.anotacoes || '';
    } else {
      if (modalFornecedorTitle) modalFornecedorTitle.textContent = 'Cadastrar Fornecedor';
      if (modalFornBadgeText) modalFornBadgeText.textContent = 'Novo Parceiro';
      if (btnExcluirFornecedorModal) {
        btnExcluirFornecedorModal.style.display = 'none';
        btnExcluirFornecedorModal.onclick = null;
      }
      if (fornEditId) fornEditId.value = '';
    }

    modalFornecedor.classList.add('active');
    modalFornecedor.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (fornNome) fornNome.focus();
    }, 100);
  }

  function fecharModalFornecedor() {
    if (!modalFornecedor) return;
    modalFornecedor.classList.remove('active');
    modalFornecedor.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnCadastrarFornecedor) {
    btnCadastrarFornecedor.addEventListener('click', () => abrirModalFornecedor(null));
  }
  if (btnFecharModalForn) btnFecharModalForn.addEventListener('click', fecharModalFornecedor);
  if (btnCancelarForn) btnCancelarForn.addEventListener('click', fecharModalFornecedor);
  if (modalFornecedor) {
    modalFornecedor.addEventListener('click', (e) => {
      if (e.target === modalFornecedor) fecharModalFornecedor();
    });
  }

  if (formFornecedor) {
    formFornecedor.addEventListener('submit', (e) => {
      e.preventDefault();

      const nomeVal = fornNome ? fornNome.value.trim() : '';
      const cnpjVal = fornCnpj ? fornCnpj.value.trim() : '';
      const endVal = fornEndereco ? fornEndereco.value.trim() : '';
      const telVal = fornTelefone ? fornTelefone.value.trim() : '';
      const emailVal = fornEmail ? fornEmail.value.trim() : '';
      const anotVal = fornAnotacoes ? fornAnotacoes.value.trim() : '';
      const idVal = fornEditId ? fornEditId.value : '';

      if (!nomeVal || !cnpjVal || !endVal || !telVal || !emailVal) {
        showToastEquipe('Preencha todos os campos obrigatórios (*)', 'warning');
        return;
      }

      if (idVal) {
        // Atualizar
        const idx = fornecedores.findIndex((f) => f.id === idVal);
        if (idx !== -1) {
          fornecedores[idx] = {
            ...fornecedores[idx],
            nome_fornecedor: nomeVal,
            cnpj: cnpjVal,
            endereco: endVal,
            telefone: telVal,
            email: emailVal,
            anotacoes: anotVal
          };
          showToastEquipe(`Fornecedor "${nomeVal}" atualizado com sucesso!`);
        }
      } else {
        // Inserir novo
        const novoForn = {
          id: 'forn_' + Date.now(),
          nome_fornecedor: nomeVal,
          cnpj: cnpjVal,
          endereco: endVal,
          telefone: telVal,
          email: emailVal,
          anotacoes: anotVal
        };
        fornecedores.unshift(novoForn);
        showToastEquipe(`Fornecedor "${nomeVal}" cadastrado com sucesso!`);
      }

      persistirDados();
      renderFornecedores();
      fecharModalFornecedor();
    });
  }

  // =========================================================================
  // 7. CONFIRMAÇÃO DE EXCLUSÃO (FUNCIONÁRIO OU FORNECEDOR)
  // =========================================================================
  const modalConfirmarExclusaoEquipe = document.getElementById('modalConfirmarExclusaoEquipe');
  const itemExclusaoNome = document.getElementById('itemExclusaoNome');
  const btnFecharModalExclusaoEquipe = document.getElementById('btnFecharModalExclusaoEquipe');
  const btnCancelarExclusaoEquipe = document.getElementById('btnCancelarExclusaoEquipe');
  const btnConfirmarExclusaoEquipe = document.getElementById('btnConfirmarExclusaoEquipe');

  let itemParaExcluir = null; // { tipo: 'func' | 'forn', id: string, nome: string }

  function abrirConfirmacaoExclusao(tipo, id, nome) {
    if (!modalConfirmarExclusaoEquipe) return;
    itemParaExcluir = { tipo, id, nome };
    if (itemExclusaoNome) {
      const rotulo = tipo === 'func' ? 'o colaborador' : 'o fornecedor';
      itemExclusaoNome.textContent = `${rotulo} "${nome}"`;
    }
    modalConfirmarExclusaoEquipe.classList.add('active');
    modalConfirmarExclusaoEquipe.setAttribute('aria-hidden', 'false');
  }

  function fecharConfirmacaoExclusao() {
    if (!modalConfirmarExclusaoEquipe) return;
    modalConfirmarExclusaoEquipe.classList.remove('active');
    modalConfirmarExclusaoEquipe.setAttribute('aria-hidden', 'true');
    itemParaExcluir = null;
  }

  if (btnFecharModalExclusaoEquipe) btnFecharModalExclusaoEquipe.addEventListener('click', fecharConfirmacaoExclusao);
  if (btnCancelarExclusaoEquipe) btnCancelarExclusaoEquipe.addEventListener('click', fecharConfirmacaoExclusao);
  if (modalConfirmarExclusaoEquipe) {
    modalConfirmarExclusaoEquipe.addEventListener('click', (e) => {
      if (e.target === modalConfirmarExclusaoEquipe) fecharConfirmacaoExclusao();
    });
  }

  if (btnConfirmarExclusaoEquipe) {
    btnConfirmarExclusaoEquipe.addEventListener('click', () => {
      if (!itemParaExcluir) return;

      if (itemParaExcluir.tipo === 'func') {
        funcionarios = funcionarios.filter((f) => f.id !== itemParaExcluir.id);
        persistirDados();
        renderFuncionarios();
        fecharModalFuncionario();
        showToastEquipe(`Colaborador "${itemParaExcluir.nome}" excluído com sucesso!`, 'warning');
      } else if (itemParaExcluir.tipo === 'forn') {
        fornecedores = fornecedores.filter((f) => f.id !== itemParaExcluir.id);
        persistirDados();
        renderFornecedores();
        fecharModalFornecedor();
        showToastEquipe(`Fornecedor "${itemParaExcluir.nome}" excluído com sucesso!`, 'warning');
      }

      fecharConfirmacaoExclusao();
    });
  }

  // Renderização inicial
  renderFuncionarios();
  renderFornecedores();
  atualizarCardsContadores();
}


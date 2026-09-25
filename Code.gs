/**
 * ============================================================================
 * PixelKids - Integração Google Planilhas (Google Apps Script)
 * Arquivo: Code.gs
 * 
 * Planilha ID: 1aEGav19ByoJamz_REZD7S1hwX7ndRXN-i5NY4eNqE7A
 * Aba: "Estoque"
 * Cabeçalho: B2:AD2 (Linha 2, Colunas 2 a 30)
 * Dados: Linha 3 em diante
 * ============================================================================
 */

// ID da Planilha configurada
var SPREADSHEET_ID = '1aEGav19ByoJamz_REZD7S1hwX7ndRXN-i5NY4eNqE7A';
var SHEET_NAME = 'Estoque';

/**
 * ----------------------------------------------------------------------------
 * 1. FUNÇÃO DE TESTE E AUTORIZAÇÃO (EXECUTE UMA VEZ NO EDITOR):
 * ----------------------------------------------------------------------------
 * Selecione esta função no topo do editor do Apps Script e clique em "Executar".
 * Isso fará o Google exibir a caixa "Autorização necessária".
 * Siga os passos: Avançado > Acessar (não seguro) > Permitir.
 */
function autorizarETestarScript() {
  var sheet = getEstoqueSheet();
  var totalLinhas = sheet.getLastRow();
  Logger.log('==============================================');
  Logger.log('✅ Autorização concedida e teste bem-sucedido!');
  Logger.log('Planilha: ' + sheet.getParent().getName());
  Logger.log('Aba: ' + sheet.getName());
  Logger.log('Total de Linhas existentes: ' + totalLinhas);
  Logger.log('==============================================');
  return 'Autorizado com sucesso! Linhas na planilha: ' + totalLinhas;
}

// Ordem exata das 29 colunas da tabela a partir da coluna B (coluna 2):
var COLUMNS = [
  'codigo',          // Col B (2)
  'nome',            // Col C (3)
  'categoria',       // Col D (4)
  'preco_venda',     // Col E (5)
  'tam_rn',          // Col F (6)
  'tam_p',           // Col G (7)
  'tam_m',           // Col H (8)
  'tam_g',           // Col I (9)
  'tam_gg',          // Col J (10)
  'tam_1',           // Col K (11)
  'tam_2',           // Col L (12)
  'tam_3',           // Col M (13)
  'tam_4',           // Col N (14)
  'tam_6',           // Col O (15)
  'tam_8',           // Col P (16)
  'tam_10',          // Col Q (17)
  'tam_12',          // Col R (18)
  'tam_14',          // Col S (19)
  'tam_16',          // Col T (20)
  'qtd_total',       // Col U (21) - Calculado pela soma dos tamanhos
  'estoque_minimo',   // Col V (22)
  'fornecedor_1',    // Col W (23)
  'custo_1',         // Col X (24)
  'fornecedor_2',    // Col Y (25)
  'custo_2',         // Col Z (26)
  'fornecedor_3',    // Col AA (27)
  'custo_3',         // Col AB (28)
  'anotacoes',       // Col AC (29)
  'ultima_alteracao' // Col AD (30)
];

// Chaves dos 15 tamanhos para cálculo da quantidade total
var SIZE_KEYS = [
  'tam_rn', 'tam_p', 'tam_m', 'tam_g', 'tam_gg',
  'tam_1', 'tam_2', 'tam_3',
  'tam_4', 'tam_6', 'tam_8', 'tam_10', 'tam_12', 'tam_14', 'tam_16'
];

/**
 * Obtém a aba de trabalho "Estoque" da planilha
 */
function getEstoqueSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  if (!ss) {
    throw new Error('Não foi possível abrir a planilha com ID: ' + SPREADSHEET_ID);
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // Se a aba ainda não existir, cria e configura o cabeçalho automaticamente
    sheet = ss.insertSheet(SHEET_NAME);
    setupSheetHeaders(sheet);
  }
  return sheet;
}

/**
 * Função utilitária para configurar o cabeçalho na linha 2 (B2:AD2)
 */
function setupSheetHeaders(sheet) {
  if (!sheet) sheet = getEstoqueSheet();
  var headerTitles = [
    'Código', 'Nome do Produto', 'Categoria', 'Preço de Venda (R$)',
    'Tam RN', 'Tam P', 'Tam M', 'Tam G', 'Tam GG',
    'Tam 1', 'Tam 2', 'Tam 3',
    'Tam 4', 'Tam 6', 'Tam 8', 'Tam 10', 'Tam 12', 'Tam 14', 'Tam 16',
    'Qtd Total', 'Estoque Mínimo',
    'Fornecedor 1', 'Custo 1 (R$)',
    'Fornecedor 2', 'Custo 2 (R$)',
    'Fornecedor 3', 'Custo 3 (R$)',
    'Anotações / Obs', 'Última Alteração'
  ];

  var headerRange = sheet.getRange(2, 2, 1, headerTitles.length);
  headerRange.setValues([headerTitles]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#182c4f');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(2);
}

/**
 * Endpoint GET: Retorna os registros da aba "Estoque" em formato JSON
 */
function doGet(e) {
  try {
    // Teste rápido de ping/saúde da API
    if (e && e.parameter && e.parameter.action === 'ping') {
      return createJsonResponse({
        status: 'success',
        message: 'PixelKids API operacional!',
        timestamp: new Date().toISOString(),
        spreadsheetId: SPREADSHEET_ID
      });
    }

    var sheet = getEstoqueSheet();
    var lastRow = sheet.getLastRow();

    // Se houver apenas o cabeçalho ou estiver vazio
    if (lastRow < 3) {
      return createJsonResponse({
        status: 'success',
        total: 0,
        data: []
      });
    }

    var numRows = lastRow - 2; // Dados começam na linha 3
    var numCols = COLUMNS.length; // 29 colunas (B até AD)

    // Lê os dados a partir de B3 (linha 3, coluna 2)
    var range = sheet.getRange(3, 2, numRows, numCols);
    var values = range.getValues();

    var produtos = [];
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var codigo = String(row[0] || '').trim();

      // Ignora linhas totalmente vazias sem código
      if (!codigo) continue;

      var item = {};
      for (var j = 0; j < COLUMNS.length; j++) {
        var key = COLUMNS[j];
        var val = row[j];

        // Trata campos numéricos
        if (SIZE_KEYS.indexOf(key) !== -1 || key === 'qtd_total' || key === 'estoque_minimo') {
          item[key] = Number(val) || 0;
        } else if (key === 'preco_venda' || key === 'custo_1' || key === 'custo_2' || key === 'custo_3') {
          item[key] = val !== '' && val !== null ? Number(val) : '';
        } else if (val instanceof Date) {
          item[key] = Utilities.formatDate(val, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
        } else {
          item[key] = val !== null && val !== undefined ? String(val) : '';
        }
      }

      // Adiciona o número da linha correspondente na planilha
      item._rowNumber = i + 3;
      produtos.push(item);
    }

    return createJsonResponse({
      status: 'success',
      total: produtos.length,
      data: produtos
    });

  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Endpoint POST: Recebe o payload do modal.
 * Atualiza o produto se o código já existir ou insere um novo produto se não existir.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Aguarda até 10 segundos para obter lock exclusivo (previne condições de corrida)
    lock.waitLock(10000);

    var rawContent = e && e.postData && e.postData.contents ? e.postData.contents : '';
    var payload = null;

    if (rawContent) {
      try {
        payload = JSON.parse(rawContent);
      } catch (parseErr) {
        // Tenta continuar caso seja URL-encoded ou formato alternativo
      }
    }

    if (!payload && e && e.parameter && e.parameter.codigo) {
      payload = e.parameter;
    }

    if (!payload) {
      throw new Error('Nenhum dado válido recebido no corpo da requisição.');
    }

    // Validação básica do código do produto
    var codigo = String(payload.codigo || '').trim();
    if (!codigo) {
      throw new Error('O campo "codigo" é obrigatório.');
    }

    var sheet = getEstoqueSheet();
    var lastRow = sheet.getLastRow();

    // 1. Calcula a soma total dos 15 tamanhos (tam_rn até tam_16)
    var somaTamanhos = 0;
    for (var k = 0; k < SIZE_KEYS.length; k++) {
      var sizeKey = SIZE_KEYS[k];
      var qtdTam = Math.max(0, parseInt(payload[sizeKey] || 0, 10));
      payload[sizeKey] = qtdTam;
      somaTamanhos += qtdTam;
    }
    payload.qtd_total = somaTamanhos;

    // 2. Data/hora de última alteração (padrão Brasil)
    var agora = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
    var usuario = payload.usuario || payload.auditoria_user || 'PixelKidsADM';
    payload.ultima_alteracao = payload.ultima_alteracao || (usuario + ' em ' + agora);

    // 3. Monta o array da linha com as 29 colunas ordenadas (B até AD)
    var rowValues = [];
    for (var c = 0; c < COLUMNS.length; c++) {
      var colKey = COLUMNS[c];
      var cellVal = payload[colKey];
      if (cellVal === undefined || cellVal === null) {
        cellVal = '';
      }
      rowValues.push(cellVal);
    }

    // 4. Procura se o produto já existe na coluna B (a partir da linha 3)
    var targetRow = -1;
    var action = 'created';

    if (lastRow >= 3) {
      var codigosRange = sheet.getRange(3, 2, lastRow - 2, 1);
      var codigosValues = codigosRange.getValues();

      for (var r = 0; r < codigosValues.length; r++) {
        var existingCod = String(codigosValues[r][0] || '').trim();
        if (existingCod.toLowerCase() === codigo.toLowerCase()) {
          targetRow = r + 3; // Linha real na planilha
          action = 'updated';
          break;
        }
      }
    }

    // 5. Se não encontrou, anexa nova linha; se encontrou, atualiza a linha existente
    if (targetRow === -1) {
      targetRow = Math.max(3, lastRow + 1);
      sheet.getRange(targetRow, 2, 1, COLUMNS.length).setValues([rowValues]);
    } else {
      sheet.getRange(targetRow, 2, 1, COLUMNS.length).setValues([rowValues]);
    }

    return createJsonResponse({
      status: 'success',
      action: action,
      row: targetRow,
      codigo: codigo,
      qtd_total: somaTamanhos,
      timestamp: agora,
      message: action === 'updated' 
        ? 'Produto ' + codigo + ' atualizado com sucesso na linha ' + targetRow 
        : 'Produto ' + codigo + ' cadastrado com sucesso na linha ' + targetRow
    });

  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Cria a saída HTTP formatada em JSON com cabeçalhos apropriados
 */
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

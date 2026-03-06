/**
 * Data Access Layer для работы с Google Sheets.
 */
const SheetRepository = (function () {
  function ensureSheets() {
    const ss = getSpreadsheet();
    Object.keys(APP_CONFIG.sheets).forEach(function (sheetName) {
      const headers = APP_CONFIG.sheets[sheetName];
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }
      const hasHeaders = sheet.getLastRow() > 0;
      if (!hasHeaders) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      } else {
        const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
        const mismatch = headers.some(function (header, index) {
          return currentHeaders[index] !== header;
        });
        if (mismatch) {
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
      }
    });
  }

  function readAll(sheetName) {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) {
      return [];
    }
    const headers = APP_CONFIG.sheets[sheetName];
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
    return values.map(function (row) {
      const obj = {};
      headers.forEach(function (header, index) {
        obj[header] = row[index];
      });
      return obj;
    });
  }

  function append(sheetName, item) {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    const headers = APP_CONFIG.sheets[sheetName];
    const row = headers.map(function (header) {
      return item[header] !== undefined ? item[header] : '';
    });
    sheet.appendRow(row);
    return item;
  }

  function updateById(sheetName, id, patch) {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    const headers = APP_CONFIG.sheets[sheetName];
    const idCol = headers.indexOf('id') + 1;
    if (idCol <= 0 || sheet.getLastRow() < 2) {
      throw new Error('Лист не поддерживает обновление по id: ' + sheetName);
    }
    const ids = sheet.getRange(2, idCol, sheet.getLastRow() - 1, 1).getValues();
    const rowIndex = ids.findIndex(function (row) {
      return String(row[0]) === String(id);
    });
    if (rowIndex < 0) {
      throw new Error('Запись не найдена: ' + id);
    }
    const targetRow = rowIndex + 2;
    headers.forEach(function (header, index) {
      if (Object.prototype.hasOwnProperty.call(patch, header)) {
        sheet.getRange(targetRow, index + 1).setValue(patch[header]);
      }
    });
    return getById(sheetName, id);
  }

  function getById(sheetName, id) {
    const all = readAll(sheetName);
    return all.find(function (item) {
      return String(item.id) === String(id);
    }) || null;
  }

  function replaceSheetData(sheetName, rows) {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    const headers = APP_CONFIG.sheets[sheetName];
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (!rows || !rows.length) {
      return;
    }
    const values = rows.map(function (item) {
      return headers.map(function (header) {
        return item[header] !== undefined ? item[header] : '';
      });
    });
    sheet.getRange(2, 1, values.length, headers.length).setValues(values);
  }

  return {
    ensureSheets: ensureSheets,
    readAll: readAll,
    append: append,
    getById: getById,
    updateById: updateById,
    replaceSheetData: replaceSheetData
  };
})();

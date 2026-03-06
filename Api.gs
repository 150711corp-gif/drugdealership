/**
 * Входные точки Apps Script API.
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Помощник приёма лекарств')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function apiInit() {
  return withApiGuard(function () {
    return AppService.bootstrap();
  });
}

function apiSaveUser(payload) {
  return withApiGuard(function () {
    return AppService.saveUser(payload || {});
  });
}

function apiSavePrescription(payload) {
  return withApiGuard(function () {
    return AppService.savePrescription(payload || {});
  });
}

function apiQuickIntake(payload) {
  return withApiGuard(function () {
    return AppService.quickIntake(payload || {});
  });
}

function apiGetWeekSchedule(userId, weekStartIso) {
  return withApiGuard(function () {
    return AppService.getWeekSchedule(userId, weekStartIso);
  });
}

function setupProject() {
  SheetRepository.ensureSheets();
}

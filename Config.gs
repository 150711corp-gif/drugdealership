/**
 * Конфигурация приложения и описание структуры таблиц.
 */
const APP_CONFIG = {
  spreadsheetId: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '',
  sheets: {
    Users: ['id', 'name', 'color', 'active', 'note'],
    Drugs: ['id', 'name', 'form', 'note', 'active'],
    DrugDosages: ['id', 'drugId', 'dosage', 'unit', 'note', 'active'],
    Prescriptions: [
      'id',
      'userId',
      'drugId',
      'dosageId',
      'scheduleType',
      'scheduleConfigJson',
      'timeOfDay',
      'intakeFeature',
      'startDate',
      'endDate',
      'status',
      'companionRuleJson',
      'controlRuleJson',
      'note',
      'createdAt',
      'updatedAt'
    ],
    IntakeEvents: [
      'id',
      'date',
      'userId',
      'drugId',
      'dosage',
      'unit',
      'timeOfDay',
      'intakeFeature',
      'takenStatus',
      'source',
      'prescriptionId',
      'comment',
      'createdAt',
      'updatedAt'
    ],
    ControlPoints: ['id', 'userId', 'prescriptionId', 'controlDate', 'controlType', 'description', 'status', 'note'],
    ScheduleGenerated: [
      'id',
      'userId',
      'date',
      'timeOfDay',
      'drugId',
      'dosageText',
      'intakeFeature',
      'marker',
      'sourcePrescriptionId',
      'isCompanion',
      'note'
    ]
  },
  status: {
    active: 'active',
    paused: 'paused',
    completed: 'completed'
  }
};

function getSpreadsheet() {
  if (APP_CONFIG.spreadsheetId) {
    return SpreadsheetApp.openById(APP_CONFIG.spreadsheetId);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

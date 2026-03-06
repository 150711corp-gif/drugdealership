/**
 * Сервисный слой: сценарии приложения.
 */
const AppService = (function () {
  function bootstrap() {
    SheetRepository.ensureSheets();
    return {
      users: SheetRepository.readAll('Users').filter(function (u) { return normalizeBool(u.active); }),
      drugs: SheetRepository.readAll('Drugs').filter(function (d) { return normalizeBool(d.active); }),
      dosages: SheetRepository.readAll('DrugDosages').filter(function (d) { return normalizeBool(d.active); }),
      prescriptions: SheetRepository.readAll('Prescriptions'),
      intakeEvents: SheetRepository.readAll('IntakeEvents')
    };
  }

  function saveUser(payload) {
    assertRequired(payload, 'payload');
    assertRequired(payload.name, 'name');
    const user = {
      id: payload.id || generateId('usr'),
      name: payload.name,
      color: payload.color || '#1d4ed8',
      active: payload.active !== false,
      note: payload.note || ''
    };
    if (payload.id) {
      return SheetRepository.updateById('Users', payload.id, user);
    }
    return SheetRepository.append('Users', user);
  }

  function savePrescription(payload) {
    assertRequired(payload, 'payload');
    ['userId', 'drugId', 'dosageId', 'scheduleType', 'startDate'].forEach(function (field) {
      assertRequired(payload[field], field);
    });

    const stamp = nowIso();
    const item = {
      id: payload.id || generateId('prx'),
      userId: payload.userId,
      drugId: payload.drugId,
      dosageId: payload.dosageId,
      scheduleType: payload.scheduleType,
      scheduleConfigJson: JSON.stringify(payload.scheduleConfig || {}),
      timeOfDay: payload.timeOfDay || '08:00',
      intakeFeature: payload.intakeFeature || '',
      startDate: payload.startDate,
      endDate: payload.endDate || '',
      status: payload.status || APP_CONFIG.status.active,
      companionRuleJson: JSON.stringify(payload.companionRule || {}),
      controlRuleJson: JSON.stringify(payload.controlRule || {}),
      note: payload.note || '',
      createdAt: payload.createdAt || stamp,
      updatedAt: stamp
    };

    if (payload.id) {
      return SheetRepository.updateById('Prescriptions', payload.id, item);
    }
    return SheetRepository.append('Prescriptions', item);
  }

  function quickIntake(payload) {
    assertRequired(payload, 'payload');
    ['date', 'userId', 'drugId'].forEach(function (field) {
      assertRequired(payload[field], field);
    });

    const event = {
      id: generateId('int'),
      date: payload.date,
      userId: payload.userId,
      drugId: payload.drugId,
      dosage: payload.dosage || '',
      unit: payload.unit || '',
      timeOfDay: payload.timeOfDay || '08:00',
      intakeFeature: payload.intakeFeature || '',
      takenStatus: payload.takenStatus || 'taken',
      source: payload.source || 'quick-input',
      prescriptionId: payload.prescriptionId || '',
      comment: payload.comment || '',
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    return SheetRepository.append('IntakeEvents', event);
  }

  function getWeekSchedule(userId, weekStartIso) {
    const rows = SchedulerService.generateWeekForUser(userId, weekStartIso);
    const drugs = SheetRepository.readAll('Drugs');
    const drugMap = {};
    drugs.forEach(function (d) {
      drugMap[d.id] = d.name;
    });

    return rows.map(function (row) {
      return {
        date: row.date,
        timeOfDay: row.timeOfDay,
        drugName: drugMap[row.drugId] || row.drugId,
        dosageText: row.dosageText,
        intakeFeature: row.intakeFeature,
        marker: row.marker,
        isCompanion: normalizeBool(row.isCompanion)
      };
    });
  }

  return {
    bootstrap: bootstrap,
    saveUser: saveUser,
    savePrescription: savePrescription,
    quickIntake: quickIntake,
    getWeekSchedule: getWeekSchedule
  };
})();

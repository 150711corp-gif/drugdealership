/**
 * Движок генерации недельного расписания по назначениям.
 */
const SchedulerService = (function () {
  function generateWeekForUser(userId, weekStartIso) {
    assertRequired(userId, 'userId');
    assertRequired(weekStartIso, 'weekStartIso');

    const prescriptions = SheetRepository.readAll('Prescriptions').filter(function (p) {
      return String(p.userId) === String(userId) && p.status === APP_CONFIG.status.active;
    });

    const weekStart = new Date(weekStartIso + 'T00:00:00');
    const rows = [];

    for (let day = 0; day < 7; day += 1) {
      const dateObj = new Date(weekStart);
      dateObj.setDate(weekStart.getDate() + day);
      const isoDate = toIsoDate(dateObj);

      prescriptions.forEach(function (prescription) {
        if (isPrescriptionActiveOnDate(prescription, isoDate) && isDayIncluded(prescription, dateObj)) {
          const dosageText = buildDosageText(prescription.dosageId);
          rows.push({
            id: generateId('sch'),
            userId: prescription.userId,
            date: isoDate,
            timeOfDay: prescription.timeOfDay || '08:00',
            drugId: prescription.drugId,
            dosageText: dosageText,
            intakeFeature: prescription.intakeFeature || '',
            marker: buildMarker(prescription),
            sourcePrescriptionId: prescription.id,
            isCompanion: false,
            note: prescription.note || ''
          });

          const companion = parseJsonOrDefault(prescription.companionRuleJson, null);
          if (companion && companion.enabled) {
            rows.push(buildCompanionRow(prescription, companion, isoDate, dosageText));
          }
        }
      });
    }

    const otherRows = SheetRepository.readAll('ScheduleGenerated').filter(function (row) {
      return String(row.userId) !== String(userId) || row.date < weekStartIso || row.date > toIsoDate(addDays(weekStart, 6));
    });

    SheetRepository.replaceSheetData('ScheduleGenerated', otherRows.concat(rows));
    return rows;
  }

  function isPrescriptionActiveOnDate(prescription, isoDate) {
    if (!prescription.startDate) {
      return false;
    }
    const startOk = isoDate >= toIsoDate(prescription.startDate);
    const endOk = !prescription.endDate || isoDate <= toIsoDate(prescription.endDate);
    return startOk && endOk;
  }

  function isDayIncluded(prescription, dateObj) {
    const scheduleType = prescription.scheduleType || 'daily';
    const config = parseJsonOrDefault(prescription.scheduleConfigJson, {});
    if (scheduleType === 'daily') {
      return true;
    }
    if (scheduleType === 'interval') {
      const start = new Date(prescription.startDate + 'T00:00:00');
      const diffDays = Math.floor((stripTime(dateObj) - stripTime(start)) / (24 * 3600 * 1000));
      const everyDays = Number(config.everyDays || 1);
      return diffDays >= 0 && diffDays % everyDays === 0;
    }
    if (scheduleType === 'weekday') {
      const weekdays = Array.isArray(config.weekdays) ? config.weekdays : [];
      return weekdays.indexOf(dateObj.getDay()) >= 0;
    }
    return false;
  }

  function buildDosageText(dosageId) {
    const dosage = SheetRepository.getById('DrugDosages', dosageId);
    if (!dosage) {
      return 'дозировка не указана';
    }
    return String(dosage.dosage) + ' ' + String(dosage.unit || '').trim();
  }

  function buildMarker(prescription) {
    const control = parseJsonOrDefault(prescription.controlRuleJson, null);
    if (!control || !control.enabled) {
      return '';
    }
    return 'Контроль: ' + (control.type || 'общий');
  }

  function buildCompanionRow(prescription, companion, isoDate, dosageText) {
    return {
      id: generateId('sch'),
      userId: prescription.userId,
      date: isoDate,
      timeOfDay: companion.timeOfDay || prescription.timeOfDay || '12:00',
      drugId: prescription.drugId,
      dosageText: companion.text || dosageText,
      intakeFeature: 'Сопровождение: ' + (companion.mode || 'после еды'),
      marker: 'Сопутствующий приём',
      sourcePrescriptionId: prescription.id,
      isCompanion: true,
      note: companion.note || ''
    };
  }

  function stripTime(dateObj) {
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
  }

  function addDays(dateObj, days) {
    const cloned = new Date(dateObj);
    cloned.setDate(cloned.getDate() + days);
    return cloned;
  }

  return {
    generateWeekForUser: generateWeekForUser
  };
})();

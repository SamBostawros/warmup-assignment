const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // --- parse startTime ---
    let st = startTime.trim().toLowerCase();
    let stPeriod = st.slice(st.lastIndexOf(' ') + 1).trim();
    let stParts = st.slice(0, st.lastIndexOf(' ')).trim().split(':').map(Number);
    let stH = stParts[0], stM = stParts[1], stS = stParts[2];
    if (stPeriod === 'am') {
        if (stH === 12) stH = 0;
    }
    else {
        if (stH !== 12)
            stH += 12;
    }
    let startSec = stH * 3600 + stM * 60 + stS;

    // --- parse endTime ---
    let et = endTime.trim().toLowerCase();
    let etPeriod = et.slice(et.lastIndexOf(' ') + 1).trim();
    let etParts = et.slice(0, et.lastIndexOf(' ')).trim().split(':').map(Number);
    let etH = etParts[0], etM = etParts[1], etS = etParts[2];
    if (etPeriod === 'am') { if (etH === 12) etH = 0; }
    else { if (etH !== 12) etH += 12; }
    let endSec = etH * 3600 + etM * 60 + etS;

    // --- format result ---
    let total = endSec - startSec;
    if (total < 0) total = 0;
    let h = Math.floor(total / 3600);
    let m = Math.floor((total % 3600) / 60);
    let s = total % 60;
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    const DELIVERY_START = 8 * 3600; // 08:00:00
    const DELIVERY_END = 22 * 3600; // 22:00:00

    // --- parse startTime ---
    let st = startTime.trim().toLowerCase();
    let stPeriod = st.slice(st.lastIndexOf(' ') + 1).trim();
    let stParts = st.slice(0, st.lastIndexOf(' ')).trim().split(':').map(Number);
    let stH = stParts[0], stM = stParts[1], stS = stParts[2];
    if (stPeriod === 'am') {
        if (stH === 12)
            stH = 0;
    }
    else {
        if (stH !== 12)
            stH += 12;
    }
    let startSec = stH * 3600 + stM * 60 + stS;

    // --- parse endTime ---
    let et = endTime.trim().toLowerCase();
    let etPeriod = et.slice(et.lastIndexOf(' ') + 1).trim();
    let etParts = et.slice(0, et.lastIndexOf(' ')).trim().split(':').map(Number);
    let etH = etParts[0], etM = etParts[1], etS = etParts[2];
    if (etPeriod === 'am') {
        if (etH === 12)
            etH = 0;
    }
    else {
        if (etH !== 12)
            etH += 12;
    }
    let endSec = etH * 3600 + etM * 60 + etS;

    // --- calculate idle time ---
    let idleSec = 0;
    if (startSec < DELIVERY_START) {
        let cap = Math.min(endSec, DELIVERY_START);
        if (cap > startSec) idleSec += cap - startSec;
    }
    if (endSec > DELIVERY_END) {
        let base = Math.max(startSec, DELIVERY_END);
        if (endSec > base) idleSec += endSec - base;
    }

    // --- format result ---
    if (idleSec < 0) idleSec = 0;
    let h = Math.floor(idleSec / 3600);
    let m = Math.floor((idleSec % 3600) / 60);
    let s = idleSec % 60;
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // --- parse shiftDuration ---
    let sdParts = shiftDuration.trim().split(':').map(Number);
    let sdSec = sdParts[0] * 3600 + sdParts[1] * 60 + sdParts[2];

    // --- parse idleTime ---
    let itParts = idleTime.trim().split(':').map(Number);
    let itSec = itParts[0] * 3600 + itParts[1] * 60 + itParts[2];

    // --- format result ---
    let total = sdSec - itSec;
    if (total < 0)
        total = 0;
    let h = Math.floor(total / 3600);
    let m = Math.floor((total % 3600) / 60);
    let s = total % 60;

    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // --- parse activeTime ---
    let atParts = activeTime.trim().split(':').map(Number);
    let atSec = atParts[0] * 3600 + atParts[1] * 60 + atParts[2];

    // --- determine quota ---
    let year = Number(date.split('-')[0]);
    let month = Number(date.split('-')[1]);
    let day = Number(date.split('-')[2]);
    let isEid = (year === 2025 && month === 4 && day >= 10 && day <= 30);
    let quotaSec = isEid ? (6 * 3600) : (8 * 3600 + 24 * 60);

    return atSec >= quotaSec;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // --- read file ---
    let raw = fs.readFileSync(textFile, { encoding: 'utf8' });
    let lines = raw.split('\n').map(l => l.replace(/\r$/, ''));

    // --- duplicate check ---
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim())
            continue;
        let cols = lines[i].split(',');
        if (cols[0].trim() === shiftObj.driverID && cols[2].trim() === shiftObj.date) {
            return {};
        }
    }

    // ---- compute shiftDuration ----
    let st = shiftObj.startTime.trim().toLowerCase();
    let stPeriod = st.slice(st.lastIndexOf(' ') + 1).trim();
    let stParts = st.slice(0, st.lastIndexOf(' ')).trim().split(':').map(Number);
    let stH = stParts[0], stM = stParts[1], stS = stParts[2];
    if (stPeriod === 'am') {
        if (stH === 12) stH = 0;
    }
    else {
        if (stH !== 12) stH += 12;
    }
    let startSec = stH * 3600 + stM * 60 + stS;

    let et = shiftObj.endTime.trim().toLowerCase();
    let etPeriod = et.slice(et.lastIndexOf(' ') + 1).trim();
    let etParts = et.slice(0, et.lastIndexOf(' ')).trim().split(':').map(Number);
    let etH = etParts[0], etM = etParts[1], etS = etParts[2];
    if (etPeriod === 'am') {
        if (etH === 12) etH = 0;
    }
    else {
        if (etH !== 12) etH += 12;
    }
    let endSec = etH * 3600 + etM * 60 + etS;

    let sdTotal = endSec - startSec;
    if (sdTotal < 0)
        sdTotal = 0;
    let sdH = Math.floor(sdTotal / 3600);
    let sdM = Math.floor((sdTotal % 3600) / 60);
    let sdS = sdTotal % 60;
    let shiftDuration = sdH + ':' + String(sdM).padStart(2, '0') + ':' + String(sdS).padStart(2, '0');

    // ---- compute idleTime ----
    const DELIVERY_START = 8 * 3600;
    const DELIVERY_END = 22 * 3600;
    let idleSec = 0;
    if (startSec < DELIVERY_START) {
        let cap = Math.min(endSec, DELIVERY_START);
        if (cap > startSec)
            idleSec += cap - startSec;
    }
    if (endSec > DELIVERY_END) {
        let base = Math.max(startSec, DELIVERY_END);
        if (endSec > base)
            idleSec += endSec - base;
    }
    let itH = Math.floor(idleSec / 3600);
    let itM = Math.floor((idleSec % 3600) / 60);
    let itS = idleSec % 60;
    let idleTime = itH + ':' + String(itM).padStart(2, '0') + ':' + String(itS).padStart(2, '0');

    // ---- compute activeTime ----
    let atTotal = sdTotal - idleSec;
    if (atTotal < 0) atTotal = 0;
    let atH = Math.floor(atTotal / 3600);
    let atM = Math.floor((atTotal % 3600) / 60);
    let atS = atTotal % 60;
    let activeTime = atH + ':' + String(atM).padStart(2, '0') + ':' + String(atS).padStart(2, '0');

    // ---- compute metQuota ----
    let year = Number(shiftObj.date.split('-')[0]);
    let month = Number(shiftObj.date.split('-')[1]);
    let day = Number(shiftObj.date.split('-')[2]);
    let isEid = (year === 2025 && month === 4 && day >= 10 && day <= 30);
    let quotaSec = isEid ? (6 * 3600) : (8 * 3600 + 24 * 60);
    let quota = atTotal >= quotaSec;

    let hasBonus = false;

    // ---- build new record object ----
    let newRecord = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration,
        idleTime,
        activeTime,
        metQuota: quota,
        hasBonus
    };

    let newLine = [
        shiftObj.driverID,
        shiftObj.driverName,
        shiftObj.date,
        shiftObj.startTime,
        shiftObj.endTime,
        shiftDuration,
        idleTime,
        activeTime,
        quota,
        hasBonus
    ].join(',');

    // ---- find insertion point ----
    let lastDriverLineIdx = -1;
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim())
            continue;
        let cols = lines[i].split(',');
        if (cols[0].trim() === shiftObj.driverID)
            lastDriverLineIdx = i;
    }

    let lastNonEmpty = lines.length - 1;
    while (lastNonEmpty >= 0 && !lines[lastNonEmpty].trim())
        lastNonEmpty--;

    if (lastDriverLineIdx === -1) {
        let trimmed = lines.slice(0, lastNonEmpty + 1);
        trimmed.push(newLine);
        fs.writeFileSync(textFile, trimmed.join('\n'), { encoding: 'utf8' });
    } else {
        lines.splice(lastDriverLineIdx + 1, 0, newLine);
        let last = lines.length - 1;
        while (last >= 0 && !lines[last].trim())
            last--;
        fs.writeFileSync(textFile, lines.slice(0, last + 1).join('\n'), { encoding: 'utf8' });
    }

    return newRecord;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    let raw = fs.readFileSync(textFile, { encoding: 'utf8' });
    let lines = raw.split('\n').map(l => l.replace(/\r$/, ''));

    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].trim())
            continue;
        let cols = lines[i].split(',');
        if (cols[0].trim() === driverID && cols[2].trim() === date) {
            cols[cols.length - 1] = String(newValue);
            lines[i] = cols.join(',');
            break;
        }
    }

    let last = lines.length - 1;
    while (last >= 0 && !lines[last].trim())
        last--;
    fs.writeFileSync(textFile, lines.slice(0, last + 1).join('\n'), { encoding: 'utf8' });

}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    let raw = fs.readFileSync(textFile, { encoding: 'utf8' });
    let lines = raw.split('\n').map(l => l.replace(/\r$/, ''));

    let targetMonth = parseInt(month, 10);
    let driverFound = false;
    let bonusCount = 0;

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim())
            continue;
        let cols = lines[i].split(',');
        if (cols[0].trim() !== driverID)
            continue;

        driverFound = true;

        let recordMonth = parseInt(cols[2].trim().split('-')[1], 10);
        if (recordMonth === targetMonth) {
            if (cols[cols.length - 1].trim().toLowerCase() === 'true')
                bonusCount++;
        }
    }

    return driverFound ? bonusCount : -1;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    let raw = fs.readFileSync(textFile, { encoding: 'utf8' });
    let lines = raw.split('\n').map(l => l.replace(/\r$/, ''));

    let totalSec = 0;

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim())
            continue;
        let cols = lines[i].split(',');
        if (cols[0].trim() !== driverID)
            continue;

        let recordMonth = parseInt(cols[2].trim().split('-')[1], 10);
        if (recordMonth !== month)
            continue;

        // activeTime is column index 7
        let atParts = cols[7].trim().split(':').map(Number);
        totalSec += atParts[0] * 3600 + atParts[1] * 60 + atParts[2];
    }

    let h = Math.floor(totalSec / 3600);
    let m = Math.floor((totalSec % 3600) / 60);
    let s = totalSec % 60;
    
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // --- read driver's day off ---
    let rateRaw = fs.readFileSync(rateFile, { encoding: 'utf8' });
    let rateLines = rateRaw.split('\n').map(l => l.replace(/\r$/, ''));
    let dayOff = null;
    for (let i = 0; i < rateLines.length; i++) {
        if (!rateLines[i].trim()) 
            continue;
        let cols = rateLines[i].split(',');
        if (cols[0].trim() === driverID) {
            dayOff = cols[1].trim().toLowerCase();
            break;
        }
    }

    // --- sum required hours from shift records ---
    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let raw = fs.readFileSync(textFile, { encoding: 'utf8' });
    let lines = raw.split('\n').map(l => l.replace(/\r$/, ''));
    let totalSec = 0;

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) 
            continue;
        let cols = lines[i].split(',');
        if (cols[0].trim() !== driverID) 
            continue;

        let dateStr = cols[2].trim();
        let recordMonth = parseInt(dateStr.split('-')[1], 10);
        if (recordMonth !== month) 
            continue;

        // skip if day off
        let d = new Date(dateStr);
        let shiftDay = DAYS[d.getUTCDay()];
        if (dayOff && shiftDay === dayOff) 
            continue;

        // determine daily quota
        let year = Number(dateStr.split('-')[0]);
        let mo = Number(dateStr.split('-')[1]);
        let day = Number(dateStr.split('-')[2]);
        let isEid = (year === 2025 && mo === 4 && day >= 10 && day <= 30);
        totalSec += isEid ? (6 * 3600) : (8 * 3600 + 24 * 60);
    }

    // --- apply bonus deduction (2 hours each) ---
    totalSec -= bonusCount * 2 * 3600;
    if (totalSec < 0) 
        totalSec = 0;

    let h = Math.floor(totalSec / 3600);
    let m = Math.floor((totalSec % 3600) / 60);
    let s = totalSec % 60;
    
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
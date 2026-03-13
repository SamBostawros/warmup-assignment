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
    let stParts  = st.slice(0, st.lastIndexOf(' ')).trim().split(':').map(Number);
    let stH = stParts[0], stM = stParts[1], stS = stParts[2];
    if (stPeriod === 'am') { 
        if (stH === 12) stH = 0; 
    }
    else{ 
        if (stH !== 12) 
            stH += 12;
    }
    let startSec = stH * 3600 + stM * 60 + stS;

    // --- parse endTime ---
    let et = endTime.trim().toLowerCase();
    let etPeriod = et.slice(et.lastIndexOf(' ') + 1).trim();
    let etParts  = et.slice(0, et.lastIndexOf(' ')).trim().split(':').map(Number);
    let etH = etParts[0], etM = etParts[1], etS = etParts[2];
    if (etPeriod === 'am') { if (etH === 12) etH = 0; }
    else                   { if (etH !== 12) etH += 12; }
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
    const DELIVERY_START = 8  * 3600; // 08:00:00
    const DELIVERY_END   = 22 * 3600; // 22:00:00

    // --- parse startTime ---
    let st = startTime.trim().toLowerCase();
    let stPeriod = st.slice(st.lastIndexOf(' ') + 1).trim();
    let stParts  = st.slice(0, st.lastIndexOf(' ')).trim().split(':').map(Number);
    let stH = stParts[0], stM = stParts[1], stS = stParts[2];
    if (stPeriod === 'am') { 
        if (stH === 12) 
            stH = 0; 
    }
    else{ 
        if (stH !== 12) 
            stH += 12;
    }
    let startSec = stH * 3600 + stM * 60 + stS;

    // --- parse endTime ---
    let et = endTime.trim().toLowerCase();
    let etPeriod = et.slice(et.lastIndexOf(' ') + 1).trim();
    let etParts  = et.slice(0, et.lastIndexOf(' ')).trim().split(':').map(Number);
    let etH = etParts[0], etM = etParts[1], etS = etParts[2];
    if (etPeriod === 'am') { 
        if (etH === 12) 
            etH = 0; 
    }
    else{ 
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
    // TODO: Implement this function
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
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
    // TODO: Implement this function
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
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
    // TODO: Implement this function
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
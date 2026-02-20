export const safeInt = (val: any): number => {
    if (typeof val === 'number') return Math.floor(val);
    if (!val) return 0;
    const parsed = parseInt(val.toString().replace(/,/g, '')); // Handle commas
    return isNaN(parsed) ? 0 : parsed;
};

export const parseTime = (timeStr: string | number): number => {
    if (typeof timeStr === 'number') return Math.round(timeStr * 24 * 3600);
    if (!timeStr) return 0;

    // Check if it's already a number in string form
    if (!isNaN(Number(timeStr))) return Math.round(Number(timeStr));

    const str = timeStr.toString();
    let seconds = 0;

    const hours = str.match(/(\d+)h/);
    const minutes = str.match(/(\d+)m/);
    const secs = str.match(/(\d+)s/);

    if (hours) seconds += parseInt(hours[1]) * 3600;
    if (minutes) seconds += parseInt(minutes[1]) * 60;
    if (secs) seconds += parseInt(secs[1]);

    return seconds;
};

export const parsePercentage = (str: string | number): number => {
    if (typeof str === 'number') return str * 100;
    if (!str) return 0;
    const clean = str.toString().replace('%', '').trim();
    if (clean === '-' || clean === '') return 0;
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
};

export const parseExcelDate = (dateVal: string | number): Date => {
    try {
        if (typeof dateVal === 'number') {
            const str = dateVal.toString();
            if (str.length === 8) {
                // YYYYMMDD
                const year = parseInt(str.substring(0, 4));
                const month = parseInt(str.substring(4, 6)) - 1;
                const day = parseInt(str.substring(6, 8));
                return new Date(year, month, day);
            }
        }
        if (typeof dateVal === 'string') {
            // Check for YYYY-MM-DD format commonly returned by some parsers
            if (dateVal.includes('-')) {
                return new Date(dateVal);
            }
            // YYYYMMDD
            if (dateVal.length === 8 && !isNaN(Number(dateVal))) {
                const year = parseInt(dateVal.substring(0, 4));
                const month = parseInt(dateVal.substring(4, 6)) - 1;
                const day = parseInt(dateVal.substring(6, 8));
                return new Date(year, month, day);
            }
        }
    } catch (e) {
        console.error("Date parsing error", dateVal);
    }
    // Fallback to today (or maybe invalid date?)
    // Creating a date for 'today' might mask errors, but better than crashing?
    // Let's return new Date() as fallback but log valid one.
    return new Date();
};

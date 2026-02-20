
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { getCurrentUser } from '@/lib/session';
import * as XLSX from 'xlsx';
import { parseTime, parsePercentage, parseExcelDate, safeInt } from '@/lib/kpi-parser';


import { checkKpiLock, logKpiAction } from '@/lib/kpi-audit-utils';

export const POST = apiHandler(async (request: Request) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        throw new Error('No file uploaded');
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Aggregate data from ALL sheets
    let allRows: any[] = [];

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet);
        // Tag each row with its sheet name for fallback
        const labeledRows = sheetData.map((row: any) => ({ ...row, _sheetName: sheetName }));
        allRows = allRows.concat(labeledRows);
    });

    if (allRows.length === 0) {
        throw new Error('Excel file is empty or invalid');
    }

    // 1. Check Lock
    // Check first valid date found in the aggregate data
    const sampleRow = allRows.find((r: any) => r['Date']);
    if (sampleRow) {
        const batchDate = parseExcelDate(sampleRow['Date']);
        await checkKpiLock(batchDate);
    }

    const users = await prisma.user.findMany({ select: { id: true, firstName: true, lastName: true } });

    // Create a normalized map of names to user IDs for matching
    const userMap = new Map<string, string>();
    users.forEach(u => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase().trim();
        userMap.set(fullName, u.id);
        userMap.set(u.firstName.toLowerCase().trim(), u.id);
        // Add more fuzzy keys if needed
    });

    // Deduplication Map: Key = "userId_timestamp"
    const uniqueRecords = new Map<string, any>();
    const unmatchedRecords = [];

    for (const row of allRows) {
        // Validation: Date is mandatory
        if (!row['Date']) continue;

        // Use 'Agent' column if present, otherwise use Sheet Name
        let rawName = row['Agent'];
        if (!rawName && row['_sheetName']) {
            rawName = row['_sheetName'];
        }

        // If still no name (e.g. empty row in random sheet), skip
        if (!rawName) continue;

        const normalizedName = rawName.toString().toLowerCase().trim().replace(/\s+/g, ' ');
        // Special cleanup for common Excel artifacts like "Total" rows if they exist, but maybe safe to ignore if no match

        const matchedUserId = userMap.get(normalizedName);

        const dateVal = parseExcelDate(row['Date']);

        const record = {
            rawName, // Keep original for resolution
            date: dateVal,
            conversations: safeInt(row['Conversation(Total)']),
            outboundMessages: safeInt(row['Outbound messages(Total)']),
            onlineTimeSeconds: parseTime(row['Online time (Total)']),
            availableTimeSeconds: parseTime(row['Available time (Total)']),
            firstResponseTimeSeconds: parseTime(row['First Response Time(Avg)']),
            resolutionTimeSeconds: parseTime(row['Resolution Time (Avg)']),
            csat: parsePercentage(row['CSAT (4 to 5 ⭐)']),
        };

        if (matchedUserId) {
            // Use compound key to deduplicate. Last record wins (overwrite).
            const key = `${matchedUserId}_${dateVal.getTime()}`;
            uniqueRecords.set(key, { ...record, userId: matchedUserId });
        } else {
            // For unmatched, we can't easily dedup by ID, but we could by name+date if we wanted. 
            // But unmatched go to resolution UI, duplicates there are fine/expected.
            unmatchedRecords.push(record);
        }
    }

    // Process matched records
    const finalRecords = Array.from(uniqueRecords.values());
    let insertedCount = 0;

    if (finalRecords.length > 0) {
        // Upsert operations
        await prisma.$transaction(
            finalRecords.map(rec =>
                prisma.dailyKPI.upsert({
                    where: {
                        userId_date: {
                            userId: rec.userId,
                            date: rec.date
                        }
                    },
                    update: {
                        conversations: rec.conversations,
                        outboundMessages: rec.outboundMessages,
                        onlineTimeSeconds: rec.onlineTimeSeconds,
                        availableTimeSeconds: rec.availableTimeSeconds,
                        firstResponseTimeSeconds: rec.firstResponseTimeSeconds,
                        resolutionTimeSeconds: rec.resolutionTimeSeconds,
                        csat: rec.csat
                    },
                    create: {
                        userId: rec.userId,
                        date: rec.date,
                        conversations: rec.conversations,
                        outboundMessages: rec.outboundMessages,
                        onlineTimeSeconds: rec.onlineTimeSeconds,
                        availableTimeSeconds: rec.availableTimeSeconds,
                        firstResponseTimeSeconds: rec.firstResponseTimeSeconds,
                        resolutionTimeSeconds: rec.resolutionTimeSeconds,
                        csat: rec.csat
                    }
                })
            )
        );
        insertedCount = finalRecords.length;
    }

    // 2. Store Evidence
    // Remove old evidence for this date if exists? Or keep history?
    // Requirement says "Evidence for this data".

    if (sampleRow) {
        const batchDate = parseExcelDate(sampleRow['Date']);

        // Convert ArrayBuffer to Buffer for Prisma/DB
        const fileBuffer = Buffer.from(buffer);

        // We create a new source file entry.
        await prisma.kpiSourceFile.create({
            data: {
                adminId: user.id,
                filename: file.name,
                targetDate: batchDate,
                fileData: fileBuffer
            }
        });

        // 3. Log Action
        await logKpiAction(
            user.id,
            'UPLOAD',
            `Uploaded ${file.name} with ${insertedCount} records.`,
            batchDate
        );
    }

    return NextResponse.json({
        success: true,
        inserted: insertedCount,
        unmatched: unmatchedRecords
    });
});

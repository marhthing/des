import { NextRequest } from 'next/server';
import { parseMatricNumber } from '../../../lib/parsing';
import prisma from '../../../lib/db';
import { uploadPDF } from '../../../lib/storage';
import { logEvent, logError } from '../../../lib/logging';

// API route: POST /api/upload-pdfs
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
      return Response.json({ error: 'No files uploaded' }, { status: 400 });
    }
    const results = [];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      const originalFileName = file.name;
      const matricNumberParsed = parseMatricNumber(originalFileName);
      const student = await prisma.student.findUnique({ where: { matric_number: matricNumberParsed } });
      let status = 'unmatched';
      let studentId = null;
      if (student) {
        status = 'matched';
        studentId = student.id;
      }
      const storagePath = `${matricNumberParsed}/${originalFileName}`;
      await uploadPDF(file, storagePath);
      await prisma.uploadedFile.create({
        data: {
          original_file_name: originalFileName,
          matric_number_raw: originalFileName.replace(/\.pdf$/i, ''),
          matric_number_parsed: matricNumberParsed,
          student_id: studentId,
          status,
          storage_path: storagePath,
        },
      });
      // Queue email if matched
      if (student && (student.parent_email_1 || student.parent_email_2)) {
        const emails = [student.parent_email_1, student.parent_email_2].filter(Boolean);
        for (const email of emails) {
          await prisma.emailQueue.create({
            data: {
              student_id: student.id,
              matric_number: student.matric_number,
              recipient_email: email!,
              email_type: 'pdf',
              status: 'pending',
            },
          });
        }
      }
      results.push({ file: originalFileName, status, matched: !!student });
    }
    await logEvent('upload', `Uploaded ${results.length} PDF(s)`);
    return Response.json({ results });
  } catch (error: any) {
    await logError('upload', error.message || 'Unknown error');
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { parseMatricNumber } from '../../../lib/parsing';
import { logEvent, logError } from '../../../lib/logging';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// API route: POST /api/upload-pdfs
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // Accept both 'file' (single) and 'files' (multiple)
    const filesFromForm = formData.getAll('files');
    let files: File[] = [];
    if (filesFromForm && filesFromForm.length > 0 && filesFromForm[0] instanceof File) {
      files = filesFromForm as File[];
    } else {
      const singleFile = formData.get('file');
      if (singleFile instanceof File) {
        files = [singleFile];
      }
    }
    if (!files || files.length === 0) {
      return Response.json({ error: 'No files uploaded' }, { status: 400 });
    }
    const results = [];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      const originalFileName = file.name;
      // Use matric_number from formData if present, else parse from filename
      const matricNumberFromForm = formData.get('matric_number');
      let matricNumberParsed = '';
      if (typeof matricNumberFromForm === 'string' && matricNumberFromForm.trim()) {
        matricNumberParsed = matricNumberFromForm.trim();
      } else {
        matricNumberParsed = parseMatricNumber(originalFileName);
      }
      // Find student by matric number
      const { data: student, error: studentError } = await supabase
        .from('Student')
        .select('*')
        .eq('matric_number', matricNumberParsed)
        .single();
      let status = 'unmatched';
      let studentId = null;
      if (student) {
        status = 'matched';
        studentId = student.id;
      }
      const storagePath = `${matricNumberParsed}/${originalFileName}`;
      // Upload PDF to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('SFGS') // changed from 'pdfs' to 'SFGS'
        .upload(storagePath, file, { upsert: true });
      if (uploadError) {
        await logError('upload', `Upload failed for ${originalFileName}: ${uploadError.message}`);
        results.push({ file: originalFileName, status: 'upload_failed', matched: !!student, error: uploadError.message });
        continue;
      }
      // Insert uploaded file record
      await supabase.from('UploadedFile').insert({
        original_file_name: originalFileName,
        matric_number_raw: originalFileName.replace(/\.pdf$/i, ''),
        matric_number_parsed: matricNumberParsed,
        student_id: studentId,
        status,
        storage_path: storagePath,
      });
      // Queue email if matched
      if (student && (student.parent_email_1 || student.parent_email_2)) {
        const emails = [student.parent_email_1, student.parent_email_2].filter(Boolean);
        for (const email of emails) {
          await supabase.from('EmailQueue').insert({
            student_id: student.id,
            matric_number: student.matric_number,
            recipient_email: email,
            email_type: 'pdf',
            status: 'pending',
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

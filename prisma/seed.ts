import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo students
  await prisma.student.createMany({
    data: [
      {
        id: 'student-1',
        matric_number: 'SFGS001',
        student_name: 'John Doe',
        date_of_birth: new Date('2010-01-01'),
        parent_email_1: 'parent1@example.com',
        parent_email_2: 'parent2@example.com',
      },
      {
        id: 'student-2',
        matric_number: 'SFGS002',
        student_name: 'Jane Smith',
        date_of_birth: new Date('2011-02-02'),
        parent_email_1: 'parent3@example.com',
        parent_email_2: null,
      },
    ],
  });

  // Create demo uploaded files
  await prisma.uploadedFile.createMany({
    data: [
      {
        id: 'file-1',
        original_file_name: 'result1.pdf',
        matric_number_raw: 'SFGS001',
        matric_number_parsed: 'SFGS001',
        student_id: 'student-1',
        status: 'matched',
        storage_path: 'uploads/result1.pdf',
      },
      {
        id: 'file-2',
        original_file_name: 'result2.pdf',
        matric_number_raw: 'SFGS002',
        matric_number_parsed: 'SFGS002',
        student_id: 'student-2',
        status: 'matched',
        storage_path: 'uploads/result2.pdf',
      },
    ],
  });

  // Create demo email queue
  await prisma.emailQueue.createMany({
    data: [
      {
        id: 'email-1',
        student_id: 'student-1',
        matric_number: 'SFGS001',
        recipient_email: 'parent1@example.com',
        email_type: 'result',
        status: 'sent',
        created_at: new Date(),
        sent_at: new Date(),
      },
      {
        id: 'email-2',
        student_id: 'student-2',
        matric_number: 'SFGS002',
        recipient_email: 'parent3@example.com',
        email_type: 'result',
        status: 'pending',
        created_at: new Date(),
      },
    ],
  });

  // Create demo system log
  await prisma.systemLog.create({
    data: {
      type: 'cron',
      message: 'Demo cron run',
      created_at: new Date(),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

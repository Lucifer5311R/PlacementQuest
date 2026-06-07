import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const csvFilePath = path.join(process.cwd(), 'Student Placement Profile Form   (Responses) - Form Responses 1.csv');
  const content = fs.readFileSync(csvFilePath, 'utf8');

  // A simple but robust CSV parser to handle multi-line quoted cells
  const rows = [];
  let currentField = '';
  let inQuotes = false;
  let currentRow = [];

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"' && content[i+1] === '"') {
      currentField += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\r' && !inQuotes) {
      // Ignore carriage returns; line feeds close rows.
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  // Push last row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  // Skip header (first row) and any empty rows
  const dataRows = rows.slice(1).filter(row => row.length >= 12);

  console.log(`Parsing ${dataRows.length} students...`);

  for (const row of dataRows) {
    await prisma.student.upsert({
      where: { regNumber: row[2] },
      update: {
        fullName: row[1],
        email: row[3],
        phone: row[4],
        linkedinUrl: row[5],
        githubUrl: row[6],
        description: row[7],
        internships: row[8],
        projects: row[9],
        skills: row[10],
        resumeUrl: row[11],
      },
      create: {
        fullName: row[1],
        regNumber: row[2],
        email: row[3],
        phone: row[4],
        linkedinUrl: row[5],
        githubUrl: row[6],
        description: row[7],
        internships: row[8],
        projects: row[9],
        skills: row[10],
        resumeUrl: row[11],
      },
    });
  }

  // Seed some sample questions
  const questions = [
    {
      category: 'Aptitude',
      subCategory: 'Quantitative',
      content: 'A train 150m long passes a pole in 15 seconds. What is the speed of the train?',
      options: JSON.stringify(['36 km/hr', '40 km/hr', '54 km/hr', '60 km/hr']),
      correctAnswer: '36 km/hr',
    },
    {
      category: 'Aptitude',
      subCategory: 'Quantitative',
      content: 'Find the average of first 40 natural numbers.',
      options: JSON.stringify(['20.5', '21', '21.5', '22']),
      correctAnswer: '20.5',
    },
    {
      category: 'Aptitude',
      subCategory: 'Simple Interest',
      content: 'A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. What is the sum?',
      options: JSON.stringify(['Rs. 650', 'Rs. 698', 'Rs. 700', 'Rs. 720']),
      correctAnswer: 'Rs. 698',
    },
    {
      category: 'Aptitude',
      subCategory: 'Logarithms',
      content: 'If log 27 = 1.431, then the value of log 9 is:',
      options: JSON.stringify(['0.934', '0.945', '0.954', '0.958']),
      correctAnswer: '0.954',
    },
    {
      category: 'Domain',
      subCategory: 'OS',
      content: 'What is Thrashing in Operating Systems?',
      options: JSON.stringify(['Excessive paging', 'CPU overheating', 'Disk failure', 'Network lag']),
      correctAnswer: 'Excessive paging',
    },
    {
      category: 'Domain',
      subCategory: 'Java',
      content: 'Which of these is not a feature of Java?',
      options: JSON.stringify(['Platform Independence', 'Pointers', 'Multithreading', 'Automatic Garbage Collection']),
      correctAnswer: 'Pointers',
    },
    {
      category: 'Domain',
      subCategory: 'Security',
      content: 'Which of the following is primarily used to prevent SQL Injection?',
      options: JSON.stringify(['Prepared Statements (Parameterized Queries)', 'Using GET instead of POST', 'Regular Expression validation', 'Disabling JavaScript']),
      correctAnswer: 'Prepared Statements (Parameterized Queries)',
    },
    {
      category: 'Domain',
      subCategory: 'Data Structures',
      content: 'What is the worst-case time complexity of searching in a Balanced Binary Search Tree (e.g., AVL tree)?',
      options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n log n)']),
      correctAnswer: 'O(log n)',
    },
    {
      category: 'Domain',
      subCategory: 'CSS',
      content: "In CSS Flexbox, what does the 'flex-grow' property specify?",
      options: JSON.stringify([
        'How much a flex item will grow relative to the rest',
        'The absolute width of the flex container',
        'How much the font-size will increase dynamically',
        'The padding growth speed during load'
      ]),
      correctAnswer: 'How much a flex item will grow relative to the rest',
    }
  ];

  for (const q of questions) {
    const existing = await prisma.question.findFirst({
      where: {
        category: q.category,
        subCategory: q.subCategory,
        content: q.content,
      },
    });

    if (!existing) {
      await prisma.question.create({ data: q });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

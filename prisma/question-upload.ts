const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed questions...');
  
  // Read questions from the JSON file
  const questionsFilePath = path.join(process.cwd(), 'src/app/(main)/preference/questions.json');
  const questionsData = JSON.parse(fs.readFileSync(questionsFilePath, 'utf8'));
  
  // Clear existing questions if needed
  await prisma.question.deleteMany({});
  console.log('Cleared existing questions');
  
  // Insert all questions
  for (const questionData of questionsData) {
    // Handle the case where options might not exist
    const options = questionData.options || [];
    
    try {
      await prisma.question.create({
        data: {
          text: questionData.question,
          type: questionData.type,
          options: options,
        },
      });
      console.log(`Created question: "${questionData.question}"`);
    } catch (error:any) {
      console.error(`Error creating question "${questionData.question}": ${error.message}`);
    }
  }
  
  const questionCount = await prisma.question.count();
  console.log(`Seeded ${questionCount} questions successfully`);
}

main()
  .catch((e) => {
    console.error('Error seeding questions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
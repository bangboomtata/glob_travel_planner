import { PrismaClient } from '@prisma/client'
import PreferenceForm from './PreferenceForm'

const prisma = new PrismaClient()


export default async function PreferencePage() {
   // Fetch questions from the database
   const questions = await prisma.question.findMany({
      select: {
         id: true,
         text: true,
         type: true,
         options: true
      },
      orderBy: {
         id: 'asc', // Replace 'id' with the field you want to sort by
      },
   })

   return (
      
      <main className="container mx-auto min-h-full max-w-2xl flex-col">
         {/* <pre className="text-white">{JSON.stringify(questions)}</pre> */}
         <PreferenceForm questions={questions} />
      </main>
   )
}


// Questions array with different question types
// const preference = [
   
//    { question: 'Doing outdoor activities', type: 'Travel_Taste' },
//    { question: 'Being in nature', type: 'Travel_Taste' },
//    { question: 'Wandering around charming villages', type: 'Travel_Taste' },
//    { question: 'Visiting popular sites and landmarks', type: 'Travel_Taste' },
//    { question: 'Going to places of historical significance', type: 'Travel_Taste' },
//    { question: 'Visiting museums and art galleries', type: 'Travel_Taste' },
//    {
//       question:
//          'Do you have any dietary restrictions we should know about for foodie experiences?',
//       type: 'Dietary_Restrictions',
//       options: ['None', 'Vegan', 'Vegetarian', 'No Alcohol'],
//    },
//    {
//       question: 'How long would like to be away for?',
//       type: 'Trip_Duration',
//       options: ['4 days, 3 nights', '5 days, 4 nights', '6 days, 5 nights'],
//    },
//    {
//       question: 'Which of the following UK airports are you able to fly from?',
//       type: 'Airport',
//       options: [
//          'London (All)',
//          'London Gatwick',
//          'London Stansted',
//          'London Heathrow',
//          'Manchester',
//          'Birmingham',
//       ],
//    },
//    {
//       question: 'Whats your preferred start date?',
//       type: 'Start_Date',
//    },
//    {
//       question: 'Do you have any flexibility with your travel dates?',
//       type: 'Start_Date_Flexibility',
//       options: [
//          'Flexible by +/- 1 day',
//          'Flexible by +/- 3 days',
//          'Not flexible',
//       ],
//    },
//    {
//       question: 'What’s your total budget (in £) for your 4-day trip?',
//       type: 'Budget',
//    },
// ]
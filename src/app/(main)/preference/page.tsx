import PreferenceForm from './PreferenceForm'
import { getPreferenceQuestions } from './action'

// Mock currentUser object for demonstration purposes
const currentUser = { id: 1 }

export default async function PreferencePage() {
   // Fetch questions from the database
   const questions = await getPreferenceQuestions()

   return (
      <main className="container mx-auto min-h-full max-w-2xl flex-col">
         {/* <pre className="text-white">{JSON.stringify(questions)}</pre> */}
         <PreferenceForm questions={questions} userId={currentUser.id} />
      </main>
   )
}

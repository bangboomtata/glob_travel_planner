import PreferenceForm from './PreferenceForm'
import { loadAndSaveQuestions, getPreferenceQuestions } from './action'

export const maxDuration = 60;

// Mock currentUser
const currentUser = { id: 1 }

export default async function PreferencePage() {
   await loadAndSaveQuestions()
   const questions = await getPreferenceQuestions()

   return (
      <main className="container mx-auto min-h-full max-w-2xl flex-col">
         {/* <pre className="text-white">{JSON.stringify(questions)}</pre> */}
         <PreferenceForm questions={questions} userId={currentUser.id} />
      </main>
   )
}

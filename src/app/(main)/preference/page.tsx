'use client'

import PreferenceForm from './PreferenceForm'
import { getPreferenceQuestions } from './action'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { QuestionType } from '@prisma/client'

export const maxDuration = 60;

type Question = {
  id: number;
  text: string;
  type: QuestionType;
  options: string[];
  createdAt: Date;
};

export default function PreferencePage() {
   const { data: session } = useSession();
   const [questions, setQuestions] = useState<Question[]>([])

   useEffect(() => {
      getPreferenceQuestions().then(setQuestions)
   }, [])

   if (!session?.user?.id) {
      return <div className="text-center text-white">Please log in.</div>
   }

   return (
      <main className="container mx-auto min-h-full max-w-2xl flex-col">
         {/* <pre className="text-white">{JSON.stringify(questions)}</pre> */}
         <PreferenceForm questions={questions} userId={session.user.id} />
      </main>
   )
}

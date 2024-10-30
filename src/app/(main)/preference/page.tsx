'use client'

import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

// Questions array with different question types
const preference = [
   {
      question:
         'Do you have any dietary restrictions we should know about for foodie experiences?',
      type: 'dietary_restrictions',
      options: ['None', 'Vegan', 'Vegetarian', 'No Alcohol'],
   },
   { question: 'Doing outdoor activities', type: 'slider' },
   { question: 'Being in nature', type: 'slider' },
   { question: 'Wandering around charming villages', type: 'slider' },
   { question: 'Visiting popular sites and landmarks', type: 'slider' },
   { question: 'Going to places of historical significance', type: 'slider' },
   { question: 'Visiting museums and art galleries', type: 'slider' },
   {
      question: 'How long would like to be away for?',
      type: 'trip_duration',
      options: ['4 days, 3 nights', '5 days, 4 nights', '6 days, 5 nights'],
   },
   {
      question: 'Which of the following UK airports are you able to fly from?',
      type: 'airport',
      options: [
         'London (All)',
         'London Gatwick',
         'London Stansted',
         'London Heathrow',
         'Manchester',
         'Birmingham',
      ],
   },
   {
      question: 'What’s your preferred start date? This question is required.',
      type: 'start_date',
      options: ['Flexible by +/- 1 day', 'Flexible by +/- 3 days', 'Not flexible'],
   },
   { question: 'What’s your total budget (in £) for your 4-day trip?', type: 'budget' },
]

export default function Preference() {
   const [step, setStep] = useState(1)
   const [preferences, setPreferences] = useState<{ [key: string]: any }>({})

   // Total steps based on unique question types
   const totalSteps = new Set(preference.map((q) => q.type)).size

   const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps))
   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

   // Render a question based on its type
   const renderQuestion = (question: { question: string; type: string; options?: string[] }) => {
      switch (question.type) {
         case 'slider':
            return (
               <div>
                  <Label className="text-lg leading-tight">{question.question}</Label>
                  <div className="flex items-center space-x-4">
                     <Slider
                        value={[preferences[question.question] || 3]}
                        onValueChange={([value]) =>
                           setPreferences((prev) => ({
                              ...prev,
                              [question.question]: value,
                           }))
                        }
                        max={5}
                        min={1}
                        step={1}
                        className="flex-grow"
                     />
                     <span className="w-8 text-center text-xl font-medium">
                        {preferences[question.question] || 3}
                     </span>
                  </div>
               </div>
            )
         case 'dietary_restrictions':
         case 'trip_duration':
         case 'airport':
         case 'start_date':
            return (
               <div>
                  <Label className="text-lg leading-tight">{question.question}</Label>
                  <div className="grid grid-cols-2 gap-y-4">
                     {question.options.map((option, index) => (
                        <label key={index} className="flex items-center space-x-2">
                           <Switch />
                           <span>{option}</span>
                        </label>
                     ))}
                  </div>
               </div>
            )
         case 'budget':
            return (
               <div>
                  <Label className="text-lg leading-tight">{question.question}</Label>
                  <input
                     type="number"
                     placeholder="Enter your budget"
                     className="mt-2 w-full rounded-md border p-2"
                     onChange={(e) =>
                        setPreferences((prev) => ({
                           ...prev,
                           [question.question]: e.target.value,
                        }))
                     }
                     value={preferences[question.question] || ''}
                  />
               </div>
            )
         default:
            return null
      }
   }

   const renderStep = () => {
      // Get the current question type for the step
      const questionType = Array.from(new Set(preference.map((q) => q.type)))[step - 1]
      const questions = preference.filter((q) => q.type === questionType)

      return (
         <>
            <CardHeader>
               <CardTitle className="text-2xl">{questionType.replace('_', ' ')}</CardTitle>
               <CardDescription>{questions[0]?.question}</CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-[180px] flex-col justify-center">
               <div className="space-y-6">
                  {questions.map((question, i) => (
                     <div key={i}>{renderQuestion(question)}</div>
                  ))}
               </div>
            </CardContent>
         </>
      )
   }

   return (
      <main className="container mx-auto min-h-full max-w-3xl flex-col">
         <BackgroundGradient className="p-2">
            <Card className="rounded-[23px] px-4 py-4">
               {renderStep()}
               <CardFooter className="flex justify-center gap-x-6 pt-4">
                  <Button onClick={prevStep} disabled={step === 1} variant="ghost" size="lg">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>

                  <div className="text-md font-normal">Step {step} of {totalSteps}</div>

                  {step === totalSteps ? (
                     <Button variant="ghost" onClick={() => console.log(preferences)} size="lg">
                        Finish
                     </Button>
                  ) : (
                     <Button variant="ghost" onClick={nextStep} size="lg">
                        <ArrowRight className="mr-2 h-4 w-4" />
                     </Button>
                  )}
               </CardFooter>
            </Card>
         </BackgroundGradient>
      </main>
   )
}

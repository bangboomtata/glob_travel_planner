'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { QuestionType } from '@prisma/client'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { handleGenerateItinerary } from './action'

interface PreferenceFormProps {
   questions: {
      id: number
      text: string
      type: QuestionType
      options: string[]
   }[]
   userId: number // Add userId prop
}

export default function PreferenceForm({
   questions,
   userId,
}: PreferenceFormProps) {
   const [step, setStep] = useState(1)
   const [preferences, setPreferences] = useState<{ [key: string]: any }>({})
   const [loading, setLoading] = useState(false)
   const [itinerary, setItinerary] = useState<string | null>(null)

   // Add debugging useEffect
   useEffect(() => {
      console.log('Questions prop:', questions)
   }, [questions])

   // Early return if no questions
   if (!questions || questions.length === 0) {
      return <div>Loading questions...</div>
   }

   const questionTypes = Array.from(new Set(questions.map((q) => q.type)))
   const totalSteps = questionTypes.length

   // Add debugging log
   console.log('Question types:', questionTypes)
   // console.log('Total steps:', totalSteps)

   const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps))
   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

   const handleFinish = async () => {
      setLoading(true)
      try {
         const response = await handleGenerateItinerary({
            userId,
            answers: preferences,
         })
         setItinerary(response)
      } catch (error) {
         console.error('Error generating itinerary:', error)
      } finally {
         setLoading(false)
      }
   }

   const renderQuestion = (question: {
      id: number
      text: string
      type: QuestionType
      options: string[]
   }) => {
      console.log('Rendering question:', question)

      switch (question.type) {
         case 'TRAVEL_TASTE':
            return (
               <div>
                  <Label className="text-base font-medium leading-tight">
                     {question.text}
                  </Label>
                  <div className="flex items-center space-x-4">
                     <Slider
                        value={[preferences[question.id]?.value || 3]}
                        onValueChange={([value]) =>
                           setPreferences((prev) => ({
                              ...prev,
                              [question.id]: {
                                 question: question.text,
                                 value,
                              },
                           }))
                        }
                        max={5}
                        min={1}
                        step={1}
                        className="flex-grow"
                     />
                     <span className="w-8 text-center text-xl font-medium">
                        {preferences[question.id]?.value || 3}
                     </span>
                  </div>
               </div>
            )
         case 'DIETARY_RESTRICTIONS':
         case 'TRIP_DURATION':
         case 'AIRPORT':
         case 'START_DATE_FLEXIBILITY':
         case 'DISLIKE_ACTIVITIES':
         case 'TRAVEL_TASTE_2':
         case 'WEATHER':
            return (
               <div className="space-y-4">
                  <Label className="text-base font-medium leading-tight">
                     {question.text}
                  </Label>
                  <div className="grid grid-cols-2 gap-y-4">
                     {question.options.map((option, idx) => (
                        <label
                           key={idx}
                           className="flex items-center space-x-2"
                        >
                           <Switch
                              checked={
                                 preferences[question.id]?.options?.includes(
                                    option
                                 ) || false
                              }
                              onCheckedChange={(checked) =>
                                 setPreferences((prev) => {
                                    const currentOptions =
                                       prev[question.id]?.options || []
                                    const updatedOptions: string[] = checked
                                       ? [...currentOptions, option] // Add option
                                       : currentOptions.filter(
                                            (opt: string) => opt !== option
                                         ) // Remove option

                                    return {
                                       ...prev,
                                       [question.id]: {
                                          question: question.text,
                                          options: updatedOptions,
                                       },
                                    }
                                 })
                              }
                           />
                           <span>{option}</span>
                        </label>
                     ))}
                  </div>
               </div>
            )
         case 'BUDGET':
            return (
               <div className="flex flex-col space-y-4">
                  <Label className="text-base font-medium leading-tight">
                     {question.text}
                  </Label>
                  <div className="flex flex-row space-x-4">
                     <Slider
                        value={[preferences[question.id]?.value ?? 750]} // Use nullish coalescing to handle 0
                        onValueChange={([value]) =>
                           setPreferences((prev) => ({
                              ...prev,
                              [question.id]: {
                                 question: question.text,
                                 value,
                              },
                           }))
                        }
                        max={1000}
                        min={500}
                        step={50}
                        className="flex-grow"
                     />
                     <span className="w-8 text-center text-xl font-medium">
                        {preferences[question.id]?.value ?? 750}{' '}
                        {/* Display the slider value correctly */}
                     </span>
                  </div>
               </div>
            )
            case 'START_DATE':
               return (
                  <div className="flex flex-col space-y-4">
                     <Label className="text-base font-medium leading-tight">
                        {question.text}
                     </Label>
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button
                              variant="outline"
                              className={cn(
                                 'w-[240px] justify-start p-6 text-left text-lg font-normal',
                                 !preferences[question.id]?.date && 'text-muted-foreground'
                              )}
                           >
                              {preferences[question.id]?.date
                                 ? format(new Date(preferences[question.id].date), 'dd MMM yyyy')
                                 : 'Select a date'}
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                              mode="single"
                              selected={
                                 preferences[question.id]?.date
                                    ? new Date(preferences[question.id].date)
                                    : new Date()
                              }
                              onSelect={(date) =>
                                 setPreferences((prev) => ({
                                    ...prev,
                                    [question.id]: {
                                       question: question.text,
                                       date: date ? date.toISOString() : null,
                                    },
                                 }))
                              }
                              initialFocus
                           />
                        </PopoverContent>
                     </Popover>
                  </div>
               );
            

         default:
            return null
      }
   }

   const renderStep = () => {
      const questionType = questionTypes[step - 1]
      const questionsByType = questions.filter((q) => q.type === questionType)

      // Add debugging log
      console.log('Current step:', step)
      console.log('Current question type:', questionType)
      console.log('Questions for current type:', questionsByType)

      return (
         <>
            <CardHeader>
               <CardTitle className="text-xl font-medium">
                  {questionType
                     ? questionType
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/\b\w/g, (char) => char.toUpperCase())
                     : 'Loading...'}
               </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-[120px] flex-col justify-center">
               <div className="space-y-6">
                  {questionsByType.map((question) => (
                     <div key={question.id} className="mb-4">
                        {renderQuestion(question)}
                     </div>
                  ))}
               </div>
            </CardContent>
         </>
      )
   }

   return (
      <>
         {itinerary ? (
            <div className="p-4 rounded-lg border text-white">
               <h2 className="text-lg font-semibold">Generated Itinerary:</h2>
               <pre className="whitespace-pre-wrap">{itinerary}</pre>
            </div>
         ) : (
            <>
               {/* <div className="mb-4 rounded-lg border p-4 text-white">
                  <h2 className="text-lg font-semibold">Current Preferences:</h2>
                  <pre className="whitespace-pre-wrap">
                     {JSON.stringify(preferences, null, 2)}
                  </pre>
               </div> */}
               <BackgroundGradient className="p-2">
                  <Card className="rounded-3xl px-2">
                     {renderStep()}
                     <CardFooter className="flex flex-row justify-center gap-x-6">
                        <Button
                           onClick={prevStep}
                           disabled={step === 1}
                           variant="ghost"
                           size="lg"
                        >
                           Previous
                        </Button>
                        <div className="text-md font-normal">
                           Step {step} of {totalSteps}
                        </div>
                        {step === totalSteps ? (
                           <Button
                              variant="ghost"
                              onClick={handleFinish}
                              size="lg"
                              disabled={loading}
                           >
                              {loading ? 'Generating...' : 'Generate Itinerary'}
                           </Button>
                        ) : (
                           <Button
                              variant="ghost"
                              onClick={nextStep}
                              size="lg"
                           >
                              Next
                           </Button>
                        )}
                     </CardFooter>
                  </Card>
               </BackgroundGradient>
            </>
         )}
      </>
   )
}

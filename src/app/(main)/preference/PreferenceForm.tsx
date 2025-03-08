'use client'

import { useState } from 'react'
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
import { MinusIcon, PlusIcon } from 'lucide-react'
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface PreferenceFormProps {
   questions: {
      id: number
      text: string
      type: QuestionType
      options: string[]
   }[]
   userId: number
}

export default function PreferenceForm({
   questions,
   userId,
}: PreferenceFormProps) {
   const [step, setStep] = useState(1)
   const [preferences, setPreferences] = useState<{ [key: string]: any }>({})
   const [loading, setLoading] = useState(false)
   const [itinerary, setItinerary] = useState<string | null>(null)
   const [adults, setAdults] = useState(1)
   const [children, setChildren] = useState(0)
   const [showDialog, setShowDialog] = useState(false)

   // useEffect(() => {
   //    console.log('Questions prop:', questions)
   // }, [questions])

   if (!questions || questions.length === 0) {
      return <div>Loading questions...</div>
   }

   const questionTypes = Array.from(new Set(questions.map((q) => q.type)))
   const totalSteps = questionTypes.length

   // console.log('Question types:', questionTypes)
   // console.log('Total steps:', totalSteps)

   // Next & Previous Page Button
   const nextStep = () => {
      const questionType = questionTypes[step - 1]
      const questionsForStep = questions.filter((q) => q.type === questionType)

      const allAnswered = questionsForStep.every((question) => {
         if (question.type === 'START_DATE') {
            return preferences[question.id]?.date
         } else if (question.type === 'BUDGET') {
            return preferences[question.id]?.value != null
         } else if (question.type === 'NUMBER_OF_TRAVELERS') {
            return preferences[question.id]?.value.adults >= 1
         } else if (question.type === 'PLACES_TO_AVOID') {
            return preferences[question.id]?.value !== undefined
         } else {
            return preferences[question.id]?.options?.length > 0
         }
      })

      if (allAnswered) {
         setStep((prev) => Math.min(prev + 1, totalSteps))
      } else {
         alert('Please answer all questions before proceeding.')
      }
   }
   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

   // Number of Passengers
   const incrementPassengers = (type: 'adults' | 'children') => {
      if (type === 'adults') {
         setAdults((prev) => Math.min(prev + 1, 5)) // Max 5 adults
      } else {
         setChildren((prev) => Math.min(prev + 1, 3)) // Max 3 children
      }
   }

   const decrementPassengers = (type: 'adults' | 'children') => {
      if (type === 'adults') {
         setAdults((prev) => Math.max(prev - 1, 1)) // Min 1 adult
      } else {
         setChildren((prev) => Math.max(prev - 1, 0)) // Min 0 children
      }
   }

   const handleFinish = async () => {
      setShowDialog(true)
   }

   const handleConfirmedGeneration = async () => {
      setShowDialog(false)
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
      // console.log('Rendering question:', question)

      switch (question.type) {
         case 'PLACES_TO_AVOID':
            return (
               <div className="space-y-4">
                  <Label className="text-base font-medium leading-tight">
                     {question.text}
                  </Label>
                  <input
                     type="text"
                     placeholder="Enter countries to avoid (comma-separated)"
                     value={preferences[question.id]?.value || ''}
                     onChange={(e) =>
                        setPreferences((prev) => ({
                           ...prev,
                           [question.id]: {
                              question: question.text,
                              questionType: question.type,
                              value: e.target.value,
                           },
                        }))
                     }
                     className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
               </div>
            )
         case 'TRIP_DURATION':
         case 'AIRPORT':
         case 'CULTURE':
         case 'OUTDOOR_ACTIVITIES':
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
                              checked={preferences[question.id]?.options?.includes(option) || false}
                              onCheckedChange={(checked) =>
                                 setPreferences((prev) => {
                                    const currentOptions = prev[question.id]?.options || []
                                    
                                    if (checked && currentOptions.length >= 1) {
                                       alert('Please choose only one option')
                                       return prev
                                    }

                                    const updatedOptions: string[] = checked
                                       ? [option] // Only store the new option
                                       : currentOptions.filter((opt: string) => opt !== option)

                                    return {
                                       ...prev,
                                       [question.id]: {
                                          question: question.text,
                                          questionType: question.type,
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
         case 'TRAVEL_TASTE':
         case 'ATMOSPHERE':
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
                                          questionType: question.type,
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
         case 'NUMBER_OF_TRAVELERS':
            return (
               <div className="flex flex-wrap gap-4">
                  <div className="min-w-[200px] flex-1">
                     <Label>Adults</Label>
                     <div className="mt-2 flex items-center">
                        <Button
                           type="button"
                           variant="outline"
                           size="icon"
                           onClick={() => {
                              const newAdults = Math.max(adults - 1, 1)
                              setAdults(newAdults)
                              setPreferences((prev) => ({
                                 ...prev,
                                 [question.id]: {
                                    question: question.text,
                                    value: { adults: newAdults, children },
                                 },
                              }))
                           }}
                           disabled={adults <= 1}
                        >
                           <MinusIcon className="h-4 w-4" />
                        </Button>
                        <span className="mx-4 min-w-[2ch] text-center">
                           {adults}
                        </span>
                        <Button
                           type="button"
                           variant="outline"
                           size="icon"
                           onClick={() => {
                              const newAdults = Math.min(adults + 1, 10)
                              setAdults(newAdults)
                              setPreferences((prev) => ({
                                 ...prev,
                                 [question.id]: {
                                    question: question.text,
                                    questionType: question.type,
                                    value: { adults: newAdults, children },
                                 },
                              }))
                           }}
                           disabled={adults >= 10}
                        >
                           <PlusIcon className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>

                  <div className="min-w-[200px] flex-1">
                     <Label>Children</Label>
                     <div className="mt-2 flex items-center">
                        <Button
                           type="button"
                           variant="outline"
                           size="icon"
                           onClick={() => {
                              const newChildren = Math.max(children - 1, 0)
                              setChildren(newChildren)
                              setPreferences((prev) => ({
                                 ...prev,
                                 [question.id]: {
                                    question: question.text,
                                    questionType: question.type,
                                    value: { adults, children: newChildren },
                                 },
                              }))
                           }}
                           disabled={children <= 0}
                        >
                           <MinusIcon className="h-4 w-4" />
                        </Button>
                        <span className="mx-4 min-w-[2ch] text-center">
                           {children}
                        </span>
                        <Button
                           type="button"
                           variant="outline"
                           size="icon"
                           onClick={() => {
                              const newChildren = Math.min(children + 1, 5)
                              setChildren(newChildren)
                              setPreferences((prev) => ({
                                 ...prev,
                                 [question.id]: {
                                    question: question.text,
                                    questionType: question.type,
                                    value: { adults, children: newChildren },
                                 },
                              }))
                           }}
                           disabled={children >= 5}
                        >
                           <PlusIcon className="h-4 w-4" />
                        </Button>
                     </div>
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
                                 questionType: question.type,
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
                              !preferences[question.id]?.date &&
                                 'text-muted-foreground'
                           )}
                        >
                           {preferences[question.id]?.date
                              ? format(
                                   new Date(preferences[question.id].date),
                                   'dd MMM yyyy'
                                )
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
                                    questionType: question.type,
                                    date: date ? date.toISOString() : null,
                                 },
                              }))
                           }
                           initialFocus
                        />
                     </PopoverContent>
                  </Popover>
               </div>
            )

         default:
            return null
      }
   }

   const renderStep = () => {
      const questionType = questionTypes[step - 1]
      const questionsByType = questions.filter((q) => q.type === questionType)

      if (questionsByType.length > 0) {
         const question = questionsByType[0]
         if (!preferences[question.id]) {
            if (questionType === 'NUMBER_OF_TRAVELERS') {
               setPreferences(prev => ({
                  ...prev,
                  [question.id]: {
                     question: question.text,
                     questionType: question.type,
                     value: { adults: 1, children: 0 }
                  }
               }))
            } else if (questionType === 'BUDGET') {
               setPreferences(prev => ({
                  ...prev,
                  [question.id]: {
                     question: question.text,
                     questionType: question.type,
                     value: 750
                  }
               }))
            }
         }
      }

      // Add debugging log
      // console.log('Current step:', step)
      // console.log('Current question type:', questionType)
      // console.log('Questions for current type:', questionsByType)

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
            <BackgroundGradient className="p-2">
               <Card className="rounded-3xl px-2">
                  <CardHeader>
                     <CardTitle className="text-xl font-medium"></CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="rounded-lg border p-4 text-black">
                        <h2 className="text-lg font-semibold">
                           Generated Itinerary:
                        </h2>
                        <pre className="whitespace-pre-wrap">{itinerary}</pre>
                     </div>
                  </CardContent>
               </Card>
            </BackgroundGradient>
         ) : (
            <>
               <div className="mb-4 rounded-lg border p-4 text-white">
                  <h2 className="text-lg font-semibold">
                     Current Preferences:
                  </h2>
                  <pre className="whitespace-pre-wrap">
                     {JSON.stringify(preferences, null, 2)}
                  </pre>
               </div>
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
                           <>
                              <AlertDialog
                                 open={showDialog}
                                 onOpenChange={setShowDialog}
                              >
                                 <AlertDialogTrigger asChild>
                                    <Button
                                       variant="ghost"
                                       onClick={handleFinish}
                                       size="lg"
                                       disabled={loading}
                                    >
                                       {loading
                                          ? 'Generating...'
                                          : 'Generate Itinerary'}
                                    </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent>
                                    <AlertDialogHeader>
                                       <AlertDialogTitle>
                                          Generate Itinerary
                                       </AlertDialogTitle>
                                       <AlertDialogDescription>
                                          Are you sure you want to generate your
                                          itinerary with the current
                                          preferences? This will create a
                                          personalized travel plan based on your
                                          selections.
                                       </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                       <AlertDialogCancel>
                                          Cancel
                                       </AlertDialogCancel>
                                       <AlertDialogAction
                                          onClick={handleConfirmedGeneration}
                                       >
                                          Continue
                                       </AlertDialogAction>
                                    </AlertDialogFooter>
                                 </AlertDialogContent>
                              </AlertDialog>
                           </>
                        ) : (
                           <Button variant="ghost" onClick={nextStep} size="lg">
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

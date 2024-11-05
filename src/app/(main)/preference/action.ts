'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPreferenceQuestions(){
    const data = await prisma.question.findMany({

        orderBy: {
           id: 'asc', // Replace 'id' with the field you want to sort by
        },
     })
     return data
}



// export async function storePreferences(userId: number, answers: any) {
//     return await prisma.preference.create({
//        data: {
//           userId,
//           answers: JSON.stringify(answers), // storing answers in JSON format
//        },
//     })
//  }

//  async function handleSubmit() {
//     // Assuming preferences holds the user's answers
//     await fetch('/api/storePreferences', {
//        method: 'POST',
//        headers: {
//           'Content-Type': 'application/json',
//        },
//        body: JSON.stringify({ userId: 1, answers: preferences }),
//     })
//  }
 
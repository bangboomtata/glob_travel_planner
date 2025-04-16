import * as z from "zod"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from '@prisma/client'
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { compare, hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema> 

const prisma = new PrismaClient()

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) {
                throw new Error("Missing email or password");
              }
          
              const user = await prisma.user.findUnique({
                where: { email: credentials.email }
              });
          
              if (!user) {
                throw new Error("user-does-not-exist");
              }
          
              if (!user.password) {
                throw new Error("credentials-do-not-match");
              }
          
              const isValid = await compare(credentials.password, user.password);
          
              if (!isValid) {
                throw new Error("credentials-do-not-match");
              }
          
              return {
                id: user.id,
                email: user.email,
                name: user.name,
              };
            }
          })
    ],
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
    pages: {
        signIn: '/login',
        error: '/login',
    },
} 

export async function POST(req: Request) {
  const { email, password, name } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
  }
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }
  const hashedPassword = await hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  })
  return NextResponse.json({ user: { id: user.id, email: user.email } })
} 
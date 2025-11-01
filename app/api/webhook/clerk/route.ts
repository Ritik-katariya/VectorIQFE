import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { RoleAccess } from '@prisma/client'
export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req)


    const { id } = event.data
    const eventType = event.type

    if(eventType === 'user.created') {
       await prisma.user.create({
        data: {
          clerkId: event.data.id,
          email: event.data.email_addresses[0].email_address,
          firstName: event.data.first_name,
          lastName: event.data.last_name,
          profileImage: event.data.image_url as string,
          roleAccess: event.data.public_metadata?.role as RoleAccess || RoleAccess.USER,
        },
      });
    }
    if(eventType === 'user.deleted') {
      await prisma.user.delete({
        where: {
          clerkId: event.data.id,
        },
      });
    }
    if(eventType === 'user.updated') {
      await prisma.user.update({
        where: {
          clerkId: event.data.id,
        },
        data: {
          roleAccess: event.data.public_metadata?.role as RoleAccess || RoleAccess.USER,
          firstName: event.data.first_name,
          lastName: event.data.last_name,
          profileImage: event.data.image_url as string,
        },
      });
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}
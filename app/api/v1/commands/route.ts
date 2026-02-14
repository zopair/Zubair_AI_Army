
    import { NextResponse } from 'next/server';
    import { prisma } from '@/lib/prisma';

    export async function POST(req: Request) {
      const { text } = await req.json();
      const command = await prisma.command.create({
        data: { text, status: 'PENDING' }
      });
      return NextResponse.json(command);
    }
    
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const motos = await prisma.moto.findMany({
        where: { userId: user.id },
        include: { spareParts: true },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(motos);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Basic validation
    // Expecting: brand, model, year, purchaseDate, purchaseCostEstimated
    const { brand, model, year, purchaseCostEstimated, purchaseDate } = body;

    if (!brand || !model || !year || !purchaseCostEstimated || !purchaseDate) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newMoto = await prisma.moto.create({
        data: {
            userId: user.id,
            brand,
            model,
            year: parseInt(year),
            purchaseCostEstimated: parseFloat(purchaseCostEstimated),
            purchaseDate: new Date(purchaseDate),
            status: 'COMPRADA'
        }
    });

    return NextResponse.json(newMoto);
}

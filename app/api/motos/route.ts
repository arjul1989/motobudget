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

    const normalizedBody = {
        ...body,
        purchaseCostReal: body.purchaseCostReal || 0,
        laborCostReal: body.laborCostReal || 0,
        paperworkCostReal: body.paperworkCostReal || 0,
        laborCostEstimated: body.laborCostEstimated || 0,
        paperworkCostEstimated: body.paperworkCostEstimated || 0,
        userId: user.id
    };

    // Create Moto
    const newMoto = await prisma.moto.create({
        data: {
            brand: normalizedBody.brand,
            model: normalizedBody.model,
            year: parseInt(normalizedBody.year),
            plate: normalizedBody.plate,
            purchaseDate: new Date(normalizedBody.purchaseDate),
            purchaseCostEstimated: parseFloat(normalizedBody.purchaseCostEstimated),
            purchaseCostReal: normalizedBody.purchaseCostReal,
            laborCostEstimated: normalizedBody.laborCostEstimated,
            laborCostReal: normalizedBody.laborCostReal,
            paperworkCostEstimated: normalizedBody.paperworkCostEstimated,
            paperworkCostReal: normalizedBody.paperworkCostReal,
            status: 'EN_LA_MIRA',

            userId: normalizedBody.userId,

            spareParts: {
                create: body.parts ? body.parts.map((p: any) => ({
                    name: p.name,
                    costEstimated: p.estimated,
                    costReal: p.real || 0
                })) : []
            }
        },
    });

    return NextResponse.json(newMoto);
}

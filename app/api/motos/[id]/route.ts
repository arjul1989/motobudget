import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch single moto
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const moto = await prisma.moto.findUnique({
            where: { id },
            include: { spareParts: true },
        });

        if (!moto) {
            return NextResponse.json({ error: "Moto not found" }, { status: 404 });
        }

        if (moto.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        return NextResponse.json(moto);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching moto" }, { status: 500 });
    }
}

// PUT: Update moto details
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    try {
        // Basic verification
        const existing = await prisma.moto.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
        }

        // Update Moto fields
        await prisma.moto.update({
            where: { id },
            data: {
                purchaseCostReal: body.purchaseCostReal,
                paperworkCostReal: body.paperworkCostReal,
                laborCostReal: body.laborCostReal,
                salePriceEstimated: body.salePriceEstimated,
                image: body.image,
                plate: body.plate,
                status: body.status
            }
        });

        // Handle Parts: Create new ones or update?
        // For simplicity, if 'parts' is provided, we can upsert.
        if (body.parts && Array.isArray(body.parts)) {
            for (const part of body.parts) {
                if (part.id) {
                    // Update existing
                    await prisma.sparePart.update({
                        where: { id: part.id },
                        data: { costReal: part.real, costEstimated: part.estimated, name: part.name }
                        // Note: ensure mapping matches UI
                    }).catch(() => { }); // Ignore if not found
                } else {
                    // Create new
                    await prisma.sparePart.create({
                        data: {
                            motoId: id,
                            name: part.name,
                            costEstimated: part.estimated,
                            costReal: part.real || 0
                        }
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating moto:", error);
        return NextResponse.json({ error: "Error updating moto" }, { status: 500 });
    }
}

// DELETE: Remove moto
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existing = await prisma.moto.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
        }

        await prisma.moto.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting moto:", error);
        return NextResponse.json({ error: "Error deleting moto" }, { status: 500 });
    }
}

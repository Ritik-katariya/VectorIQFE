import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import { DataType } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { dataItems } = await request.json();
    } catch (error) {
        throw new Error("Failed to uploade data.", { cause: error });
        
    }
    return NextResponse.json({ message: "Data ingested successfully." }, { status: 200 });
}
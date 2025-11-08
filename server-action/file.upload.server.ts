"use server";
import prisma from "@/lib/prisma";
import { DataType } from "@prisma/client";
import axios from "axios";
import type {
  ResponseDataItem,
  UploadDataItem,
} from "@/types/upload-data-item";

const baseUrl = process.env.VECTOR_FASTAPI_BASE_URL;
export async function ingestData(
  item: UploadDataItem,
  userId: string,
  dataType: DataType
) {
  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { datasources: true },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }
  if (currentUser.maxVectors <= 0) {
    throw new Error("You have reached the maximum number of vectors");
  }

  // Ensure datasource exists for the user
  const datasource = currentUser.datasources
    ? currentUser.datasources
    : await prisma.datasource.create({ data: { userId: currentUser.id } });

  // Send data to FastAPI vector ingestion endpoint
  const form = new FormData();
  // common fields
  if (item.pdf_strategy) form.append("pdf_strategy", String(item.pdf_strategy));
  if (typeof item.sitemap !== "undefined")
    form.append("sitemap", String(item.sitemap));
  if (item.source_label) form.append("source_label", item.source_label);
  if (typeof item.chunk_size !== "undefined")
    form.append("chunk_size", String(item.chunk_size));
  if (typeof item.chunk_overlap !== "undefined")
    form.append("chunk_overlap", String(item.chunk_overlap));
  if (item.store_mode) form.append("store_mode", String(item.store_mode));
  if (item.session_id) form.append("session_id", item.session_id);
  if (item.namespace) form.append("namespace", item.namespace);

  // exactly one of file/text/url
  if (item.file) {
    // item.file is expected to be a Blob/File on the server side invocation
    // FormData in Node 18+/Next supports Blob directly
    // Default filename fallback
    form.append("file", item.file as unknown as Blob);
  } else if (item.text) {
    form.append("text", item.text);
  } else if (item.url) {
    form.append("url", item.url);
  }

  const { data: vectorData } = await axios.post<ResponseDataItem>(
    `${baseUrl}/ingest`,
    form
  );

  const data = await prisma.dataItem.create({
    data: {
      datasourceId: datasource.id,
      name: item.source_label,
      dataType,
      totalChunks: vectorData.total_chunks,
      strategy: vectorData.strategy,
      ChunksIds: vectorData.ids,
    },
  });
  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      maxVectors: {
        decrement: 1,
      },
    },
  });
  return data;
}

export async function getDataSource(userId: string) {
  if (!userId) {
    return null;
  }
  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { datasources: { include: { dataItems: true } } },
  });
  if (!currentUser) {
    throw new Error("User not found");
  }
  const datasource = currentUser.datasources
    ? currentUser.datasources
    : await prisma.datasource.create({ data: { userId: currentUser.id } });
  return datasource;
}

export async function listDataItems(userId: string) {
  if (!userId) {
    return [];
  }
  const datasource = await getDataSource(userId);
  if (!datasource) return [];
  const items = await prisma.dataItem.findMany({
    where: { datasourceId: datasource.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, dataType: true, ChunksIds: true },
  });
  return items;
}

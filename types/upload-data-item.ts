import type { File } from "buffer";


export type UploadDataItem = {
    url?: string;
    text?: string;
    file?:File;
    pdf_strategy?:"auto"|"text"| "table";
    sitemap:boolean;
    source_label: string;
    chunk_size?: number;
    chunk_overlap?: number;
    store_mode?:"permanent" | "temporary";
    session_id?: string;
    namespace: string;
};

export type ResponseDataItem = {
    total_chunks: number;
    strategy: string;
    sample:null;
    ids: string[];
}
"use client";

import * as XLSX from "xlsx";

import { Tag } from "@/types/tag";

export type ImportableTagRow = {
  name: string;
  description?: string;
};

export function exportTagsToWorkbook(tags: Tag[], fileName: string) {
  const rows = tags.map((tag) => ({
    ID: tag.id,
    Name: tag.name,
    Slug: tag.slug,
    Description: tag.description ?? "",
    CreatedAt: tag.createdAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tags");
  XLSX.writeFile(workbook, fileName);
}

export function downloadTagsImportTemplate() {
  const sampleRows = [
    { name: "Ayurveda", description: "Shared editorial and course tag" },
    { name: "Weight Loss", description: "Useful for both article and course discovery" },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "TagsTemplate");
  XLSX.writeFile(workbook, "tags-import-template.xlsx");
}

export async function parseTagsSpreadsheet(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
  });

  const parsedRows = rows.map((row): ImportableTagRow | null => {
    const name = String(row.name ?? row.Name ?? "").trim();
    const description = String(row.description ?? row.Description ?? "").trim();

    if (!name) {
      return null;
    }

    return {
      name,
      description: description || undefined,
    };
  });

  return parsedRows.filter((item): item is ImportableTagRow => item !== null);
}

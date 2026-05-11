"use client";

import * as XLSX from "xlsx";

import { Category, CategoryType, CreateCategoryPayload } from "@/types/category";
import { slugify } from "@/utils/slugify";

export type ImportableCategoryRow = CreateCategoryPayload;

export function exportCategoriesToWorkbook(categories: Category[], fileName: string) {
  const rows = categories.map((category) => ({
    ID: category.id,
    Name: category.name,
    Slug: category.slug,
    Type: category.type,
    Description: category.description ?? "",
    ImageAlt: category.imageAlt ?? "",
    CreatedAt: category.createdAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
  XLSX.writeFile(workbook, fileName);
}

export function downloadCategoriesImportTemplate() {
  const sampleRows = [
    {
      name: "Nutrition Basics",
      type: "course",
      description: "Foundational course category",
      imageAlt: "Nutrition course category cover",
    },
    {
      name: "Wellness Insights",
      type: "article",
      description: "Editorial category for wellness articles",
      imageAlt: "Wellness article category cover",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "CategoriesTemplate");
  XLSX.writeFile(workbook, "categories-import-template.xlsx");
}

export async function parseCategoriesSpreadsheet(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
  });

  const parsedRows = rows.map((row): ImportableCategoryRow | null => {
    const name = String(row.name ?? row.Name ?? "").trim();
    const rawType = String(row.type ?? row.Type ?? "course").trim().toLowerCase();
    const description = String(row.description ?? row.Description ?? "").trim();
    const imageAlt = String(row.imageAlt ?? row.ImageAlt ?? "").trim();

    if (!name) {
      return null;
    }

    const type: CategoryType = rawType === "article" ? "article" : "course";

    return {
      name,
      slug: slugify(name),
      type,
      description: description || undefined,
      imageAlt: imageAlt || undefined,
    };
  });

  return parsedRows.filter(
    (item): item is ImportableCategoryRow => item !== null,
  );
}

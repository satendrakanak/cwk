import { User } from "@/types/user";
import * as XLSX from "xlsx";

export type ImportableUserRow = {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
};

export function exportUsersToWorkbook(users: User[], fileName: string) {
  const rows = users.map((user) => ({
    ID: user.id,
    FirstName: user.firstName,
    LastName: user.lastName ?? "",
    Username: user.username ?? "",
    Email: user.email,
    PhoneNumber: user.phoneNumber ?? "",
    Roles: (user.roles ?? []).map((role) => role.name).join(", "),
    Location: user.profile?.location ?? "",
    Website: user.profile?.website ?? "",
    Company: user.profile?.company ?? "",
    CreatedAt: user.createdAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  XLSX.writeFile(workbook, fileName);
}

export function downloadUsersImportTemplate() {
  const sampleRows = [
    {
      firstName: "Aarav",
      lastName: "Sharma",
      email: "aarav@example.com",
      phoneNumber: "9876543210",
    },
    {
      firstName: "Priya",
      lastName: "Verma",
      email: "priya@example.com",
      phoneNumber: "9876501234",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "UsersTemplate");
  XLSX.writeFile(workbook, "users-import-template.xlsx");
}

export async function parseUsersSpreadsheet(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
  });

  const parsedRows = rows.map((row): ImportableUserRow | null => {
      const firstName = String(row.firstName ?? row.FirstName ?? "").trim();
      const lastName = String(row.lastName ?? row.LastName ?? "").trim();
      const email = String(row.email ?? row.Email ?? "").trim();
      const phoneNumber = String(
        row.phoneNumber ?? row.PhoneNumber ?? "",
      ).trim();

      if (!firstName || !email) {
        return null;
      }

      return {
        firstName,
        lastName: lastName || undefined,
        email,
        phoneNumber: phoneNumber || undefined,
        password: "Temp@1234",
      };
    });

  const users = parsedRows.filter(
    (item): item is ImportableUserRow => item !== null,
  );

  return users;
}

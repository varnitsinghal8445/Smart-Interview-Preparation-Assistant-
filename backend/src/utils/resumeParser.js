import fs from "fs/promises";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export const extractTextFromFile = async (filePath, mimeType, originalName) => {
  const ext = originalName.split(".").pop()?.toLowerCase();

  if (mimeType === "application/pdf" || ext === "pdf") {
    const buffer = await fs.readFile(filePath);
    const data = await pdf(buffer);
    return data.text.trim();
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.trim();
  }

  if (ext === "txt") {
    return (await fs.readFile(filePath, "utf-8")).trim();
  }

  throw new Error("Unsupported file format. Upload PDF, DOCX, or TXT.");
};

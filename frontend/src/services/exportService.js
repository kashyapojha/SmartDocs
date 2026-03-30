// frontend/src/services/exportService.js
import html2pdf from "html2pdf.js";
import { Document, Packer, Paragraph } from "docx";

export const exportService = {
  // Export as PDF
  exportPDF: (title, content, fileName = "document.pdf") => {
    try {
      const element = document.createElement("div");
      element.innerHTML = content;

      const config = {
        margin: 10,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(config).from(element).save();
    } catch (error) {
      console.error("PDF export failed:", error);
      throw error;
    }
  },

  // Export as HTML
  exportHTML: (title, content, fileName = "document.html") => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${escapeHtml(title)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 900px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #2c3e50;
              border-bottom: 3px solid #3498db;
              padding-bottom: 10px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            a {
              color: #3498db;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(title)}</h1>
          <div class="content">
            ${content}
          </div>
          <footer>
            <p><small>Generated on ${new Date().toLocaleString()}</small></p>
          </footer>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: "text/html" });
      downloadFile(blob, fileName, "text/html");
    } catch (error) {
      console.error("HTML export failed:", error);
      throw error;
    }
  },

  // Export as DOCX
  exportDOCX: async (title, content, fileName = "document.docx") => {
    try {
      const paragraphs = [];

      // Add title
      paragraphs.push(
        new Paragraph({
          text: title,
          heading: "Heading1",
          themeColor: "accent1",
          bold: true,
          size: 28,
        })
      );

      // Parse HTML content and convert to paragraphs
      const doc = new DOMParser().parseFromString(content, "text/html");
      const elements = doc.body.childNodes;

      elements.forEach((element) => {
        if (element.nodeType === Node.ELEMENT_NODE) {
          const text = element.textContent || "";

          if (text.trim()) {
            let paragraph = new Paragraph({
              text: text,
            });

            // Apply basic formatting based on HTML tag
            if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(element.tagName)) {
              paragraph = new Paragraph({
                text: text,
                bold: true,
                size: 22,
              });
            } else if (element.tagName === "EM" || element.tagName === "I") {
              paragraph = new Paragraph({
                text: text,
                italic: true,
              });
            } else if (element.tagName === "STRONG" || element.tagName === "B") {
              paragraph = new Paragraph({
                text: text,
                bold: true,
              });
            }

            paragraphs.push(paragraph);
          }
        } else if (element.nodeType === Node.TEXT_NODE && element.textContent.trim()) {
          paragraphs.push(
            new Paragraph({
              text: element.textContent.trim(),
            })
          );
        }
      });

      // Add footer with timestamp
      paragraphs.push(
        new Paragraph({
          text: `\nGenerated on ${new Date().toLocaleString()}`,
          italics: true,
          color: "999999",
        })
      );

      const docFile = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(docFile);
      downloadFile(blob, fileName, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    } catch (error) {
      console.error("DOCX export failed:", error);
      throw error;
    }
  },
};

// Helper function to download file
function downloadFile(blob, fileName, mimeType) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.type = mimeType;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

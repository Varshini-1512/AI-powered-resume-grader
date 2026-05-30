const pdfParseModule = require("pdf-parse");

// Normalize pdf-parse to a callable that returns { text }.
// pdf-parse versions differ: some export a function, some export { PDFParse }.
const pdfParseCallable =
    typeof pdfParseModule === "function" ? pdfParseModule : null;

const pdfParseCallableDefault =
    pdfParseModule?.default && typeof pdfParseModule.default === "function"
        ? pdfParseModule.default
        : null;

const PDFParseClass =
    pdfParseModule?.PDFParse && typeof pdfParseModule.PDFParse === "function"
        ? pdfParseModule.PDFParse
        : null;

module.exports = async (buffer) => {
    if (pdfParseCallable) {
        const parsed = await pdfParseCallable(buffer);
        return parsed?.text || "";
    }

    if (pdfParseCallableDefault) {
        const parsed = await pdfParseCallableDefault(buffer);
        return parsed?.text || "";
    }

    if (PDFParseClass) {
        const parser = new PDFParseClass({ data: buffer });

        try {
            if (typeof parser.getText === "function") {
                const parsed = await parser.getText();
                return parsed?.text || "";
            }

            if (typeof parser.load === "function") {
                const parsed = await parser.load({ data: buffer });
                return parsed?.text || "";
            }

            if (typeof parser.parseBuffer === "function") {
                const parsed = await parser.parseBuffer(buffer);
                return parsed?.text || "";
            }
        } finally {
            if (typeof parser.destroy === "function") {
                await parser.destroy();
            }
        }

        throw new Error("PDFParse class does not expose getText/load/parseBuffer");
    }

    throw new Error("pdf-parse did not expose a callable function or PDFParse class");
};


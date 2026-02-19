import { PDFDocument, rgb } from "pdf-lib"

export async function generateSignedPdf(pdfBuffer, signature) {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true })

    const page = pdfDoc.getPage(signature.page_number - 1)
    const { width, height } = page.getSize()

    const x = (signature.x_percent / 100) * width
    const y = height - ((signature.y_percent / 100) * height)

    page.drawText("Signed", {
        x,
        y,
        size: 12,
        color: rgb(0, 0, 0)
    })

    return await pdfDoc.save()
}
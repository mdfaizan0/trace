import multer from "multer"

const storage = multer.memoryStorage()

const uploadSingleFile = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"), false)
        }
        cb(null, true)
    },
    limits: { fileSize: 1024 * 1024 * 20 }
})

export const upload = uploadSingleFile.single("file")
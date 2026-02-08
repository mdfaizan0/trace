import path from "path"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "../config/supabase.js"

export async function uploadFile(file, userId) {
    const fileExt = path.extname(file.originalname)
    const fileName = `${uuidv4()}${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await supabase.storage
        .from("documents")
        .upload(filePath, file.buffer, {
            contentType: file.mimetype
        })

    if (error) {
        throw error
    }
    return data?.path || null
}
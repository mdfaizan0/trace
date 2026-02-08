import { supabase } from "../config/supabase.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export async function signUp(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const { data: existingUser, error: existingUserError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();

        if (existingUserError && existingUserError.code !== "PGRST116") {
            return res.status(500).json({ message: "Error checking for existing user", error: existingUserError.message });
        }

        if (existingUser) {
            return res.status(400).json({ message: "An account with this email address already exists" });
        }

        const { error } = await supabase
            .from("users")
            .insert({
                name,
                email,
                password_hash: await hashPassword(password)
            })

        if (error) {
            return res.status(500).json({ message: "Error creating user", error: error.message });
        }

        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Error creating user", error: error.message });
    }
}

export async function signIn(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (userError) {
            return res.status(500).json({ message: "Error checking for user" });
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
            message: "User signed in successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user)
            }
        });
    } catch (error) {
        console.error("Error signing in user:", error);
        return res.status(500).json({ message: "Error signing in user", error: error.message });
    }
}
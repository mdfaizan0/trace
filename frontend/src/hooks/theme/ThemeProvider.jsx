import { useEffect, useState } from "react"
import { ThemeContext } from "./useTheme"

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("trace_theme")
        return savedTheme || "dark"
    })

    useEffect(() => {
        const root = window.document.documentElement
        if (theme === "dark") {
            root.classList.add("dark")
        } else {
            root.classList.remove("dark")
        }
        localStorage.setItem("trace_theme", theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark")
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
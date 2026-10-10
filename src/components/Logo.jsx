import { ThemeContext } from "@/context";
import { cn } from "@/lib/utils";
import { useContext } from "react";
export const Logo = ({ className = "" }) => {
    const { darkMode } = useContext(ThemeContext);
    return (
        <img className={cn("max-w-[100px]", className)} src={darkMode ? "https://service.bdassistant.com/uploads/pvrkzreamp220.png" : "https://service.bdassistant.com/uploads/dgeaffbkkg198.png"} alt="logo" />
    );
};

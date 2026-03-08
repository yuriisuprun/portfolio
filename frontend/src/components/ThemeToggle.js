import {useState} from "react";

export default function ThemeToggle(){

    const [dark,setDark]=useState(false);

    function toggle(){
        document.documentElement.classList.toggle("dark");
        setDark(!dark);
    }

    return(
        <button onClick={toggle}>
            {dark?"☀️":"🌙"}
        </button>
    );

}
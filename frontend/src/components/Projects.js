import {useEffect,useState} from "react";
import axios from "axios";

export default function Projects(){

    const [repos,setRepos]=useState([]);

    useEffect(()=>{

        axios.get("http://localhost:8080/api/repos")
            .then(res=>{

                setRepos(res.data.slice(0,6));

            });

    },[]);

    return(

        <section id="projects" className="p-12">

            <h2 className="text-3xl mb-8">
                Projects
            </h2>

            <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">

                {repos.map(repo=>(
                    <div key={repo.id} className="border p-6 rounded-xl">

                        <h3 className="text-xl font-bold">
                            {repo.name}
                        </h3>

                        <p>{repo.description}</p>

                        <a href={repo.html_url} className="text-blue-500">
                            View Code
                        </a>

                    </div>
                ))}

            </div>

        </section>

    )

}
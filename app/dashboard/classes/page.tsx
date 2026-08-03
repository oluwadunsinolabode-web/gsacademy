"use client";

import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";
import {getStudentClasses} from "@/lib/services/studentClasses";


export default function ClassesPage(){

const [classes,setClasses]=useState<any[]>([]);
const [loading,setLoading]=useState(true);



useEffect(()=>{


async function load(){

const {
data:{user}
}=await supabase.auth.getUser();


if(!user)return;


const {data:student}=await supabase
.from("students")
.select("id")
.eq("auth_id",user.id)
.single();



if(student){

const {data}=await getStudentClasses(student.id);

setClasses(data || []);

}


setLoading(false);


}


load();


},[]);



if(loading){

return <p>Loading classes...</p>

}



return(

<div>


<h1 className="text-4xl font-extrabold">
My Classes
</h1>



<div className="mt-10 grid gap-6">


{
classes.map((item)=>(


<div
key={item.id}
className="rounded-3xl bg-white p-8 shadow"
>


<h2 className="text-2xl font-bold">

{item.subjects?.name}

</h2>



<p className="mt-3">

Tutor:
{item.tutors?.full_name}

</p>



<a
href="/dashboard/classwork"
className="mt-6 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-bold"
>

Open Classwork

</a>


</div>


))
}



</div>


</div>


)

}
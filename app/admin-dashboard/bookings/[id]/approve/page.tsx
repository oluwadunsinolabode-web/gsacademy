"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function ApproveBookingPage({

params,

}:{

params:{
id:string
}

}){


const router = useRouter();

const [loading,setLoading]=useState(false);



async function approve(){

setLoading(true);


await fetch(
`/api/admin/bookings/${params.id}/approve`,
{
method:"POST"
}
);


setLoading(false);


router.push(
"/admin-dashboard/students"
);


}



return (

<div className="mx-auto max-w-4xl">


<h1 className="text-4xl font-extrabold">
Approve Booking
</h1>



<div className="mt-10 rounded-3xl bg-white p-8 shadow">


<p className="text-slate-600">

This will create the student account inside GS Academy.

</p>



<button

onClick={approve}

disabled={loading}

className="mt-8 rounded-xl bg-green-600 px-8 py-4 font-bold text-white"

>

{loading ? "Approving..." : "Approve Student"}

</button>


</div>


</div>

);


}
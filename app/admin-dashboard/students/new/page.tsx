"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTutors } from "@/lib/services/tutor";
import { getTimetable } from "@/lib/services/timetable";

export default function AddStudentPage() {

const router = useRouter();

const [studentName,setStudentName]=useState("");
const [email,setEmail]=useState("");
const [phone,setPhone]=useState("");

const [parentName,setParentName]=useState("");
const [parentPhone,setParentPhone]=useState("");

const [country,setCountry]=useState("Nigeria");
const [academicLevel,setAcademicLevel]=useState("");

const [studentPackage,setStudentPackage]=useState("");

const [subjects,setSubjects]=useState<any[]>([]);
const [selectedSubjects,setSelectedSubjects]=useState<string[]>([]);

const [tutors,setTutors]=useState<any[]>([]);

const [assignments,setAssignments]=useState<any[]>([]);


const [amountPaid,setAmountPaid]=useState("");
const [totalFee,setTotalFee]=useState("");
const [outstandingBalance,setOutstandingBalance]=useState("");
const [paymentDueDate,setPaymentDueDate]=useState("");


const [currentSubject,setCurrentSubject]=useState("");
const [currentTutor,setCurrentTutor]=useState("");
const [currentMeetLink,setCurrentMeetLink]=useState("");

const [currentDay,setCurrentDay]=useState("");
const [currentTime,setCurrentTime]=useState("");

const [subjectLessons,setSubjectLessons]=useState<any[]>([]);


const days=[
"Monday",
"Tuesday",
"Wednesday",
"Thursday",
"Friday",
"Saturday"
];


const times=[
"8:00 AM - 10:00 AM",
"10:00 AM - 12:00 PM",
"10:00 AM - 11:30 AM",
"12:00 PM - 01:30 PM",
"12:00 PM - 02:00 PM",
"1:00 PM - 3:00 PM",
"2:00 PM - 4:00 PM",
"04:00 PM - 5:30 PM",
"4:00 PM - 6:00 PM",
"05:00 PM - 07:00 PM"
];


useEffect(()=>{

async function loadData(){

const {data:tutorData}=await getTutors();

if(tutorData){
setTutors(tutorData);
}


const subjectResponse=
await fetch("/api/admin/subjects");

const {data:subjectData}
=await subjectResponse.json();


if(subjectData){
setSubjects(subjectData);
}


await getTimetable();


}


loadData();


},[]);



function updateAssignment(
subjectId:string,
field:string,
value:any
){

setAssignments(prev=>{

const found=prev.find(
(item)=>item.subject_id===subjectId
);


if(found){

return prev.map(item=>

item.subject_id===subjectId

?
{
...item,
[field]:value
}

:item

);

}


return [
...prev,
{
subject_id:subjectId,
tutor_id:"",
meet_link:"",
lessons:[]
}
];


});


}
async function handleSave(){

if(!studentName){

alert("Please enter student name");
return;

}


if(!email){

alert("Please enter student email");
return;

}


const total = Number(totalFee) || 0;
const paid = Number(amountPaid) || 0;



const response = await fetch(
"/api/admin/students",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

full_name:studentName,

email,

phone,

parent_name:parentName,

parent_phone:parentPhone,

country,

academic_level:academicLevel,

package:studentPackage,


subjects: assignments.map(
(item)=>item.subject_id
),


assignments,


amount_paid:paid,


outstanding_balance:
Number(outstandingBalance) ||
Math.max(total-paid,0),


payment_due_date:paymentDueDate,


lesson_schedule:assignments


})

}

);



const result = await response.json();



if(!response.ok){

alert(result.error);

return;

}



alert(
`Student created successfully!

Login Email:

${result.loginEmail}

Temporary Password:

${result.temporaryPassword}`
);


router.push(
"/admin-dashboard/students"
);


router.refresh();


}




return (
  <div className="mx-auto max-w-4xl">

<h1 className="text-4xl font-extrabold text-slate-900">
Add Student
</h1>


<p className="mt-3 text-slate-700">
Register a new student into GS Academy.
</p>



<div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">


<div className="grid gap-6 md:grid-cols-2">



<input

value={studentName}

onChange={(e)=>setStudentName(e.target.value)}

placeholder="Student Full Name"

className="rounded-xl border px-5 py-4"

/>



<input

value={email}

onChange={(e)=>setEmail(e.target.value)}

placeholder="Student Email"

className="rounded-xl border px-5 py-4"

/>




<input

value={phone}

onChange={(e)=>setPhone(e.target.value)}

placeholder="Student Phone"

className="rounded-xl border px-5 py-4"

/>




<input

value={parentName}

onChange={(e)=>setParentName(e.target.value)}

placeholder="Parent Name"

className="rounded-xl border px-5 py-4"

/>




<input

value={parentPhone}

onChange={(e)=>setParentPhone(e.target.value)}

placeholder="Parent Phone"

className="rounded-xl border px-5 py-4"

/>




<select

value={country}

onChange={(e)=>setCountry(e.target.value)}

className="rounded-xl border px-5 py-4"

>

<option>Nigeria</option>

<option>United Kingdom</option>

<option>United States</option>

<option>Canada</option>

<option>Australia</option>

<option>Other</option>


</select>




<input

value={academicLevel}

onChange={(e)=>setAcademicLevel(e.target.value)}

placeholder="Academic Level"

className="rounded-xl border px-5 py-4"

/>



</div>
<div className="mt-10 rounded-2xl border p-6 space-y-5">

<h2 className="text-xl font-bold">
Course Setup
</h2>


<select

value={studentPackage}

onChange={(e)=>setStudentPackage(e.target.value)}

className="w-full rounded-xl border px-5 py-4"

>

<option value="">
Select Package
</option>

<option>
Package 1 - Small Group
</option>

<option>
Package 2 - Private Coaching
</option>

<option>
Package 3 - Premium Coaching
</option>

<option>
One-on-One Coaching
</option>


</select>


</div>



<div className="mt-10 rounded-2xl border p-6 space-y-5">


<h2 className="text-xl font-bold">
Lesson Setup
</h2>



<select

value={currentSubject}

onChange={(e)=>setCurrentSubject(e.target.value)}

className="w-full rounded-xl border px-5 py-4"

>

<option value="">
Select Subject
</option>


{subjects.map((subject)=>(

<option

key={subject.id}

value={subject.id}

>

{subject.name}

</option>

))}


</select>





<select

value={currentTutor}

onChange={(e)=>setCurrentTutor(e.target.value)}

className="w-full rounded-xl border px-5 py-4"

>


<option value="">
Select Tutor
</option>


{tutors.map((tutor)=>(

<option

key={tutor.id}

value={tutor.id}

>

{tutor.full_name}

</option>

))}


</select>
<div className="space-y-3">

<label className="font-bold">
Lesson Day
</label>


<select

value={currentDay}

onChange={(e)=>setCurrentDay(e.target.value)}

className="w-full rounded-xl border px-5 py-4"

>

<option value="">
Select Day
</option>


{days.map((day)=>(

<option

key={day}

value={day}

>

{day}

</option>

))}


</select>


<label className="font-bold block mt-4">
Lesson Time
</label>


<select

value={currentTime}

onChange={(e)=>setCurrentTime(e.target.value)}

className="w-full rounded-xl border px-5 py-4"

>

<option value="">
Select Time
</option>


{times.map((time)=>(

<option

key={time}

value={time}

>

{time}

</option>

))}


</select>



<button

type="button"

onClick={()=>{


if(!currentDay || !currentTime){

alert("Select day and time");

return;

}



setSubjectLessons([

...subjectLessons,

{

day:currentDay,

time:currentTime

}

]);



setCurrentDay("");

setCurrentTime("");


}}


className="rounded-xl bg-slate-900 text-white px-6 py-3 font-bold"

>

+ Add Lesson Time

</button>



<div className="space-y-2 mt-4">


{subjectLessons.map((lesson,index)=>(


<div

key={index}

className="flex justify-between items-center bg-slate-100 rounded-xl px-4 py-3"

>


<span>

{lesson.day} - {lesson.time}

</span>



<button

type="button"

onClick={()=>{

setSubjectLessons(

subjectLessons.filter(
(_,i)=>i!==index
)

);

}}

className="text-red-500 font-bold"

>

Remove

</button>



</div>


))}


</div>


</div>




<input

value={currentMeetLink}

onChange={(e)=>setCurrentMeetLink(e.target.value)}

placeholder="Google Meet Link"

className="w-full rounded-xl border px-5 py-4"

/>



<button

type="button"

onClick={()=>{


if(!currentSubject){

alert("Select subject");

return;

}


if(!currentTutor){

alert("Select tutor");

return;

}



setAssignments([

...assignments,

{

subject_id:currentSubject,

tutor_id:currentTutor,

meet_link:currentMeetLink,

lessons:subjectLessons

}

]);



setCurrentSubject("");

setCurrentTutor("");

setCurrentMeetLink("");

setSubjectLessons([]);


}}


className="rounded-xl bg-yellow-500 px-6 py-3 font-bold"

>

+ Add Subject Lesson

</button>



</div>
<div className="mt-10 rounded-2xl border p-6 space-y-5">

<h2 className="text-xl font-bold">
Added Lesson Assignments
</h2>


{assignments.length === 0 ? (

<p className="text-slate-500">
No lesson schedule added yet.
</p>

) : (


assignments.map((item,index)=>{


const subject = subjects.find(
(s)=>s.id===item.subject_id
);


const tutor = tutors.find(
(t)=>t.id===item.tutor_id
);


return (

<div

key={index}

className="rounded-xl bg-slate-100 p-5 space-y-3"

>


<h3 className="font-bold text-lg">

{subject?.name}

</h3>


<p>

Tutor: {tutor?.full_name}

</p>



<div>

<p className="font-bold">
Lesson Times:
</p>


{item.lessons.map(
(lesson:any,i:number)=>(

<p key={i}>

{lesson.day} - {lesson.time}

</p>

)

)}

</div>



<p>

Meet Link:

{item.meet_link || "Not added"}

</p>



<button

type="button"

onClick={()=>{


setAssignments(

assignments.filter(
(_,i)=>i!==index
)

);


}}

className="text-red-500 font-bold"

>

Remove Lesson

</button>



</div>


)


})

)}


</div>





<div className="mt-10 rounded-2xl border p-6 space-y-5">


<h2 className="text-xl font-bold">
Payment Information
</h2>



<input

type="number"

value={totalFee}

onChange={(e)=>setTotalFee(e.target.value)}

placeholder="Total Fee"

className="w-full rounded-xl border px-5 py-4"

/>



<input

type="number"

value={amountPaid}

onChange={(e)=>setAmountPaid(e.target.value)}

placeholder="Amount Paid"

className="w-full rounded-xl border px-5 py-4"

/>




<input

type="number"

value={outstandingBalance}

onChange={(e)=>setOutstandingBalance(e.target.value)}

placeholder="Outstanding Balance"

className="w-full rounded-xl border px-5 py-4"

/>



<input

type="date"

value={paymentDueDate}

onChange={(e)=>setPaymentDueDate(e.target.value)}

className="w-full rounded-xl border px-5 py-4"

/>


</div>
<div className="mt-10 rounded-2xl border p-6 space-y-5">

<h2 className="text-xl font-bold">
Final Review
</h2>


<div className="rounded-xl bg-slate-100 p-5 space-y-2">

<p>
<strong>Student:</strong> {studentName}
</p>


<p>
<strong>Email:</strong> {email}
</p>


<p>
<strong>Package:</strong> {studentPackage}
</p>


<p>
<strong>Subjects:</strong> {selectedSubjects.length}
</p>


<p>
<strong>Total Fee:</strong> {totalFee}
</p>


<p>
<strong>Amount Paid:</strong> {amountPaid}
</p>


<p>
<strong>Balance:</strong>{" "}
{outstandingBalance || Math.max(Number(totalFee)-Number(amountPaid),0)}

</p>

</div>

</div>
<button

onClick={handleSave}

className="mt-8 w-full rounded-xl bg-yellow-500 px-10 py-4 font-bold text-slate-900 hover:bg-yellow-400"

>

Save Student

</button>


</div>

</div>

);

}
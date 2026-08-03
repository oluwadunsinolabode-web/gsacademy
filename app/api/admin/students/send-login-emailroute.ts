import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


export async function POST(request: Request) {

try {

const body = await request.json();


const {
studentName,
email,
password
} = body;



await resend.emails.send({

from:
"GS Academy <booking@gsacademyhub.com>",


to: email,


subject:
"Your GS Academy Student Portal Login Details",



html: `

<!DOCTYPE html>

<html>

<body
style="
font-family:Arial;
background:#f8fafc;
padding:40px;
">


<div
style="
max-width:600px;
margin:auto;
background:white;
padding:40px;
border-radius:15px;
border:1px solid #e2e8f0;
">


<h1
style="
color:#0f172a;
text-align:center;
">

GS Academy

</h1>


<p>
Grooming Scholars
</p>


<h2>
Welcome ${studentName}
</h2>


<p>
Your Student Portal account has been created successfully.
</p>



<div
style="
background:#fef9c3;
padding:20px;
border-radius:10px;
"
>


<p>
<strong>Email:</strong>
${email}
</p>


<p>
<strong>Temporary Password:</strong>
${password}
</p>


</div>



<a
href="https://gsacademyhub.com/login"

style="
display:inline-block;
margin-top:25px;
background:#facc15;
padding:15px 25px;
border-radius:10px;
font-weight:bold;
color:#0f172a;
text-decoration:none;
"
>

Login To Student Portal

</a>


<p
style="
margin-top:30px;
color:#475569;
"
>

For security, please change your password after your first login.

</p>


<hr/>


<p>
GS Academy Team
</p>


</div>


</body>

</html>

`

});



return Response.json({

success:true

});


}

catch(error){

console.log(error);


return Response.json(
{
success:false,
error:"Email failed"
},
{
status:500
}
);


}


}
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      instructions,
      subject_id,
    } = body;


    if (!title || !instructions || !subject_id) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }


    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();


    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }


    const { data, error } = await supabase
      .from("classwork")
      .insert({
        title,
        instructions,
        subject_id,
        tutor_id: user.id,
      })
      .select()
      .single();


    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }


    return NextResponse.json(
      {
        success: true,
        classwork: data,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      }
    );

  }
}
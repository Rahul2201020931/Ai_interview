"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px] animate-fadeIn">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center animate-slideUp">
          <Image 
            src="/logo.svg" 
            alt="logo" 
            height={32} 
            width={38} 
            className="transition-all duration-300 hover:scale-110"
          />
          <h2 className="text-primary-100 gradient-text">Preply</h2>
        </div>

        <h3 className="gradient-text animate-slideUp">Practice job interviews with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <FormField
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Your Name"
                  type="text"
                />
              </div>
            )}

            <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <FormField
                control={form.control}
                name="email"
                label="Email"
                placeholder="Your email address"
                type="email"
              />
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <FormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <Button className="btn group" type="submit">
                <span className="flex items-center gap-2">
                  {isSignIn ? "Sign In" : "Create an Account"}
                  <svg 
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Button>
            </div>
          </form>
        </Form>

        <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <p className="text-center">
            {isSignIn ? "No account yet?" : "Have an account already?"}
            <Link
              href={!isSignIn ? "/sign-in" : "/sign-up"}
              className="font-bold text-user-primary ml-1 hover:underline transition-all duration-300 hover:scale-105 inline-block"
            >
              {!isSignIn ? "Sign In" : "Sign Up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

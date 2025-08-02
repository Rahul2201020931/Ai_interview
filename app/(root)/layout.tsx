import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      {/* Shooting Stars */}
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      
      <nav className="animate-fadeIn">
        <Link href="/" className="flex items-center gap-2 group hover-lift">
          <Image 
            src="/logo.svg" 
            alt="MockMate Logo" 
            width={38} 
            height={32} 
            className="transition-all duration-300 group-hover:scale-110"
          />
          <h2 className="text-primary-100 gradient-text">Preply</h2>
        </Link>
      </nav>

      <div className="animate-slideUp">
        {children}
      </div>
    </div>
  );
};

export default Layout;

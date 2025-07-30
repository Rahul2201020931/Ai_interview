import { ReactNode } from "react";


const AuthLayout = async ({ children }: { children: ReactNode }) => {
 return (
    <div>  {children}     </div>  
 )
};

export default AuthLayout;
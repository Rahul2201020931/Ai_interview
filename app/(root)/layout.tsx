import { ReactNode } from "react";


const RootLayout = async ({ children }: { children: ReactNode }) => {
 return (
    <div>  {children}     </div>  
 )
};

export default RootLayout;
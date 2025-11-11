import { ReactNode } from "react";

interface LoginContainerProps {
  children: ReactNode;
}

export default function LoginContainer({ children }: LoginContainerProps) {
  return (
    <div className="bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </div>
    </div>
  );
}

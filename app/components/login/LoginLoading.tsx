import LoginContainer from "./LoginContainer";

export default function LoginLoading() {
  return (
    <LoginContainer>
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Loading...
        </p>
      </div>
    </LoginContainer>
  );
}

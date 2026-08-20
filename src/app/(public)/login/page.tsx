import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Login Admin</h1>
        <LoginForm />
      </div>
    </div>
  );
}

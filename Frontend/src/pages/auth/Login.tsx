import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">

      <div className="w-[900px] bg-surface rounded-xl shadow-md grid grid-cols-2 overflow-hidden">

        {/* Left side */}
        <div className="bg-primary flex items-center justify-center text-white p-10">
          <div>
            <h1 className="text-3xl font-bold mb-4">PharmaConnect</h1>
            <p className="opacity-90">
              Connect patients and pharmacies in one platform.
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="p-10">

          <h2 className="text-2xl font-semibold mb-6">Login</h2>

          <form className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-200 rounded-lg p-3"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-200 rounded-lg p-3"
            />

            <button
              className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90"
            >
              Sign in
            </button>

          </form>

          <p className="text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium">
              Register
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}
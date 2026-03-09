import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">

      <div className="w-[900px] bg-surface rounded-xl shadow-md grid grid-cols-2 overflow-hidden">

        <div className="bg-primary flex items-center justify-center text-white p-10">
          <h1 className="text-3xl font-bold">Join PharmaConnect</h1>
        </div>

        <div className="p-10">

          <h2 className="text-2xl font-semibold mb-6">Register</h2>

          <form className="space-y-4">

            <input
              type="text"
              placeholder="Full name"
              className="w-full border border-gray-200 rounded-lg p-3"
            />

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

            <select
              className="w-full border border-gray-200 rounded-lg p-3"
            >
              <option value="client">Client</option>
              <option value="pharmacist">Pharmacist</option>
            </select>

            <button
              className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90"
            >
              Create account
            </button>

          </form>

          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../lib/api";
import { Alert, Button, Card } from "../components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = isRegister
        ? await authAPI.register(form)
        : await authAPI.login({ email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-2">
            <Target className="text-blue-500" size={28} />
            Smart Interview Assistant
          </div>
          <p className="text-gray-400 text-sm">
            AI-powered resume analysis, mock interviews & career guidance
          </p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          {error && <Alert message={error} />}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
            </Button>
          </form>
          <p className="text-sm text-gray-400 mt-4 text-center">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-400 hover:underline"
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}

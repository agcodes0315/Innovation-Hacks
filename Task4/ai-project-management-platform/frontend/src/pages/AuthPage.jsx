import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { useAuth } from "../auth.jsx";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const auth = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) {
        await auth.register(form.name, form.email, form.password);
      } else {
        await auth.login(form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="brand-lockup">
          <div className="brand-mark"><Code2 size={22} /></div>
          <div>
            <strong>DevFlow</strong>
            <span>Productivity OS</span>
          </div>
        </div>

        <div className="auth-message">
          <span className="pill"><Sparkles size={15} /> AI-powered project workspace</span>
          <h1>Plan clearly.<br />Build consistently.</h1>
          <p>
            A complete project and task management workspace with persistent data,
            protected routes and local AI-assisted task planning.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <span className="eyebrow">{isRegister ? "Create workspace" : "Welcome back"}</span>
          <h2>{isRegister ? "Create your DevFlow account" : "Sign in to DevFlow"}</h2>

          {isRegister && (
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Agrima Saxena"
                minLength={2}
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 8 characters"
              minLength={isRegister ? 8 : 1}
              required
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-btn wide" disabled={busy}>
            {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            {!busy && <ArrowRight size={17} />}
          </button>

          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to DevFlow?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create account"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

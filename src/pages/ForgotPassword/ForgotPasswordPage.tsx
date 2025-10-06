import React, { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../constants/api";
import { Toaster, toast } from "sonner";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({ email });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch(
        `${API_BASE_URL}/user/forgot-password`,
        requestOptions
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Ocorreu um erro ao solicitar a redefinição."
        );
      }

      toast.success("Verifique seu e-mail para o link de redefinição.");
      setMessage(
        "Se uma conta com este e-mail existir, um link para redefinir a senha foi enviado."
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <h2>Esqueceu sua senha?</h2>
          <p>
            Digite seu e-mail abaixo e enviaremos um link para você criar uma
            nova senha.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
            </button>
          </form>

          {message && <p className="success-message">{message}</p>}

          <div className="back-to-login">
            <Link to="/login">Voltar para o Login</Link>
          </div>
        </div>
      </div>
      <Toaster theme="dark" />
    </>
  );
}

import React, { useState, FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../constants/api";
import { Toaster, toast } from "sonner";
import "./ResetPasswordPage.css";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({ password });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch(
        `${API_BASE_URL}/user/reset-password/${token}`,
        requestOptions
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Não foi possível redefinir a senha. O token pode ser inválido ou ter expirado."
        );
      }

      toast.success(
        "Senha redefinida com sucesso! Redirecionando para o login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="reset-password-page">
        <div className="reset-password-container">
          <h2>Crie sua Nova Senha</h2>
          <p>Digite e confirme sua nova senha abaixo.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Nova Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirme a Nova Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Redefinir Senha"}
            </button>
          </form>

          <div className="back-to-login">
            <Link to="/login">Voltar para o Login</Link>
          </div>
        </div>
      </div>
      <Toaster theme="dark" />
    </>
  );
}

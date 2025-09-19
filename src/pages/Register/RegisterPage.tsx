import React, { useState, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants/api";
import "./RegisterPage.css";

interface ErrorResponse {
  message: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setError("");

    // 1. Validação do formulário
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!termsAccepted) {
      setError("Você precisa aceitar os termos de privacidade.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Envio para a API
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || "Não foi possível criar a conta.");
      }

      // 3. Sucesso e redirecionamento
      alert("Conta criada com sucesso! Você será redirecionado para o login.");
      navigate("/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado ao criar a conta.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Crie sua Conta no MeOrganiza</h2>
        <p>É rápido e fácil.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="seuemail@exemplo.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="Crie uma senha forte"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirme a Senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Repita a senha"
              required
            />
          </div>
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTermsAccepted(e.target.checked)
              }
            />
            <label htmlFor="terms">
              Eu li e aceito os termos de privacidade.
            </label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        <div className="register-links">
          <span>Já tem uma conta? </span>
          <Link to="/login">Entre aqui</Link>
        </div>
      </div>
    </div>
  );
}

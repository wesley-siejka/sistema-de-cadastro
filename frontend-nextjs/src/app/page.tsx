"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [ping, setPing] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/ping")
      .then((res) => res.json())
      .then((data) => setPing(data.message))
      .catch(() => setPing("Erro ao conectar ao backend"));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-14 max-w-5xl min-h-[400px] w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Bem-vindo(a)!
        </h1>
        <p className="mb-8 text-gray-600 text-center">
          Acesse os módulos do sistema abaixo:
        </p>
        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/clientes"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded text-center font-semibold transition-colors"
          >
            Clientes
          </Link>
          <Link
            href="/produtos"
            className="bg-blue-950 hover:bg-blue-900 text-white py-3 rounded text-center font-semibold transition-colors"
          >
            Produtos
          </Link>
          <Link
            href="/vendas"
            className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded text-center font-semibold transition-colors"
          >
            Vendas
          </Link>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          Backend Go:{" "}
          <span className="font-mono">
            {ping}
          </span>
        </div>
      </div>
    </div>
  );
}

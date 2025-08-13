"use client";
import { useState, useEffect } from "react";

import { IMaskInput } from 'react-imask';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';

// Função para formatar CPF com pontos e traço
function formatarCPF(valor: string) {
	const v = valor.replace(/\D/g, "").slice(0, 11);
	return v.replace(/(\d{3})(\d)/, "$1.$2")
					.replace(/(\d{3})(\d)/, "$1.$2")
					.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function ClientesPage() {
	const [feedbackVisible, setFeedbackVisible] = useState(false);
	const [feedbackMsg, setFeedbackMsg] = useState("");
	const [feedbackType, setFeedbackType] = useState<"success"|"error"|"">("");
	// Feedback message auto-hide
	useEffect(() => {
		if (feedbackMsg) {
			setFeedbackVisible(true);
			const fadeTimer = setTimeout(() => {
				setFeedbackVisible(false);
			}, 3000);
			const removeTimer = setTimeout(() => {
				setFeedbackMsg("");
				setFeedbackType("");
			}, 4000);
			return () => {
				clearTimeout(fadeTimer);
				clearTimeout(removeTimer);
			};
		}
	}, [feedbackMsg]);
	// Função para limpar o formulário de cliente
	const limparFormCliente = () => {
		setNome("");
		setCpf("");
		setCep("");
		setNumero("");
		setTelefone("");
		setEmail("");
		setCidade("");
		setBairro("");
		setErros({});
		setEditClienteId(null);
	};
 const [editClienteId, setEditClienteId] = useState<number | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [nome, setNome] = useState("");
	const [cpf, setCpf] = useState("");
	const [cep, setCep] = useState("");
	const [numero, setNumero] = useState("");
	const [telefone, setTelefone] = useState("");
	const [email, setEmail] = useState("");
	const [cidade, setCidade] = useState("");
	const [bairro, setBairro] = useState("");
		const [erros, setErros] = useState<{ [key: string]: string }>({});
				// ...existing code...
	const [clientes, setClientes] = useState<any[]>([]);
	const [filtro, setFiltro] = useState("");
	const [showFilterMenu, setShowFilterMenu] = useState(false);
	const [ordemCampo, setOrdemCampo] = useState<"nome" | "created_at">("created_at");
	const [ordemDirecao, setOrdemDirecao] = useState<"asc" | "desc">("desc");

	// Estilo global para placeholders
	const placeholderStyle = (
		<style>{`
			input::placeholder, textarea::placeholder {
				color: #6B7280 !important; /* gray-500 do Tailwind, não muito claro */
				opacity: 1;
			}
		`}</style>
	);

	async function fetchClientes() {
		try {
			const res = await fetch("http://localhost:8080/api/clientes");
			let data: any[] = [];
			try {
				data = await res.json();
				if (!Array.isArray(data)) data = [];
			} catch {
				data = [];
			}
			setClientes(data);
		} catch {
			setClientes([]);
		}
	}

	// Funções de máscara e validação
	function formatarCPF(valor: string) {
		const v = valor.replace(/\D/g, "").slice(0, 11);
		return v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
	}
	function formatarCEP(valor: string) {
		const v = valor.replace(/\D/g, "").slice(0, 8);
		return v.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
	}
	function formatarTelefone(valor: string) {
		const v = valor.replace(/\D/g, "").slice(0, 11);
		if (v.length <= 10) {
			return v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
		} else {
			return v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
		}
	}

	useEffect(() => {
		fetchClientes();
	}, []);

	function validarCampos() {
		const novosErros: { [key: string]: string } = {};
		if (!nome.trim()) novosErros.nome = "Nome obrigatório.";
	if (!cpfValidator.isValid(cpf)) novosErros.cpf = "CPF inválido.";
		if (cep.replace(/\D/g, "").length !== 8) novosErros.cep = "CEP deve ter 8 dígitos numéricos.";
		if (!email.match(/^\S+@\S+\.\S+$/)) novosErros.email = "E-mail inválido.";
		if (telefone && telefone.replace(/\D/g, "").length < 10) novosErros.telefone = "Telefone deve ter 10 ou 11 dígitos numéricos.";
		return novosErros;
	}

	async function buscarCep(valor: string) {
		const cepNumeros = valor.replace(/\D/g, "");
		if (cepNumeros.length === 8) {
			try {
				const res = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
				const data = await res.json();
				if (!data.erro) {
					setCidade(data.localidade || "");
					setBairro(data.bairro || "");
				} else {
					setCidade("");
					setBairro("");
				}
			} catch {
				setCidade("");
				setBairro("");
			}
		} else {
			setCidade("");
			setBairro("");
		}
	}

	function handleSubmit(e: React.FormEvent) {
		 e.preventDefault();
		 const novosErros = validarCampos();
		 setErros(novosErros);
		 if (Object.keys(novosErros).length > 0) return;
		 const cpfFormatado = formatarCPF(cpf);
		if (editClienteId === null) {
			// Cadastro novo
			fetch("http://localhost:8080/api/clientes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ nome, cpf: cpfFormatado, cep, numero, bairro, cidade, telefone, email })
			})
				.then(async res => {
					const data = await res.json();
					if (!res.ok) {
						if (data.error && data.error.includes("CPF já cadastrado")) {
							setErros({ cpf: "Este CPF já está cadastrado." });
							return;
						}
						setErros({ geral: data.error || "Erro ao cadastrar cliente." });
						return;
					}
					fetchClientes();
					limparFormCliente();
					setShowModal(false);
					// Não mostrar mensagem de sucesso para cadastro novo
				});
		} else {
			// Alteração
			fetch(`http://localhost:8080/api/clientes/${editClienteId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ nome, cpf: cpfFormatado, cep, numero, bairro, cidade, telefone, email })
			})
				.then(async res => {
					let data = {};
					const text = await res.text();
					if (text) {
						try { data = JSON.parse(text); } catch {}
					}
					if (!res.ok) {
						setErros({ geral: ((data as any).error) || "Erro ao alterar cliente." });
						setShowModal(false);
						setFeedbackMsg(((data as any).error) || "Erro ao alterar cliente.");
						setFeedbackType("error");
						return;
					}
					fetchClientes();
					limparFormCliente();
					setShowModal(false);
					setFeedbackMsg("Cliente alterado com sucesso!");
					setFeedbackType("success");
				});
		}
 const limparFormCliente = () => {
  setNome("");
  setCpf("");
  setCep("");
  setNumero("");
  setTelefone("");
  setEmail("");
  setCidade("");
  setBairro("");
  setErros({});
  setEditClienteId(null);
 };
	}


	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

	async function excluirCliente(id: number) {
		setConfirmDeleteId(id);
	}

	async function confirmarExclusao() {
		if (confirmDeleteId === null) return;
		await fetch(`http://localhost:8080/api/clientes/${confirmDeleteId}`, { method: "DELETE" });
		setClientes(clientes.filter(c => c.id !== confirmDeleteId));
		setConfirmDeleteId(null);
	}

	function cancelarExclusao() {
		setConfirmDeleteId(null);
	}

	// Ordenação e filtro aplicados à lista de clientes
	const clientesFiltrados = clientes
		.filter(c =>
			c.nome.toLowerCase().includes(filtro.toLowerCase()) ||
			c.cpf?.toLowerCase().includes(filtro.toLowerCase()) ||
			c.email?.toLowerCase().includes(filtro.toLowerCase())
		)
		.sort((a, b) => {
			let vA = ordemCampo === "nome" ? a.nome : a.created_at;
			let vB = ordemCampo === "nome" ? b.nome : b.created_at;
			if (!vA) return 1;
			if (!vB) return -1;
			if (ordemCampo === "created_at") {
				vA = new Date(vA).getTime();
				vB = new Date(vB).getTime();
			}
			if (vA < vB) return ordemDirecao === "asc" ? -1 : 1;
			if (vA > vB) return ordemDirecao === "asc" ? 1 : -1;
			return 0;
		});

		return (
					<>
							{feedbackMsg && (
								<div
									className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg font-bold text-center transition-all duration-1000
										${feedbackType === "success" ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}
										${feedbackVisible ? "opacity-100" : "opacity-0"}`}
									style={{ minWidth: 280 }}>
									{feedbackMsg}
									<button className="ml-4 text-xs text-gray-500 hover:text-gray-700 font-bold" onClick={() => { setFeedbackMsg(""); setFeedbackType(""); setFeedbackVisible(false); }}>×</button>
								</div>
							)}
				{placeholderStyle}
				<div className="relative min-h-screen flex flex-col items-center bg-gray-100 pt-6">
			{clientes.length === 0 ? (
				<div className="bg-white rounded-lg shadow-lg p-10 max-w-xl w-full flex flex-col items-center mt-0">
					<h1 className="text-2xl font-bold mb-4 text-gray-800">Clientes</h1>
					<p className="mb-8 text-gray-600 text-center">Gerencie seus clientes cadastrados aqui.</p>
					<span className="text-gray-400 italic">Nenhum cliente cadastrado.</span>
				</div>
			) : (
				<div className="w-full max-w-5xl mt-0">
					<div className="flex flex-row items-start justify-between mb-6 w-full">
						<div>
							<h1 className="text-lg font-bold text-gray-800 mb-1">Clientes</h1>
							<p className="text-sm text-gray-600">Gerencie seus clientes cadastrados aqui.</p>
						</div>
						<div className="flex items-start gap-2">
							<input
								type="text"
								placeholder="Pesquisar cliente..."
								className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-black shadow-sm"
								value={filtro}
								onChange={e => setFiltro(e.target.value)}
							/>
							{/* Botão de filtro/organização */}
							<div className="relative">
								<button
									type="button"
										className="ml-1 bg-white border border-blue-400 text-blue-600 px-3 py-2 rounded-lg font-bold flex items-center hover:bg-blue-50 transition"
									onClick={() => setShowFilterMenu(v => !v)}
									title="Filtrar e organizar"
								>
									<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
								</button>
								{showFilterMenu && (
									<div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
										<div className="mb-3">
											<label className="block text-xs font-bold text-blue-600 mb-1">Ordenar por</label>
											<select
												className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-black"
												value={ordemCampo}
												onChange={e => setOrdemCampo(e.target.value as "nome" | "created_at")}
											>
												<option value="nome" className="text-black">Nome</option>
												<option value="created_at" className="text-black">Data de Cadastro</option>
											</select>
										</div>
										<div className="mb-3">
											<select
												className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-black"
												value={ordemDirecao}
												onChange={e => setOrdemDirecao(e.target.value as "asc" | "desc")}
											>
												<option value="asc" className="text-black">Crescente</option>
												<option value="desc" className="text-black">Decrescente</option>
											</select>
										</div>
										<button
											className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded font-bold"
											onClick={() => setShowFilterMenu(false)}
										>
											Aplicar
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-3">
						{clientesFiltrados.map((c) => (
							 <div key={c.id} className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-row items-center w-full max-w-full px-6 py-4 mx-auto min-h-[80px]">
								 <div className="flex flex-col flex-1 justify-center">
									 <div className="flex flex-wrap gap-x-6 gap-y-1 items-center mb-1">
										 <span className="font-bold text-black text-lg whitespace-nowrap">{c.nome}</span>
										 <span className="text-black text-sm whitespace-nowrap"><b>CPF:</b> {formatarCPF(c.cpf)}</span>
										 <span className="text-black text-sm whitespace-nowrap"><b>Telefone:</b> {c.telefone}</span>
										 <span className="text-black text-sm whitespace-nowrap"><b>E-mail:</b> {c.email}</span>
									 </div>
									 <div className="flex flex-wrap gap-x-6 gap-y-1 items-center">
										 <span className="text-black text-sm whitespace-nowrap"><b>CEP:</b> {c.cep}</span>
										 <span className="text-black text-sm whitespace-nowrap"><b>Cidade:</b> {c.cidade}</span>
										 <span className="text-black text-sm whitespace-nowrap"><b>Bairro:</b> {c.bairro}</span>
										 <span className="text-black text-sm whitespace-nowrap"><b>Número:</b> {c.numero}</span>
										 <span className="text-black text-xs whitespace-nowrap"><b>Cadastrado em:</b> {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</span>
									 </div>
								 </div>
								 <div className="flex flex-col items-center justify-center gap-2 ml-4">
									 <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm font-bold mb-1" onClick={() => {
										 setEditClienteId(c.id);
										 setNome(c.nome || "");
										 setCpf(c.cpf || "");
										 setCep(c.cep || "");
										 setNumero(c.numero || "");
										 setTelefone(c.telefone || "");
										 setEmail(c.email || "");
										 setCidade(c.cidade || "");
										 setBairro(c.bairro || "");
										 setShowModal(true);
									 }}>Alterar</button>
									 <button onClick={() => excluirCliente(c.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm font-bold">Excluir</button>
								 </div>
							 </div>
						))}
					</div>
				</div>
			)}
			{/* Modal de confirmação de exclusão */}
			{confirmDeleteId !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={cancelarExclusao} />
					<div className="relative bg-white rounded-lg shadow-2xl px-8 py-6 w-full max-w-sm mx-4 border-2 border-blue-400 flex flex-col items-center">
						<h2 className="text-xl font-bold mb-4 text-blue-600">Confirmar exclusão</h2>
						<p className="mb-6 text-gray-700 text-center">Tem certeza que deseja excluir este cliente?</p>
						<div className="flex gap-4 mt-2 justify-center">
							<button className="bg-white border border-blue-400 text-blue-600 px-6 py-2 w-32 rounded font-bold" onClick={cancelarExclusao}>Cancelar</button>
							<button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-32 rounded font-bold" onClick={confirmarExclusao}>Excluir</button>
						</div>
					</div>
				</div>
			)}
			 {showModal && (
			 <div className="fixed inset-0 z-50 flex items-center justify-center">
			 {/* Fundo desfocado */}
			 <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowModal(false); limparFormCliente(); }} />
			 {/* Formulário centralizado */}
			 <div className="relative bg-white rounded-lg shadow-2xl px-10 py-6 w-full max-w-xl mx-4 border-2 border-blue-400 mt-12 mb-12">
			 <button
			 className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
			 onClick={() => { setShowModal(false); limparFormCliente(); }}
			 title="Fechar"
			 >
			 ×
			 </button>
			 <h2 className="text-3xl font-bold mb-8 text-blue-600">{editClienteId === null ? "Cadastro de Cliente" : "Alterar Cliente"}</h2>
			 <form onSubmit={handleSubmit} className="space-y-4">
			 <div className="grid grid-cols-2 gap-4">
								<div className="flex flex-col col-span-2">
									<label className="font-bold mb-1 text-blue-600">Nome</label>
									<input className="border-2 border-blue-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black uppercase" value={nome} onChange={e => setNome(e.target.value.toUpperCase())} required placeholder="NOME COMPLETO" />
									{erros.nome && <span className="text-red-500 text-xs mt-1">{erros.nome}</span>}
								</div>
								<div className="flex flex-col">
									<label className="font-bold mb-1 text-blue-600">CPF</label>
									<IMaskInput
										mask="000.000.000-00"
										value={cpf}
										onAccept={(value: any) => setCpf(value)}
										className="border-2 border-blue-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black"
										required
										placeholder="XXX.XXX.XXX-XX"
										inputMode="numeric"
										pattern="[0-9]*"
									/>
									{erros.cpf && <span className="text-red-500 text-xs mt-1">{erros.cpf}</span>}
								</div>
								<div className="flex flex-col">
									<label className="font-bold mb-1 text-blue-600">CEP</label>
									<IMaskInput
										mask="00000-000"
										value={cep}
										onAccept={(value: any) => { setCep(value); buscarCep(value); }}
										className="border-2 border-blue-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black"
										placeholder="XXXXX-XXX"
										inputMode="numeric"
										pattern="[0-9]*"
									/>
									{erros.cep && <span className="text-red-500 text-xs mt-1">{erros.cep}</span>}
								</div>
								<div className="flex flex-col">
									<label className="font-bold mb-1 text-blue-600">Cidade</label>
									<input className="border-2 border-blue-100 rounded px-2 py-1 bg-gray-100 text-black" value={cidade} disabled />
								</div>
								<div className="flex flex-col">
									<label className="font-bold mb-1 text-blue-600">Bairro</label>
									<input className="border-2 border-blue-100 rounded px-2 py-1 bg-gray-100 text-black" value={bairro} disabled />
								</div>
								<div className="flex flex-col">
									<label className="font-bold mb-1 text-blue-600">Nº da casa/apartamento</label>
									<input className="border-2 border-blue-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black" value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ex: 123, 45A, 1002" />
								</div>
								<div className="flex flex-col">
									<label className="font-bold mb-1 text-blue-600">Telefone</label>
									<IMaskInput
										mask={telefone.replace(/\D/g, '').length > 10 ? "(00) 00000-0000" : "(00) 0000-0000"}
										value={telefone}
										onAccept={(value: any) => setTelefone(value)}
										className="border-2 border-blue-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black"
										placeholder="(XX) XXXXX-XXXX"
										inputMode="numeric"
										pattern="[0-9]*"
									/>
									{erros.telefone && <span className="text-red-500 text-xs mt-1">{erros.telefone}</span>}
								</div>
								<div className="flex flex-col col-span-2">
									<label className="font-bold mb-1 text-blue-600">E-mail</label>
									<input type="email" className="border-2 border-blue-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black" value={email} onChange={e => setEmail(e.target.value)} required placeholder="exemplo@email.com" />
									{erros.email && <span className="text-red-500 text-xs mt-1">{erros.email}</span>}
								</div>
							</div>
							{/* Botões */}
							<div className="flex gap-4 mt-8 justify-end">
								 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-bold">{editClienteId === null ? "Confirmar" : "Alterar"}</button>
								<button type="button" className="bg-white border border-blue-400 text-blue-600 px-8 py-2 rounded font-bold" onClick={() => {
									setNome(""); setCpf(""); setCep(""); setNumero(""); setTelefone(""); setEmail(""); setCidade(""); setBairro("");
								}}>Limpar</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Botão flutuante de cadastrar */}
			 {!showModal && (
				 <button
					 className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg px-6 py-4 text-lg font-bold transition-colors z-50"
					 title="Cadastrar novo cliente"
					 onClick={() => setShowModal(true)}
				 >
					 Cadastrar
				 </button>
			 )}
		</div>
		</>
		);
	}

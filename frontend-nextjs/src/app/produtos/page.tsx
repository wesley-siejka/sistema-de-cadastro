"use client";

import { useEffect, useState } from "react";

export default function ProdutosPage() {
	async function excluirProduto(id: number) {
		if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
		try {
			const res = await fetch(`http://localhost:8080/api/produtos/${id}`, { method: "DELETE" });
			if (res.ok) {
				setProdutos(produtos.filter(p => p.id !== id));
			} else {
				alert("Erro ao excluir produto.");
			}
		} catch {
			alert("Erro ao conectar ao backend.");
		}
	}
	const [showProdutoModal, setShowProdutoModal] = useState(false);
	const [showCategoriaModal, setShowCategoriaModal] = useState(false);

	const [editProdutoId, setEditProdutoId] = useState<number | null>(null);
	const [nome, setNome] = useState("");
	const [categoria, setCategoria] = useState(""); // nome da categoria
	const [marca, setMarca] = useState("");
	const [quantidade, setQuantidade] = useState<string | number>("");
	const [preco, setPreco] = useState<string | number>("");
	const [descricao, setDescricao] = useState("");
	const [erros, setErros] = useState<Record<string, string>>({});

	// Estilo global para placeholders
	const placeholderStyle = (
		<style>{`
			input::placeholder, textarea::placeholder {
				color: #6B7280 !important; /* gray-500 do Tailwind, não muito claro */
				opacity: 1;
			}
		`}</style>
	);

	// categorias agora tem id e nome
	const [categorias, setCategorias] = useState<{id:number, nome:string}[]>([]);
	const [novaCategoria, setNovaCategoria] = useState("");

	const [produtos, setProdutos] = useState<any[]>([]);
	const [filtro, setFiltro] = useState("");

	// Carrega categorias e produtos do backend
	useEffect(() => {
		fetch("http://localhost:8080/api/categorias")
			.then((r) => (r.ok ? r.json() : []))
			.then((data) => {
				if (Array.isArray(data)) setCategorias(data);
			})
			.catch(() => {});

		fetch("http://localhost:8080/api/produtos")
			.then((r) => (r.ok ? r.json() : []))
			.then((data) => {
				if (Array.isArray(data)) setProdutos(data);
			})
			.catch(() => {});
	}, []);

	function validar() {
		const e: Record<string, string> = {};
		if (!nome.trim()) e.nome = "Nome obrigatório.";
		if (!categoria.trim()) e.categoria = "Categoria obrigatória.";
		if (!marca.trim()) e.marca = "Marca obrigatória.";
		const q = Number(quantidade);
		if (!Number.isFinite(q) || q < 0) e.quantidade = "Quantidade inválida.";
		const p = Number(preco);
		if (!Number.isFinite(p) || p <= 0) e.preco = "Preço inválido.";
		return e;
	}

	function limparForm() {
		setNome("");
		setCategoria("");
		setMarca("");
		setQuantidade("");
		setPreco("");
		setDescricao("");
		setErros({});
		setEditProdutoId(null);
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		const e2 = validar();
		setErros(e2);
		if (Object.keys(e2).length) return;
		// Buscar o id da categoria selecionada
		const catObj = categorias.find(c => c.nome === categoria);
		if (!catObj) {
			setErros({categoria: "Categoria inválida."});
			return;
		}
		try {
			if (editProdutoId === null) {
				// Cadastro novo
				const res = await fetch("http://localhost:8080/api/produtos", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						nome,
						categoria_id: catObj.id,
						marca,
						quantidade: Number(quantidade),
						preco: Number(preco),
						descricao,
					}),
				});
				if (res.ok) {
					setShowProdutoModal(false);
					limparForm();
					fetch("http://localhost:8080/api/produtos")
						.then((r) => (r.ok ? r.json() : []))
						.then((data) => {
							if (Array.isArray(data)) setProdutos(data);
						});
				} else {
					const erro = await res.json().catch(() => ({}));
					alert(erro.error || "Erro ao cadastrar produto.");
				}
			} else {
				// Alteração
				const res = await fetch(`http://localhost:8080/api/produtos/${editProdutoId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						nome,
						categoria_id: catObj.id,
						marca,
						quantidade: Number(quantidade),
						preco: Number(preco),
						descricao,
					}),
				});
				if (res.ok) {
					setShowProdutoModal(false);
					limparForm();
					fetch("http://localhost:8080/api/produtos")
						.then((r) => (r.ok ? r.json() : []))
						.then((data) => {
							if (Array.isArray(data)) setProdutos(data);
						});
				} else {
					const erro = await res.json().catch(() => ({}));
					alert(erro.error || "Erro ao alterar produto.");
				}
			}
		} catch {
			alert("Erro ao conectar ao backend.");
		}
	}

	async function criarCategoria(e: React.FormEvent) {
		e.preventDefault();
		const nomeCat = novaCategoria.trim();
		if (!nomeCat) return;
		if (categorias.some(c => c.nome === nomeCat)) {
			setCategoria(nomeCat);
			setShowCategoriaModal(false);
			setNovaCategoria("");
			return;
		}
		try {
			const r = await fetch("http://localhost:8080/api/categorias", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ nome: nomeCat }),
			});
			if (r.ok) {
				const nova = await r.json();
				setCategorias((old) => [...old, nova]);
				setCategoria(nova.nome);
				setShowCategoriaModal(false);
				setNovaCategoria("");
			} else {
				const j = await r.json().catch(() => ({}));
				alert(j.error || "Erro ao criar categoria");
			}
		} catch (_) {
			alert("Não foi possível criar a categoria agora.");
		}
	}

	const isEmpty = produtos.length === 0;
	const produtosFiltrados = produtos.filter(
		(p) =>
			p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
			(categorias.find(c => c.id === p.categoria_id)?.nome || "").toLowerCase().includes(filtro.toLowerCase()) ||
			p.marca.toLowerCase().includes(filtro.toLowerCase())
	);

		return (
			<>
				{placeholderStyle}
				<div className="min-h-screen bg-gray-100">
			   <div className="w-full pt-6" style={{marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0}}>
				{!isEmpty && (
					<div className="flex items-start justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
							<p className="text-sm text-gray-600">Gerencie seus produtos cadastrados aqui.</p>
						</div>
						<div className="flex items-center gap-3">
							<input
								value={filtro}
								onChange={(e) => setFiltro(e.target.value)}
								placeholder="Pesquisar produto..."
								className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-black shadow-sm"
							/>
						</div>
					</div>
				)}

				{isEmpty ? (
					<div className="flex flex-col items-center justify-start min-h-[320px] w-full">
						<div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-2xl flex flex-col items-center">
							<h1 className="text-2xl font-bold mb-4 text-gray-800">Produtos</h1>
							<p className="mb-8 text-gray-600 text-center">Gerencie seus produtos cadastrados aqui.</p>
							<span className="text-gray-400 italic">Nenhum produto cadastrado.</span>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center gap-6 w-full">
						{produtosFiltrados.length === 0 ? (
							<div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-2xl flex flex-col items-center">
								<h1 className="text-2xl font-bold mb-4 text-gray-800">Produtos</h1>
								<p className="mb-8 text-gray-600 text-center">Nenhum produto encontrado.</p>
							</div>
						) : (
															 produtosFiltrados.map((p) => (
																								 <div
																									 key={p.id}
																									 className="bg-white rounded-lg shadow-md p-6 mb-4 flex flex-row items-center border border-gray-200"
																									 style={{
																										 width: '100%',
																										 maxWidth: '1400px',
																										 marginLeft: 0,
																										 marginRight: 0,
																										 minHeight: '120px',
																										 height: '110px',
																										 paddingTop: '18px',
																										 paddingBottom: '18px',
																										 display: 'flex',
																										 alignItems: 'center',
																										 justifyContent: 'space-between'
																									 }}
																								 >
																									 <div className="flex flex-col justify-center flex-1">
																										 <div className="flex flex-wrap gap-x-8 gap-y-2 mb-2">
																											 <span className="font-bold text-xl text-gray-800">{p.nome}</span>
																											 <span className="font-bold text-black">Categoria:</span> <span className="text-black mr-6">{categorias.find(c => c.id === p.categoria_id)?.nome || p.categoria_id}</span>
																											 <span className="font-bold text-black">Marca:</span> <span className="text-black mr-6">{p.marca}</span>
																											 <span className="font-bold text-black">Quantidade:</span> <span className="text-black mr-6">{p.quantidade}</span>
																											 <span className="font-bold text-black">Preço:</span> <span className="text-black mr-6">R${p.preco}</span>
																										 </div>
																										 {p.descricao && (
																											 <div className="flex flex-row gap-2 mb-2">
																												 <span className="font-bold text-black">Descrição:</span> <span className="text-black">{p.descricao}</span>
																											 </div>
																										 )}
																									 </div>
																									 <div className="flex flex-col items-center justify-center gap-2 ml-4">
																										 <button className="bg-blue-950 hover:bg-blue-900 text-white px-4 py-1 rounded text-sm font-bold mb-1" onClick={() => {
																											 setEditProdutoId(p.id);
																											 setNome(p.nome || "");
																											 setCategoria(categorias.find(c => c.id === p.categoria_id)?.nome || "");
																											 setMarca(p.marca || "");
																											 setQuantidade(p.quantidade || "");
																											 setPreco(p.preco || "");
																											 setDescricao(p.descricao || "");
																											 setShowProdutoModal(true);
																										 }}>Alterar</button>
																										 <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm font-bold" onClick={() => excluirProduto(p.id)}>Excluir</button>
																									 </div>
																								 </div>
															 ))
						)}
					</div>
				)}
			</div>

			{showProdutoModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					 <div
					 className="absolute inset-0 bg-black/30 backdrop-blur-sm"
					 onClick={() => { setShowProdutoModal(false); limparForm(); }}
					 />
					<div className="relative bg-white rounded-lg shadow-2xl w-full max-w-xl mx-4 border-2 border-blue-900 px-8 py-6">
						 <button
						 className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
						 onClick={() => { setShowProdutoModal(false); limparForm(); }}
						 title="Fechar"
						 >
						 ×
						 </button>
						 <h2 className="text-2xl font-bold mb-4 text-blue-950">{editProdutoId === null ? "Cadastro de Produto" : "Alterar Produto"}</h2>
						<form onSubmit={onSubmit} className="space-y-4">
							<div>
								<label className="font-bold mb-1 text-blue-950 block">Nome do produto</label>
								<input
									className="w-full border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black"
									value={nome}
									onChange={(e) => setNome(e.target.value)}
									required
									placeholder="Ex: Perfume X"
								/>
								{erros.nome && <span className="text-red-500 text-xs mt-1 block">{erros.nome}</span>}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="font-bold text-blue-950 mb-1 block">Categoria</label>
									<div className="flex">
										<select
											className="flex-1 border-2 border-blue-900 rounded-l px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black"
											value={categoria}
											onChange={(e) => setCategoria(e.target.value)}
											required
										>
											<option value="">Selecione...</option>
											{categorias.map((c) => (
												<option key={c.id} value={c.nome}>
													{c.nome}
												</option>
											))}
										</select>
										<button
											type="button"
											className="bg-blue-950 hover:bg-blue-900 text-white px-3 rounded-r text-xs font-bold -ml-1 border-l border-blue-900"
											onClick={() => setShowCategoriaModal(true)}
											title="Adicionar categoria"
										>
											+
										</button>
									</div>
									{erros.categoria && <span className="text-red-500 text-xs mt-1 block">{erros.categoria}</span>}
								</div>

								<div>
									<label className="font-bold mb-1 text-blue-950 block">Marca</label>
									<input
										className="w-full border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black"
										value={marca}
										onChange={(e) => setMarca(e.target.value)}
										required
										placeholder="Ex: Natura"
									/>
									{erros.marca && <span className="text-red-500 text-xs mt-1 block">{erros.marca}</span>}
								</div>

								<div>
									<label className="font-bold mb-1 text-blue-950 block">Quantidade</label>
									<input
										type="number"
										min={0}
										className="w-full border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black"
										value={quantidade}
										onChange={(e) => setQuantidade(e.target.value)}
										required
										placeholder="Ex: 10"
									/>
									{erros.quantidade && <span className="text-red-500 text-xs mt-1 block">{erros.quantidade}</span>}
								</div>

								<div>
									<label className="font-bold mb-1 text-blue-950 block">Preço de venda (R$)</label>
									<input
										type="number"
										min={0}
										step={0.01}
										className="w-full border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black"
										value={preco}
										onChange={(e) => setPreco(e.target.value)}
										required
										placeholder="Ex: 99.90"
									/>
									{erros.preco && <span className="text-red-500 text-xs mt-1 block">{erros.preco}</span>}
								</div>

								<div className="col-span-2">
									<label className="font-bold mb-1 text-blue-950 block">Descrição (opcional)</label>
									<textarea
										className="w-full border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black"
										value={descricao}
										onChange={(e) => setDescricao(e.target.value)}
										placeholder="Detalhes, fragrância, etc."
									/>
								</div>
							</div>

							<div className="flex gap-4 justify-end pt-2">
								 <button type="submit" className="bg-blue-950 hover:bg-blue-900 text-white px-8 py-2 rounded font-bold">
									 {editProdutoId === null ? "Confirmar" : "Alterar"}
								 </button>
								<button
									type="button"
									className="bg-white border border-blue-900 text-blue-950 px-8 py-2 rounded font-bold"
									onClick={limparForm}
								>
									Limpar
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{showCategoriaModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/30 backdrop-blur-sm"
						onClick={() => setShowCategoriaModal(false)}
					/>
					<div className="relative bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 border-2 border-blue-900 px-6 py-4">
						<button
							className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
							onClick={() => setShowCategoriaModal(false)}
							title="Fechar"
						>
							×
						</button>
						<h2 className="text-xl font-bold mb-3 text-blue-950">Nova Categoria</h2>
						<form onSubmit={criarCategoria}>
							<input
								className="w-full border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black mb-3"
								value={novaCategoria}
								onChange={(e) => setNovaCategoria(e.target.value)}
								placeholder="Nome da categoria"
								required
							/>
							<div className="flex justify-end">
								<button type="submit" className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-2 rounded font-bold">
									Criar
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			<button
				className="fixed bottom-8 right-8 bg-blue-950 hover:bg-blue-900 text-white rounded-full shadow-lg px-6 py-4 text-lg font-bold transition-colors z-50"
				title="Cadastrar novo produto"
				onClick={() => setShowProdutoModal(true)}
			>
				Cadastrar
			</button>
		</div>
		</>
		);
	}

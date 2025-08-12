"use client";

import { useState } from "react";

export default function ProdutosPage() {
	const [showModal, setShowModal] = useState(false);
	const [showCategoriaModal, setShowCategoriaModal] = useState(false);
	const [nome, setNome] = useState("");
	const [categoria, setCategoria] = useState("");
	const [novaCategoria, setNovaCategoria] = useState("");
	const [categorias, setCategorias] = useState<string[]>([]);
	const [marca, setMarca] = useState("");
	const [quantidade, setQuantidade] = useState("");
	const [preco, setPreco] = useState("");
	const [descricao, setDescricao] = useState("");
	const [erros, setErros] = useState<{ [key: string]: string }>({});
	const [filtro, setFiltro] = useState("");
	const produtos: any[] = [];

	function validarCampos() {
		const novosErros: { [key: string]: string } = {};
		if (!nome.trim()) novosErros.nome = "Nome obrigatório.";
		if (!categoria.trim()) novosErros.categoria = "Categoria obrigatória.";
		if (!marca.trim()) novosErros.marca = "Marca obrigatória.";
		if (!quantidade || isNaN(Number(quantidade)) || Number(quantidade) < 0) novosErros.quantidade = "Informe uma quantidade válida.";
		if (!preco || isNaN(Number(preco)) || Number(preco) <= 0) novosErros.preco = "Informe um preço válido.";
		return novosErros;
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const novosErros = validarCampos();
		setErros(novosErros);
		if (Object.keys(novosErros).length > 0) return;
		// Aqui você pode enviar os dados para o backend futuramente
		alert(`Produto cadastrado: ${nome} - ${categoria} - ${marca} - ${quantidade} - R$${preco} - ${descricao}`);
		setNome(""); setCategoria(""); setMarca(""); setQuantidade(""); setPreco(""); setDescricao(""); setErros({}); setShowModal(false);
	}

	return (
		<div className="relative min-h-screen flex flex-col items-center bg-gray-100 pt-6">
			{produtos.length === 0 ? (
	<div className="flex flex-col items-center justify-start min-h-[320px] w-full">
		<div className="bg-white rounded-lg shadow-lg p-10 max-w-xl w-full flex flex-col items-center">
			<h1 className="text-2xl font-bold mb-4 text-gray-800">Produtos</h1>
			<p className="mb-8 text-gray-600 text-center">Gerencie seus produtos cadastrados aqui.</p>
			<span className="text-gray-400 italic">Nenhum produto cadastrado.</span>
		</div>
	</div>
) : (
				<div className="w-full max-w-5xl mt-0">
					<div className="flex flex-row items-start justify-between mb-6 w-full">
						<div>
							<h1 className="text-lg font-bold text-gray-800 mb-1">Produtos</h1>
							<p className="text-sm text-gray-600">Gerencie seus produtos cadastrados aqui.</p>
						</div>
						<div className="flex items-start">
							<input
								type="text"
								placeholder="Pesquisar produto..."
								className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-black shadow-sm"
								value={filtro}
								onChange={e => setFiltro(e.target.value)}
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-3">
						{produtos.map((p) => (
							<div key={p.id} className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-row items-center w-full max-w-full px-6 py-4 mx-auto min-h-[80px]">
								<div className="flex flex-col flex-1 justify-center">
									<div className="flex flex-wrap gap-x-6 gap-y-1 items-center mb-1">
										<span className="font-bold text-black text-lg whitespace-nowrap">{p.nome}</span>
										<span className="text-black text-sm whitespace-nowrap"><b>Categoria:</b> {p.categoria}</span>
										<span className="text-black text-sm whitespace-nowrap"><b>Marca:</b> {p.marca}</span>
										<span className="text-black text-sm whitespace-nowrap"><b>Quantidade:</b> {p.quantidade}</span>
										<span className="text-black text-sm whitespace-nowrap"><b>Preço:</b> R${p.preco}</span>
									</div>
									<div className="flex flex-wrap gap-x-6 gap-y-1 items-center">
										<span className="text-black text-sm whitespace-nowrap"><b>Descrição:</b> {p.descricao}</span>
									</div>
								</div>
								<button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold ml-2 self-start">Excluir</button>
							</div>
						))}
					</div>
				</div>
			)}
			{/* Modal de cadastro */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
					<div className="relative bg-white rounded-lg shadow-2xl px-10 py-6 w-full max-w-xl mx-4 border-2 border-blue-900 mt-12 mb-12">
						<button
							className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
							onClick={() => setShowModal(false)}
							title="Fechar"
						>×</button>
						<h2 className="text-3xl font-bold mb-8 text-blue-950">Cadastro de Produto</h2>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="flex flex-col col-span-2">
									<label className="font-bold mb-1 text-blue-950">Nome do produto</label>
									<input className="border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Perfume X" />
									{erros.nome && <span className="text-red-500 text-xs mt-1">{erros.nome}</span>}
								</div>
																								<div className="flex flex-col">
																									<label className="font-bold text-blue-950 mb-1">Categoria</label>
																														<div className="flex items-center w-full">
																															<div className="flex flex-row w-full">
																																<select
																																	className="border-2 border-blue-900 rounded-l px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black w-full"
																																	value={categoria}
																																	onChange={e => setCategoria(e.target.value)}
																																	required
																																	style={{ minWidth: 0 }}
																																>
																																	<option value="">Selecione...</option>
																																	{categorias.map((cat) => (
																																		<option key={cat} value={cat}>{cat}</option>
																																	))}
																																</select>
																																<button
																																	type="button"
																																	className="bg-blue-950 hover:bg-blue-900 text-white px-2 py-1 rounded-r text-xs font-bold -ml-1 border-l border-blue-900"
																																	onClick={() => setShowCategoriaModal(true)}
																																	title="Adicionar categoria"
																																	style={{ height: '38px' }}
																																>+
																																</button>
																															</div>
																														</div>
																									{erros.categoria && <span className="text-red-500 text-xs mt-1">{erros.categoria}</span>}
																								</div>
			{/* Modal para criar nova categoria */}
			{showCategoriaModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCategoriaModal(false)} />
					<div className="relative bg-white rounded-lg shadow-2xl px-8 py-6 w-full max-w-sm mx-4 border-2 border-blue-900">
						<button
							className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
							onClick={() => setShowCategoriaModal(false)}
							title="Fechar"
						>×</button>
						<h2 className="text-xl font-bold mb-4 text-blue-950">Nova Categoria</h2>
						<form onSubmit={e => {
							e.preventDefault();
							if (novaCategoria.trim() && !categorias.includes(novaCategoria.trim())) {
								setCategorias([...categorias, novaCategoria.trim()]);
								setCategoria(novaCategoria.trim());
								setNovaCategoria("");
								setShowCategoriaModal(false);
							}
						}}>
							<input
								className="border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black w-full mb-4"
								value={novaCategoria}
								onChange={e => setNovaCategoria(e.target.value)}
								placeholder="Nome da categoria"
								required
							/>
							<div className="flex justify-end">
								<button type="submit" className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-2 rounded font-bold">Criar</button>
							</div>
						</form>
					</div>
				</div>
			)}
								<div className="flex flex-col">
									<label className="font-bold mb-1 text-blue-950">Marca</label>
									<input className="border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black" value={marca} onChange={e => setMarca(e.target.value)} required placeholder="Ex: Natura" />
									{erros.marca && <span className="text-red-500 text-xs mt-1">{erros.marca}</span>}
								</div>
								<div className="flex flex-col">
									<label className="font-bold mb-1 text-blue-950">Quantidade</label>
									<input type="number" min="0" className="border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black" value={quantidade} onChange={e => setQuantidade(e.target.value)} required placeholder="Ex: 10" />
									{erros.quantidade && <span className="text-red-500 text-xs mt-1">{erros.quantidade}</span>}
								</div>
								<div className="flex flex-col">
									<label className="font-bold mb-1 text-blue-950">Preço de venda (R$)</label>
									<input type="number" min="0" step="0.01" className="border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black" value={preco} onChange={e => setPreco(e.target.value)} required placeholder="Ex: 99.90" />
									{erros.preco && <span className="text-red-500 text-xs mt-1">{erros.preco}</span>}
								</div>
								<div className="flex flex-col col-span-2">
									<label className="font-bold mb-1 text-blue-950">Descrição (opcional)</label>
									<textarea className="border-2 border-blue-900 rounded px-2 py-1 focus:border-blue-950 focus:ring-2 focus:ring-blue-900 text-black" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Detalhes, fragrância, etc." />
								</div>
							</div>
							<div className="flex gap-4 mt-8 justify-end">
								<button type="submit" className="bg-blue-950 hover:bg-blue-900 text-white px-8 py-2 rounded font-bold">Confirmar</button>
								<button type="button" className="bg-white border border-blue-900 text-blue-950 px-8 py-2 rounded font-bold" onClick={() => {
									setNome(""); setCategoria(""); setMarca(""); setQuantidade(""); setPreco(""); setDescricao(""); setErros({});
								}}>Limpar</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Botão flutuante de cadastrar */}
			<button
				className="fixed bottom-8 right-8 bg-blue-950 hover:bg-blue-900 text-white rounded-full shadow-lg px-6 py-4 text-lg font-bold transition-colors z-50"
				title="Cadastrar novo produto"
				onClick={() => setShowModal(true)}
			>
				Cadastrar
			</button>
		</div>
	);
}

import Link from "next/link";

export default function VendasPage() {
	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100">
			<div className="bg-white rounded-lg shadow-lg p-10 max-w-xl w-full flex flex-col items-center">
				<h1 className="text-2xl font-bold mb-4 text-gray-800">Vendas</h1>
				<p className="mb-8 text-gray-600 text-center">Consulte e registre vendas realizadas.</p>
				{/* Aqui pode entrar a listagem de vendas futuramente */}
				<span className="text-gray-400 italic">Nenhuma venda registrada.</span>
			</div>
			{/* Botão flutuante de vender */}
			<button
				className="fixed bottom-8 right-8 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-lg px-6 py-4 text-lg font-bold transition-colors z-50"
				title="Registrar nova venda"
			>
				Vender
			</button>
		</div>
	);
}

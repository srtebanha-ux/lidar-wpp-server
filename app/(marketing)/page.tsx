import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">OrçaGuard</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="#precos" className="text-sm text-gray-600 hover:text-gray-900">Preços</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Entrar</Link>
          <Link href="/signup" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
            Começar grátis
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full mb-6">
          Especializado em obras condominiais SP
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          O perito de obras digital do síndico
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Suba 2 a 5 orçamentos em PDF e receba em minutos uma análise comparativa apontando preços
          fora do mercado, itens faltantes e riscos contratuais.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700">
            Analisar meus orçamentos — R$ 97
          </Link>
          <Link href="#como-funciona" className="text-gray-600 hover:text-gray-900 font-medium">
            Ver como funciona
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">Sem assinatura. Pague só quando precisar.</p>
      </section>

      {/* Social proof */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm mb-6">Motor calibrado com 15+ anos de obras condominiais em SP</p>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-gray-900">61%</div>
              <div className="text-sm text-gray-500">dos síndicos apontam cotações como maior dificuldade¹</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">R$ 97</div>
              <div className="text-sm text-gray-500">vs R$ 1.500–5.000 de um engenheiro avulso</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">~3 min</div>
              <div className="text-sm text-gray-500">para receber a análise completa</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Descreva a obra', desc: 'Tipo de serviço e contexto do condomínio' },
            { step: '2', title: 'Suba os PDFs', desc: 'De 2 a 5 orçamentos recebidos (aceita foto)' },
            { step: '3', title: 'IA analisa', desc: 'Extrai, normaliza e compara tudo item a item' },
            { step: '4', title: 'Baixe o relatório', desc: 'PDF timbrado pronto para assembleia' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step}
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What the report includes */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">O que o relatório inclui</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '📊', title: 'Tabela comparativa item a item', desc: 'Normalizada pela IA mesmo com formatos diferentes' },
              { icon: '🚦', title: 'Semáforo de preços', desc: 'Preço acima E abaixo do mercado são alertados' },
              { icon: '🔴', title: 'Red flags contratuais', desc: 'Entrada abusiva, prazo indefinido, garantia ausente' },
              { icon: '❓', title: 'Perguntas para os fornecedores', desc: 'Copy-paste direto no WhatsApp ou e-mail' },
              { icon: '🏆', title: 'Ranking dos orçamentos', desc: 'Nota objetiva com justificativa técnica' },
              { icon: '📋', title: 'Parecer para assembleia', desc: 'Linguagem leiga pronta para apresentar' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 bg-white rounded-lg border">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Preços</h2>
        <p className="text-center text-gray-500 mb-12">Sem contrato. Cancele quando quiser.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Avulso',
              price: 'R$ 97',
              period: '/ análise',
              desc: 'Para quando precisar',
              features: ['1 análise (até 5 orçamentos)', 'Relatório PDF completo', 'Acesso 90 dias'],
              cta: 'Comprar análise',
              highlight: false,
            },
            {
              name: 'Síndico',
              price: 'R$ 147',
              period: '/ mês',
              desc: 'Para quem analisa todo mês',
              features: ['4 análises/mês', 'Histórico de análises', 'Suporte prioritário'],
              cta: 'Assinar Síndico',
              highlight: true,
            },
            {
              name: 'Administradora',
              price: 'R$ 447',
              period: '/ mês',
              desc: 'Para administradoras',
              features: ['20 análises/mês', 'Multiusuário', 'Logo própria no relatório'],
              cta: 'Falar com a gente',
              highlight: false,
            },
          ].map(({ name, price, period, desc, features, cta, highlight }) => (
            <div key={name} className={`rounded-xl border p-6 ${highlight ? 'border-blue-600 shadow-lg' : ''}`}>
              {highlight && <div className="text-xs text-blue-600 font-semibold mb-2">MAIS POPULAR</div>}
              <h3 className="text-xl font-bold mb-1">{name}</h3>
              <p className="text-sm text-gray-500 mb-4">{desc}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">{price}</span>
                <span className="text-gray-500 text-sm">{period}</span>
              </div>
              <ul className="space-y-2 mb-8">
                {features.map((f) => (
                  <li key={f} className="text-sm flex items-center gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block text-center py-3 rounded-lg font-semibold text-sm ${
                  highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="border-t py-10 px-6 text-center text-xs text-gray-400 max-w-4xl mx-auto">
        <p className="mb-2">
          OrçaGuard é uma ferramenta de apoio à decisão, não um laudo técnico com responsabilidade legal.
          Para obras de alto risco ou valor acima de R$ 500.000, recomenda-se contratar engenheiro responsável técnico.
        </p>
        <p>¹ Censo SíndicoNet. © {new Date().getFullYear()} OrçaGuard. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}

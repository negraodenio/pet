import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Radio,
  CheckCircle2,
  Activity,
  Volume2,
  Stethoscope,
  Smile,
  BedDouble,
  Video,
  Tablet,
  Star,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";

export const metadata = {
  title: "Compawion — Amor, Saúde e Cuidado Inteligente para o seu Pet",
  description:
    "O primeiro ecossistema invisível de saúde para cães e gatos. Tapete inteligente com monitoramento de batimentos e sono, câmeras com IA e assistente veterinário 24/7.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0B10] text-[#E8ECF5] selection:bg-amber-500 selection:text-black font-sans antialiased">
      {/* 1. Global Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0A0B10]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <div className="h-full w-full bg-[#0E1017] rounded-[14px] flex items-center justify-center">
                  <span className="text-xl">🐾</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-white">
                    COMPAWION
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    CARE
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-medium">
                  Cuidado Inteligente para Pets
                </span>
              </div>
            </Link>

            {/* Quick Anchor Links (Desktop) */}
            <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-text-secondary">
              <a href="#tapete" className="hover:text-amber-400 transition-colors">
                O Tapete Inteligente
              </a>
              <a href="#cameras" className="hover:text-amber-400 transition-colors">
                Central de Câmeras
              </a>
              <a href="#ipad" className="hover:text-amber-400 transition-colors">
                Estação iPad
              </a>
              <a href="#planos" className="hover:text-amber-400 transition-colors">
                Planos &amp; Preços
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-text-secondary hover:text-white"
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="text-xs font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-lg shadow-amber-500/20 border-0 rounded-xl px-4 py-2"
                >
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section (Warm, Loving, Ultra-Premium) */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Warm Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-indigo-600/10 blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Heartwarming Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6 animate-fade-in shadow-sm">
            <Heart className="h-4 w-4 text-rose-400 fill-rose-400 animate-pulse" />
            <span>Cuidado e tranquilidade real para quem ama o seu pet como filho</span>
          </div>

          {/* Emotional Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Ele só precisa dormir.
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
              Nós cuidamos do coração e da saúde.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
            <b>Sem coleiras desconfortáveis e sem estresse.</b> O seu companheiro deita
            no tapete ortopédico com sensores invisíveis que acompanham batimentos cardíacos,
            respiração, peso e sono — avisando você e o veterinário antes que qualquer
            problema se torne grave.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-sm font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-xl shadow-amber-500/25 border-0 rounded-2xl gap-2"
              >
                Garantir Meu Acesso com Desconto <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-sm font-semibold border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-2xl gap-2"
              >
                Ver Central Interativa ao Vivo
              </Button>
            </Link>
          </div>

          {/* Social Proof Strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted font-medium mb-16">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-white font-bold">4.9/5</span>
              <span>Avaliação de Tutores</span>
            </div>
            <span className="hidden sm:inline text-white/20">&bull;</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>100% Livre de Coleiras Invasivas</span>
            </div>
            <span className="hidden sm:inline text-white/20">&bull;</span>
            <div className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-indigo-400" />
              <span>Relatórios Prontos para o Veterinário</span>
            </div>
          </div>

          {/* Hero Visual Showcase — The Real Sleeping Dog on Smart Bed with Glassmorphic Telemetry HUD */}
          <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 max-w-5xl mx-auto group">
            {/* The Generated High-End Photo */}
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              <Image
                src="/images/smart-bed-hero.jpg"
                alt="Golden retriever dormindo tranquilamente no tapete inteligente Compawion"
                fill
                priority
                className="object-cover group-hover:scale-[1.01] transition-transform duration-700"
              />
              {/* Subtle gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Floating Glassmorphic Telemetry Cards Over the Image */}
            <div className="absolute bottom-4 sm:bottom-8 inset-x-4 sm:inset-x-8 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
              {/* Card 1: Heart Rate */}
              <div className="glass-panel p-3.5 sm:p-4 border-amber-500/30 bg-[#0E1017]/80 backdrop-blur-xl flex items-center gap-3 w-full sm:w-auto text-left shadow-xl animate-fade-in">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Activity className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-amber-300 font-bold">
                    Batimento Cardíaco (BCG)
                  </div>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                    74 <span className="text-xs font-normal text-text-muted">BPM</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-sans font-bold">
                      Calmo
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Respiration Rate */}
              <div className="glass-panel p-3.5 sm:p-4 border-rose-500/30 bg-[#0E1017]/80 backdrop-blur-xl flex items-center gap-3 w-full sm:w-auto text-left shadow-xl animate-fade-in">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-rose-300 font-bold">
                    Frequência Respiratória
                  </div>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                    18 <span className="text-xs font-normal text-text-muted">RPM</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-sans font-bold">
                      Sono REM
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Continuous Weight Scale */}
              <div className="glass-panel p-3.5 sm:p-4 border-indigo-500/30 bg-[#0E1017]/80 backdrop-blur-xl flex items-center gap-3 w-full sm:w-auto text-left shadow-xl animate-fade-in">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-indigo-300 font-bold">
                    Pesagem Automática
                  </div>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                    28,4 <span className="text-xs font-normal text-text-muted">kg</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-sans font-bold">
                      Peso Ideal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 3 Core Pillars of Compawion (How the System Works) */}
      <section id="tapete" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0E1017]/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" className="mb-3">
              O Ecossistema Completo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Hardware invisível na sua casa.
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                Toda a saúde do seu pet na palma da mão.
              </span>
            </h2>
            <p className="text-sm text-text-secondary mt-3">
              Desenvolvemos três elementos que se conectam em segundos para criar a
              rede de proteção mais avançada do mundo para animais de companhia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1: Smart Mat */}
            <div className="glass-panel p-6 border-amber-500/20 hover:border-amber-500/40 transition-all rounded-3xl flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit mb-5">
                  <BedDouble className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  1. O Tapete Inteligente (Smart Bed)
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Caminha ortopédica com capa lavável e <b>sensores piezoelétricos invisíveis</b>.
                  Captura micro-movimentos cardíacos e respiratórios sem que o animal
                  precise usar nada no corpo.
                </p>
                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    Batimentos e respiração durante o sono
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    Células de carga para pesagem diária
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    Cabo magnético ultra seguro anti-tropeço
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-white/5 mt-6">
                <span className="text-[11px] font-mono text-amber-300">
                  Zero wearable &bull; Conforto ortopédico
                </span>
              </div>
            </div>

            {/* Pillar 2: CCTV Cameras with AI */}
            <div id="cameras" className="glass-panel p-6 border-indigo-500/20 hover:border-indigo-500/40 transition-all rounded-3xl flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 w-fit mb-5">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  2. Câmeras Wi-Fi com IA Clínica
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Compatível com câmeras acessíveis de mercado (como a <b>TP-Link Tapo</b> de ~20€).
                  A nossa IA filtra vento e sombras para alertar apenas eventos reais:
                  vômitos, tosse, apatia ou ansiedade.
                </p>
                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    Detecção de vômitos, tosse e dor
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    Central de CFTV com visão multi-cômodos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    Giro motorizado PTZ e microfone para falar
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-white/5 mt-6">
                <span className="text-[11px] font-mono text-indigo-300">
                  Plug &amp; Play &bull; Alertas sem falsos positivos
                </span>
              </div>
            </div>

            {/* Pillar 3: iPad Station & AI Vet */}
            <div id="ipad" className="glass-panel p-6 border-rose-500/20 hover:border-rose-500/40 transition-all rounded-3xl flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mb-5">
                  <Tablet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  3. Estação iPad &amp; Assistente IA 24/7
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Coloque um iPad na sala ou cozinha como central interativa. Ele
                  toca áudio calmante de 432 Hz se o cão chorar e conta com o <b>Claude 5.5</b> para
                  esclarecer dúvidas de saúde a qualquer hora.
                </p>
                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
                    Músicas calmantes automáticas anti-ansiedade
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
                    Chat veterinário embasado nos dados do pet
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
                    Histórico médico exportável em 1 clique
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-white/5 mt-6">
                <span className="text-[11px] font-mono text-rose-300">
                  Acalma o pet sozinho &bull; Apoio veterinário
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Lifestyle Feature Showcase — iPad Station on Counter with Happy Dog */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>A Central Fixa da sua Casa</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Transforme o seu iPad na central que acompanha o seu pet o dia todo.
            </h2>

            <p className="text-sm text-text-secondary leading-relaxed">
              Deixe um iPad antigo ou novo num suporte na cozinha ou sala. O Compawion
              funciona como um monitor inteligente sempre ligado: exibe a saúde do animal,
              permite falar com ele com um toque e até usa a câmera frontal para
              reconhecer quando ele se aproxima do bebedouro.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Protocolo Acústico de Conforto</h4>
                  <p className="text-[11px] text-text-muted">
                    Se o cão latir para a porta ou demonstrar ansiedade, a estação reproduz
                    automaticamente um áudio de 432 Hz ou a sua voz gravada para acalmá-lo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Relatório Completo para a Consulta</h4>
                  <p className="text-[11px] text-text-muted">
                    Chega de tentar lembrar: &ldquo;ele começou a mancar na terça ou quarta?&rdquo;.
                    O app gera um prontuário médico cronológico com gráficos de batimentos e vídeos das alterações.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Showcase */}
          <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 aspect-[4/3] bg-slate-900 group">
            <Image
              src="/images/tablet-station.jpg"
              alt="Estação iPad na cozinha mostrando o aplicativo Compawion com cão feliz ao lado"
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-[#0E1017]/80 backdrop-blur-md border border-white/10 text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                Modo Quiosque Ativo &bull; Estação Cozinha
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Transmissão local em tempo real sem atrasos.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Emotional Peace of Mind Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-[#0E1017]/40">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 aspect-[4/3] bg-slate-900 group order-2 lg:order-1">
            <Image
              src="/images/peace-of-mind.jpg"
              alt="Tutora sorrindo acariciando cachorro e gato dormindo com paz de espírito"
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-[#0E1017]/80 backdrop-blur-md border border-white/10 text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />
                Mais tempo com quem você mais ama
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Diagnósticos precoces aumentam a expectativa de vida do animal em até 3 anos.
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-6 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              <Smile className="h-3.5 w-3.5 text-rose-400" />
              <span>Amor sem Culpa</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Você nunca mais vai sair de casa com o aperto de não saber se ele está bem.
            </h2>

            <p className="text-sm text-text-secondary leading-relaxed">
              Animais de estimação têm o instinto biológico de esconder a dor. Quando
              percebemos que eles estão doentes, muitas vezes o quadro já avançou.
            </p>

            <p className="text-sm text-text-secondary leading-relaxed">
              O Compawion monitora as mudanças sutis que os olhos humanos não conseguem
              ver: micro-alterações no sono, pequenos aumentos na frequência respiratória
              e quedas de peso graduais. É a certeza de que você está oferecendo o melhor
              cuidado possível.
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
              &ldquo;Como tutora de um Golden com problema cardíaco, poder olhar no telemóvel
              e ver que a respiração dele dormindo está normal me devolveu as noites de sono.&rdquo;
              <div className="text-[11px] font-bold text-white mt-1.5">
                — Maria C., Tutora do Bento (Lisboa, PT)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing & Pre-Order Kits */}
      <section id="planos" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <Badge variant="primary" className="mb-3">
          Planos e Kits
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Escolha como quer começar a cuidar do seu pet.
        </h2>
        <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto">
          Sem contratos de fidelidade. Cancele quando quiser.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-14 text-left">
          {/* Card 1: App Only */}
          <div className="glass-panel p-8 rounded-3xl border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Plano Digital &bull; Use seus Aparelhos
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Compawion Care</h3>
              <p className="text-xs text-text-secondary mb-6">
                Para quem já tem um iPad ou câmeras Wi-Fi compatíveis (Tapo, Reolink, etc.) em casa.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">€ 9,90</span>
                <span className="text-xs text-text-muted">/ mês</span>
              </div>

              <ul className="space-y-3 text-xs text-text-secondary mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Acesso ilimitado ao app e central CFTV
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  IA para até 3 câmeras Wi-Fi simultâneas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Assistente Veterinário Claude 5.5 Sonnet 24/7
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Exportação de relatórios clínicos para o veterinário
                </li>
              </ul>
            </div>

            <Link href="/register" className="w-full">
              <Button variant="outline" className="w-full h-12 text-xs font-bold rounded-xl border-white/20 hover:border-white/40">
                Iniciar Teste de 14 Dias Grátis
              </Button>
            </Link>
          </div>

          {/* Card 2: Complete Hardware Kit (Highlight) */}
          <div className="glass-panel p-8 rounded-3xl border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[#0E1017] to-[#0E1017] shadow-2xl shadow-amber-500/10 relative flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
              Mais Vendido &bull; Edição Especial
            </div>

            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                Kit Físico Completo + 3 Meses Grátis
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Kit Guardião Smart Bed</h3>
              <p className="text-xs text-text-secondary mb-6">
                Receba o Tapete Inteligente Ortopédico montado na sua porta + Câmera Wi-Fi de alta definição.
              </p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white">€ 89,00</span>
                <span className="text-xs text-text-muted">taxa única do hardware</span>
              </div>
              <p className="text-[11px] text-amber-300 font-medium mb-6">
                Inclui 3 meses de assinatura do app grátis (depois € 9,90/mês)
              </p>

              <ul className="space-y-3 text-xs text-text-secondary mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  <b>1x Tapete Inteligente Ortopédico</b> (com capa lavável)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  <b>Sensores BCG</b> de batimentos, respiração e peso
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  <b>Cabo magnético anti-acidente</b> com desengate rápido
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  Garantia de 3 anos europeia e entrega em 48h (PT/ES)
                </li>
              </ul>
            </div>

            <Link href="/register" className="w-full">
              <Button className="w-full h-12 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-lg shadow-amber-500/25 border-0">
                Reservar Meu Kit Guardião
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-white/10 py-12 px-4 bg-[#08090D] text-xs text-text-muted">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-lg">🐾</span>
            <span className="font-extrabold text-white tracking-wide">
              COMPAWION CARE
            </span>
            <span className="text-white/20">&bull;</span>
            <span>A Inteligência Invisível que Protege o seu Pet</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#tapete" className="hover:text-white transition-colors">
              O Tapete
            </a>
            <a href="#cameras" className="hover:text-white transition-colors">
              Câmeras
            </a>
            <a href="#ipad" className="hover:text-white transition-colors">
              iPad
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Área do Tutor
            </Link>
          </div>

          <p className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} Compawion OS. Feito com amor para pets em Portugal e Europa.
          </p>
        </div>
      </footer>
    </div>
  );
}

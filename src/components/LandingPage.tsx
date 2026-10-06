import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  HardHat,
  Cpu,
  Mic,
  FileText,
  ShieldCheck,
  Cloud,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { UserRole } from '../types';

export const LandingPage: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Editor');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Por favor, preencha o e-mail e a senha.');
        }
        await loginWithEmail(email, password);
      } else if (mode === 'register') {
        if (!email || !password || !name) {
          throw new Error('Por favor, preencha todos os campos obrigatórios.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve conter no mínimo 6 caracteres.');
        }
        await registerWithEmail(email, password, name, role);
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Informe seu e-mail para recuperação de senha.');
        }
        await resetPassword(email);
        setSuccessMessage('E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
        setMode('login');
      }
    } catch (err: any) {
      console.error(err);
      const raw = err?.message || String(err);
      let msg = raw;
      if (raw.includes('auth/operation-not-allowed') || raw.includes('operation-not-allowed')) {
        msg = 'O provedor E-mail e Senha ainda está sendo propagado no Firebase. Você também pode entrar diretamente clicando no botão "Entrar com Google" logo abaixo!';
      } else if (raw.includes('auth/invalid-credential') || raw.includes('auth/user-not-found') || raw.includes('auth/wrong-password')) {
        msg = 'E-mail ou senha incorretos. Por favor, verifique suas credenciais ou clique em "Esqueci minha senha".';
      } else if (raw.includes('auth/email-already-in-use')) {
        msg = 'Este e-mail já está cadastrado. Utilize a aba "Entrar" com sua senha ou recupere a senha.';
      } else if (raw.includes('auth/weak-password')) {
        msg = 'Senha muito fraca. Utilize pelo menos 6 caracteres.';
      } else if (raw.includes('auth/invalid-email')) {
        msg = 'O formato de e-mail informado é inválido.';
      } else if (raw.includes('Firebase: Error')) {
        msg = raw.replace('Firebase: Error ', '').replace(/\(auth\/[^)]+\)\.?/, '').trim() || 'Erro de autenticação.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (!err?.message?.includes('popup-closed-by-user')) {
        setErrorMessage('Falha ao autenticar com o Google. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-amber-500 p-0.5 shadow-lg shadow-blue-900/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HardHat className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                RDO <span className="text-blue-400 font-extrabold">Inteligente</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Engenharia Civil e IA</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Acesso Protegido e Criptografado
            </span>
          </div>
        </div>
      </header>

      {/* Main Content: Split Hero e Login Panel */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        {/* Left Side: Value Proposition e Brand context */}
        <div className="flex-1 space-y-6 text-center lg:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <HardHat className="w-3.5 h-3.5 text-amber-400" /> Diários de Obra com Inteligência Artificial
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Gestão inteligente do dia a dia da <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">sua obra</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Elimine planilhas manuais e o retrabalho no canteiro. Grave relatos por voz diretamente do celular, deixe a inteligência artificial estruturar os dados do RDO e emita relatórios fotográficos profissionais em PDF.
          </p>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100">Gravação por Voz e IA</h4>
                <p className="text-[11px] text-slate-400">Transforme relatos falados no canteiro em campos estruturados com revisão humana.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100">PDF Oficial de Engenharia</h4>
                <p className="text-[11px] text-slate-400">Emita relatórios completos com ART/CREA, efetivo, máquinas, materiais e assinaturas.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100">Google Drive e Nuvem</h4>
                <p className="text-[11px] text-slate-400">Pastas automáticas organizadas por Obra, RDOs, Fotos e Documentos técnicos.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100">Perfis de Acesso (RBAC)</h4>
                <p className="text-[11px] text-slate-400">Controle rigoroso entre Editores (engenheiros de campo) e Visualizadores (fiscais e clientes).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="w-full max-w-md">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative backdrop-blur-xl">
            {/* Top Auth Mode Tabs */}
            {mode !== 'forgot' ? (
              <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Criar Conta
                </button>
              </div>
            ) : (
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" /> Recuperar Senha
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Voltar ao login
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
                {(errorMessage.includes('Google') || errorMessage.includes('operation-not-allowed')) && (
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="py-2 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950/40"
                  >
                    <span>Entrar agora com Google</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Nome Completo</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Eng. Larissa Freitas"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Perfil de Acesso Inicial</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('Editor')}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                          role === 'Editor'
                            ? 'bg-blue-950/80 border-blue-500 text-blue-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <p className="font-semibold text-slate-100">Editor</p>
                        <p className="text-[10px] text-slate-400">Cria, edita e finaliza RDOs</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('Visualizador')}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                          role === 'Visualizador'
                            ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <p className="font-semibold text-slate-100">Visualizador</p>
                        <p className="text-[10px] text-slate-400">Somente consulta e relatórios</p>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engenheiro@obra.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">Senha</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMessage(null);
                        }}
                        className="text-[11px] text-blue-400 hover:text-blue-300"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                      title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' && 'Entrar no Sistema'}
                    {mode === 'register' && 'Concluir Cadastro'}
                    {mode === 'forgot' && 'Enviar link de recuperação'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {mode !== 'forgot' && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Ou continue com</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Entrar com Google</span>
                </button>
              </>
            )}
          </div>

          {/* Security footnote */}
          <p className="mt-4 text-center text-[11px] text-slate-500">
            Acesso estritamente restrito a colaboradores autorizados da engenharia.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>RDO Inteligente © {new Date().getFullYear()} • Plataforma Tecnológica para Engenharia Civil</p>
      </footer>
    </div>
  );
};

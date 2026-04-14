import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, User, FileText, BookOpen, HelpCircle, Settings, 
  LogOut, Bell, Plus, ChevronRight, Check, X, Clock, Shield,
  Users, Zap, Search, Monitor, History,
  Lock, ChevronDown, Play, Star, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
type Page = 'landing' | 'login' | 'dashboard' | 'whitelist' | 'profile' | 'applications' | 'rules';
type QuizState = 'intro' | 'quiz' | 'completed';

// Quiz Questions (50 questions like in the video)
const quizQuestions = [
  { id: 1, category: 'REGLAS DEL SERVIDOR', question: 'Un jugador usa un bug para duplicar dinero. ¿Qué infracción está cometiendo?', options: ['Abuso de bug y puede ser expulsado.', 'Nada, es parte del juego.', 'Solo es ilegal si afecta a otros jugadores.', 'Es legal si no se detecta.'], correct: 0 },
  { id: 2, category: 'NORMATIVAS GENERAL', question: 'Un jugador es detenido por un policía y se niega al derecho a un abogado. ¿Qué está haciendo mal?', options: ['Nada, es su derecho.', 'Violación del cambio a defensa.', 'Es legal si nadie se da cuenta.', 'Debe esperar al detenido o tener permiso.'], correct: 1 },
  { id: 3, category: 'NORMATIVAS GENERAL', question: 'Un usuario decide cambiar de EMS y llegas a una escena de tiroteo activo. ¿Qué haces?', options: ['Negarte a entrar y volver a la base', 'Entrar rápidamente para salvar a los heridos', 'Entrar solo si conoces a la persona herida', 'Esperar a que la policía declare el área segura'], correct: 3 },
  { id: 4, category: 'NORMATIVAS GENERAL', question: 'Durante un robo a tienda, un criminal pide que dejes de rolear para salir del juego. ¿Cómo deberías reaccionar?', options: ['Si necesitas ir, hazlo.', 'Ignorarlo y seguir con el rol completo y justificado.', 'Levantar las manos y cooperar.', 'Nada, puede cambiar cuando quiera.'], correct: 1 },
  { id: 5, category: 'NORMATIVAS GENERAL', question: 'Un usuario intenta grabar una conversación sin reacción a un usuario. ¿Es correcto?', options: ['No, a menos que se trate de una situación de vida o muerte.', 'Siempre está permitido.', 'La policía puede usarlo para uso personal.', 'No hay opciones para transmitir.'], correct: 0 },
  { id: 6, category: 'NORMATIVAS GENERAL', question: 'Estás siendo detenido por la policía y no hay abogados disponibles. ¿Qué ocurre?', options: ['Te liberarán por falta de abogado', 'La policía debe esperar hasta que llegue un abogado', 'Pueden aplicarte la pena máxima', 'Te procesan aplicando la pena mínima'], correct: 3 },
  { id: 7, category: 'NORMATIVAS GENERAL', question: 'Tu personaje ha sido abatido en un tiroteo y reaparece en el hospital. ¿Qué información puedes compartir con tus amigos?', options: ['Todo lo que recuerdas antes de ser abatido', 'Nada, ya que olvidas lo que te llevó al hospital', 'Solo el nombre de quien te disparó', 'La ubicación del tiroteo'], correct: 1 },
  { id: 8, category: 'NORMATIVAS GENERAL', question: 'Un policía te dice algo por el chat de radio privado del policía. ¿Qué deberías inferir?', options: ['Pelear eficientemente', 'Amenazaron con armas fuera del juego', 'Negociación con el policía', 'Nada, no lo escuchaste'], correct: 3 },
  { id: 9, category: 'REGLAS DEL SERVIDOR', question: 'Un oficial de policía da una orden y tú como secuestrador decides no obedecer. ¿Cuándo puedes desobedecer?', options: ['Cuando estás seguro de que puedes vencerlo', 'Nunca, siempre debes obedecer en esta situación', 'Inmediatamente, para demostrar valor', 'Solo si hay una distracción que lo desoriente'], correct: 1 },
  { id: 10, category: 'CONCEPTOS BÁSICOS DE ROLEPLAY', question: 'Tu personaje ha sido secuestrado y los secuestradores te permiten hablar con la policía. ¿Qué deberías hacer?', options: ['Llamar a tus amigos para que te rescateen', 'Intentar escapar mientras hablas', 'Cooperar con los secuestradores y no dar pistas', 'Dar pistas a la policía para que te rescateen'], correct: 2 },
  { id: 11, category: 'REGLAS DEL SERVIDOR', question: 'Un jugador te insulta gravemente durante un rol. ¿Cuál es tu mejor respuesta?', options: ['Mantener la calma y reportar al jugador', 'Ignorarlo y seguir con el rol', 'Responder con más insultos para defenderte', 'Desconectarte para evitar conflictos'], correct: 0 },
  { id: 12, category: 'NORMATIVAS GENERAL', question: 'Un usuario te ofrece venderte armas por fuera del juego. ¿Qué deberías hacer?', options: ['Negociar un mejor precio', 'Ignorar la oferta y seguir jugando', 'Rechazar la oferta y reportarlo al staff', 'Aceptar la oferta y comprar las armas'], correct: 2 },
  { id: 13, category: 'NORMATIVAS GENERAL', question: 'Un jugador roba un coche patrulla para hacerse pasar por policía. ¿Cuándo es esto permitido?', options: ['Si está desbloqueado', 'Solo las mafias pueden evitar vehículos oficiales con autorización', 'No, está prohibido para civiles', 'Nada, el modo que policía es perfecto para escapar'], correct: 2 },
  { id: 14, category: 'NORMATIVAS GENERAL', question: 'Mientras trabajas de EMS, decides usar un vehículo de emergencia. ¿Qué infracciones considerarías?', options: ['Puede estar bloqueado', 'Sí, si es una emergencia real', 'No, está prohibido para civiles', 'Nada, el modo que policía es perfecto para escapar'], correct: 1 },
  { id: 15, category: 'NORMATIVAS GENERAL', question: 'Un usuario juega con una banda que ofrece duplicar objetos del juego. ¿Qué deberías hacer?', options: ['Contárselo a tus amigos para que lo usen', 'Reportarlo al staff inmediatamente', 'Rechazar la oferta por lealtad', 'Aceptar inmediatamente sin pensar'], correct: 1 },
  { id: 16, category: 'NORMATIVAS GENERAL', question: 'Durante una persecución, decides usar un vehículo deportivo de policía escalar una montaña. ¿Qué deberías hacer?', options: ['Pedir autorización', 'Ignorar y seguir con el rol completo y justificado.', 'Levantar las manos y cooperar.', 'Nada, puede cambiar cuando quiera.'], correct: 1 },
  { id: 17, category: 'NORMATIVAS GENERAL', question: 'Un jugador decide no reportar un bug que descubrió. ¿Qué está haciendo mal?', options: ['Solo es ilegal si el bug afecta a otros.', 'Puede ser sancionado por no reportar el bug.', 'Es legal si no usa el bug.', 'Nada, no es su responsabilidad.'], correct: 1 },
  { id: 18, category: 'CONCEPTOS BÁSICOS DE ROLEPLAY', question: 'Un usuario te pide ayuda OOC para encontrar un objeto en el juego. ¿Qué deberías hacer?', options: ['Ofrecer ayuda IC para mantener el rol', 'Ignorarlo completamente', 'Ayudarlo inmediatamente para ser amable', 'Decirle que busque información por sí mismo'], correct: 0 },
  { id: 19, category: 'REGLAS DEL SERVIDOR', question: 'Un jugador en Discord te dice que hay OOC. ¿Cómo deberías reaccionar?', options: ['Ignorarlo y reportarlo al staff', 'Desconectarte del servidor', 'Si, entrar staff antes de desconectarte', 'Iniciar una discusión con él'], correct: 0 },
  { id: 20, category: 'NORMATIVAS GENERAL', question: 'Un jugador roba un coche patrulla y lo usa para atropellar a un grupo de personas de forma intencional. ¿Qué deberías hacer?', options: ['Devolver el coche sin violencia', 'Guardarlo dentro del hospital', 'Reportarlo como bug a la administración', 'Esperar que salga del hospital para confrontarlo'], correct: 2 },
  { id: 21, category: 'NORMATIVAS GENERAL', question: 'Ves a alguien en el hospital por error. ¿Qué no deberías hacer?', options: ['Hablar con él sin violencia', 'Guardarlo dentro del hospital', 'Reportarlo como bug a la administración', 'Esperar que salga del hospital para confrontarlo'], correct: 1 },
  { id: 22, category: 'NORMATIVAS GENERAL', question: 'Un usuario te amenaza con un arma pero parece dudar. ¿Cuándo puedes intentar desarmarlo?', options: ['Cuando estás seguro y puedes vencerlo', 'Nunca, siempre debes obedecer', 'Inmediatamente, para demostrar valor', 'Solo si hay una distracción'], correct: 0 },
  { id: 23, category: 'NORMATIVAS GENERAL', question: 'Un jugador te ofrece dinero real por objetos del juego. ¿Qué deberías hacer?', options: ['Negociar un mejor precio', 'Ignorar la oferta y seguir jugando', 'Rechazar la oferta y reportarlo al staff', 'Aceptar la oferta'], correct: 2 },
  { id: 24, category: 'NORMATIVAS GENERAL', question: 'Durante un tiroteo, tu personaje queda sin balas. ¿Qué deberías hacer?', options: ['Renderte inmediatamente', 'Buscar cobertura y esperar refuerzos', 'Seguir disparando sin balas', 'Desconectarte para evitar morir'], correct: 1 },
  { id: 25, category: 'NORMATIVAS GENERAL', question: 'Un usuario decide usar vehículos de emergencia. ¿Qué infracciones considerarías?', options: ['Puede estar bloqueado', 'Sí, si es una emergencia real', 'No, está prohibido para civiles', 'Nada, el modo que policía es perfecto para escapar'], correct: 1 },
  { id: 26, category: 'NORMATIVAS GENERAL', question: 'Eres parte de una banda y te ofrecen dinero para unirte a otra organización. ¿Qué deberías hacer?', options: ['Informar a tu líder actual antes de decidir', 'Usar el bug para ganar dinero', 'Rechazar inmediatamente sin pensar', 'Negociar los términos y condiciones'], correct: 0 },
  { id: 27, category: 'REGLAS DEL SERVIDOR', question: 'Mientras juegas, descubres un bug que te permite farmear dinero rápidamente. ¿Qué deberías hacer?', options: ['Contárselo a tus amigos para que lo usen', 'Reportarlo al staff inmediatamente', 'Usarlo pero sin abusar para no ser detectado', 'Aprovecharlo para ganar el máximo posible'], correct: 1 },
  { id: 28, category: 'CONCEPTOS BÁSICOS DE ROLEPLAY', question: 'Encuentras un error en el servidor que duplica objetos del juego. ¿Qué deberías hacer?', options: ['Informar a tu líder actual antes de decidir', 'Reportarlo al staff inmediatamente', 'Rechazar inmediatamente sin pensar', 'Negociar los términos y condiciones'], correct: 1 },
  { id: 29, category: 'NORMATIVAS GENERAL', question: 'Un usuario te ataca sin razón en una zona segura. ¿Qué deberías hacer?', options: ['Atacarlo de vuelta para defenderte', 'Ignorarlo y seguir con tu rol', 'Reportar el incidente con pruebas', 'Buscar ayuda de otros jugadores para atacarlo'], correct: 2 },
  { id: 30, category: 'NORMATIVAS GENERAL', question: 'Un jugador reporta un rol de coche robado dice que detenerlo es una zona segura. ¿Qué debe hacer el staff?', options: ['Recibir al jugador que tenga cuidado la próxima vez', 'Sancionar al jugador y reportarlo al admin', 'Ignorar la queja porque es parte del juego', 'Investigar y tomar medidas según el caso'], correct: 3 },
  { id: 31, category: 'NORMATIVAS GENERAL', question: 'Un usuario te ofrece información confidencial sobre un enemigo a cambio de dinero OOC. ¿Qué deberías hacer?', options: ['Negociar para obtener más información', 'Aceptar y usar la información', 'Rechazar y reportar al staff', 'Ignorar y seguir jugando'], correct: 2 },
  { id: 32, category: 'NORMATIVAS GENERAL', question: 'Durante una negociación, un criminal pide que se le permita escapar sin consecuencias. ¿Qué deberías hacer?', options: ['Aceptar para evitar violencia', 'Negociar términos realistas', 'Rechazar y aplicar la ley', 'Ignorar y seguir con el rol'], correct: 1 },
  { id: 33, category: 'NORMATIVAS GENERAL', question: 'Un jugador usa un vehículo como arma en una zona segura. ¿Qué infracción comete?', options: ['Ninguna, si no hay testigos', 'Violación de zona segura', 'Solo si causa daños', 'Es permitido en situaciones de emergencia'], correct: 1 },
  { id: 34, category: 'NORMATIVAS GENERAL', question: 'Un usuario te insulta por chat de voz fuera de rol. ¿Cómo deberías reaccionar?', options: ['Responder con insultos', 'Ignorar y reportar al staff', 'Desconectarte del servidor', 'Grabar y publicar en redes'], correct: 1 },
  { id: 35, category: 'NORMATIVAS GENERAL', question: 'Durante un secuestro, los captores te piden que llames a un amigo para pedir rescate. ¿Qué haces?', options: ['Llamar y dar información falsa', 'Cooperar dentro de lo razonable', 'Negarte y arriesgar tu vida', 'Intentar escapar durante la llamada'], correct: 1 },
  { id: 36, category: 'NORMATIVAS GENERAL', question: 'Un jugador decide no reportar un bug que descubrió. ¿Qué está haciendo mal?', options: ['Solo es ilegal si el bug afecta a otros.', 'Puede ser sancionado por no reportar el bug.', 'Es legal si no usa el bug.', 'Nada, no es su responsabilidad.'], correct: 1 },
  { id: 37, category: 'NORMATIVAS GENERAL', question: 'Un usuario te ofrece venderte armas por fuera del juego. ¿Qué deberías hacer?', options: ['Negociar un mejor precio', 'Ignorar la oferta y seguir jugando', 'Rechazar la oferta y reportarlo al staff', 'Aceptar la oferta y comprar las armas'], correct: 2 },
  { id: 38, category: 'NORMATIVAS GENERAL', question: 'Un jugador roba un coche patrulla para hacerse pasar por policía. ¿Cuándo es esto permitido?', options: ['Si está desbloqueado', 'Solo las mafias pueden evitar vehículos oficiales con autorización', 'No, está prohibido para civiles', 'Nada, el modo que policía es perfecto para escapar'], correct: 2 },
  { id: 39, category: 'NORMATIVAS GENERAL', question: 'Mientras trabajas de EMS, decides usar un vehículo de emergencia. ¿Qué infracciones considerarías?', options: ['Puede estar bloqueado', 'Sí, si es una emergencia real', 'No, está prohibido para civiles', 'Nada, el modo que policía es perfecto para escapar'], correct: 1 },
  { id: 40, category: 'NORMATIVAS GENERAL', question: 'Un usuario juega con una banda que ofrece duplicar objetos del juego. ¿Qué deberías hacer?', options: ['Contárselo a tus amigos para que lo usen', 'Reportarlo al staff inmediatamente', 'Rechazar la oferta por lealtad', 'Aceptar inmediatamente sin pensar'], correct: 1 },
  { id: 41, category: 'NORMATIVAS GENERAL', question: 'Durante una persecución, decides usar un vehículo deportivo de policía escalar una montaña. ¿Qué deberías hacer?', options: ['Pedir autorización', 'Ignorar y seguir con el rol completo y justificado.', 'Levantar las manos y cooperar.', 'Nada, puede cambiar cuando quiera.'], correct: 1 },
  { id: 42, category: 'NORMATIVAS GENERAL', question: 'Un jugador decide no reportar un bug que descubrió. ¿Qué está haciendo mal?', options: ['Solo es ilegal si el bug afecta a otros.', 'Puede ser sancionado por no reportar el bug.', 'Es legal si no usa el bug.', 'Nada, no es su responsabilidad.'], correct: 1 },
  { id: 43, category: 'CONCEPTOS BÁSICOS DE ROLEPLAY', question: 'Un usuario te pide ayuda OOC para encontrar un objeto en el juego. ¿Qué deberías hacer?', options: ['Ofrecer ayuda IC para mantener el rol', 'Ignorarlo completamente', 'Ayudarlo inmediatamente para ser amable', 'Decirle que busque información por sí mismo'], correct: 0 },
  { id: 44, category: 'REGLAS DEL SERVIDOR', question: 'Un jugador en Discord te dice que hay OOC. ¿Cómo deberías reaccionar?', options: ['Ignorarlo y reportarlo al staff', 'Desconectarte del servidor', 'Si, entrar staff antes de desconectarte', 'Iniciar una discusión con él'], correct: 0 },
  { id: 45, category: 'NORMATIVAS GENERAL', question: 'Un jugador roba un coche patrulla y lo usa para atropellar a un grupo de personas de forma intencional. ¿Qué deberías hacer?', options: ['Devolver el coche sin violencia', 'Guardarlo dentro del hospital', 'Reportarlo como bug a la administración', 'Esperar que salga del hospital para confrontarlo'], correct: 2 },
  { id: 46, category: 'NORMATIVAS GENERAL', question: 'Ves a alguien en el hospital por error. ¿Qué no deberías hacer?', options: ['Hablar con él sin violencia', 'Guardarlo dentro del hospital', 'Reportarlo como bug a la administración', 'Esperar que salga del hospital para confrontarlo'], correct: 1 },
  { id: 47, category: 'NORMATIVAS GENERAL', question: 'Un usuario te amenaza con un arma pero parece dudar. ¿Cuándo puedes intentar desarmarlo?', options: ['Cuando estás seguro y puedes vencerlo', 'Nunca, siempre debes obedecer', 'Inmediatamente, para demostrar valor', 'Solo si hay una distracción'], correct: 0 },
  { id: 48, category: 'NORMATIVAS GENERAL', question: 'Un jugador te ofrece dinero real por objetos del juego. ¿Qué deberías hacer?', options: ['Negociar un mejor precio', 'Ignorar la oferta y seguir jugando', 'Rechazar la oferta y reportarlo al staff', 'Aceptar la oferta'], correct: 2 },
  { id: 49, category: 'NORMATIVAS GENERAL', question: 'Durante un tiroteo, tu personaje queda sin balas. ¿Qué deberías hacer?', options: ['Renderte inmediatamente', 'Buscar cobertura y esperar refuerzos', 'Seguir disparando sin balas', 'Desconectarte para evitar morir'], correct: 1 },
  { id: 50, category: 'NORMATIVAS GENERAL', question: 'Eres un EMS y un oficial de policía te pide que borres la ubicación de un criminal que acabas de atender. ¿Qué deberías hacer?', options: ['Negarte y mantener la neutralidad', 'Compartir la información para ayudar a la justicia', 'Decidir según la gravedad del crimen', 'Pedir una orden judicial primero'], correct: 0 },
];

// Rules data
const rulesData = [
  { id: 'REG-21', title: 'Zonas del servidor', category: 'Zonas del servidor', description: 'ZONA SEGURA: La Zona Segura es un espacio de neutralidad absoluta donde queda prohibida cualquier acción que pueda generar tensión, intimidación...', icon: Shield },
  { id: 'REG-22', title: 'Zonas del servidor.', category: 'Zonas del servidor', description: 'ZONA VIGILADA: La Zona Vigilada es un área monitoreada donde se permite tensión narrativa controlada, pero se prohíbe cualquier acto delictivo o violento...', icon: Shield },
  { id: 'REG-20', title: 'Sistema oficial de fases de muerte.', category: 'Sistema de Muerte', description: 'FASE 3: INCONSCIENTE - Personaje totalmente inconsciente. - No hay comunicación ni interacción. Solo puedes ir con María. Sí - No hay nadie...', icon: AlertTriangle },
  { id: 'REG-18', title: 'Sistema oficial de fases de muerte.', category: 'Sistema de Muerte', description: 'FASE 2: DESANGANDOTE - Puedes hablar. - No puedes usar radio. - No puedes responder llamadas. - No puedes interactuar. Está...', icon: AlertTriangle },
  { id: 'REG-19', title: 'Sistema oficial de fases de muerte.', category: 'Sistema de Muerte', description: 'FASE 1: DURACIÓN (Duración 1 minuto) Durante esta fase el personaje puede: - Arrastrarse - Hablar - Usar radio - Responder llamadas Después de 1 minuto...', icon: AlertTriangle },
  { id: 'REG-24', title: 'Uso de artículos.', category: 'Normas Generales', description: 'Artículo 6: De recibir un ítem por parte de un administrador o fue entregado para ejercer un rol debe reportarse y devolverlo al finalizar dicho rol...', icon: BookOpen },
  { id: 'REG-17', title: 'Toques de Queda y Rol Agresivo', category: 'Normas Generales', description: 'Artículo 1: En caso de recibir un Toque de Queda, queda estrictamente prohibido iniciar cualquier rol agresivo, excepciones: aplicar solo se puede contin...', icon: Shield },
  { id: 'REG-23', title: 'CLÁUSULA ANTI-ABUSO (ZONAS)', category: 'Zonas del servidor', description: 'Artículo 1: Cualquier intento de aprovecharse interpretativamente será sancionado. Artículo 2: La norma se interpreta bajo el principio de protección del entorno...', icon: AlertTriangle },
  { id: 'REG-01', title: 'Autoridad y Aplicación de las Normas', category: 'Normas Generales', description: 'Artículo 1: El presente reglamento ha sido elaborado y promulgado por el equipo administrativo del servidor. Artículo 2: El equipo administrativo se reserva el...', icon: BookOpen },
  { id: 'AB-03', title: 'CLASIFICACIÓN DE DELITOS Y PENALIZACIONES', category: 'Normas de Abogados', description: 'Delitos públicos: Cualquier conflicto entre demandas, daños y perjuicios entre 2 ciudadanos tendrán una penalización de: 90% del pago por parte de los abogados de las partes. 2. No se aceptarán prueba...', icon: Shield },
  { id: 'AB-02', title: 'Guía de procedimientos judiciales', category: 'Normas de Abogados', description: 'Artículo 1: ¿Qué hacer en caso de que se realice un juicio?** - Juez 1: Recibir las pruebas por parte de los abogados de las partes. 2. No se aceptarán prueba...', icon: BookOpen },
  { id: 'AB-01', title: 'Requisitos de abogados y funciones de cada cargo.', category: 'Normas de Abogados', description: 'FISCALÍA CIUDAD CREATIVA** Requisitos Generales (para todos los cargos judiciales) [Aplica a jueces y fiscales] • No poseer antecedentes delictivos...', icon: Users },
];

// Main App Component
// User data type
interface UserData {
  id: string;
  username: string;
  avatar: string;
  email: string;
  inGuild: boolean;
}

// Discord stats type
interface DiscordStats {
  online: number;
  total: number;
  active: number;
  loading: boolean;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(50).fill(-1));
  const [quizTimer, setQuizTimer] = useState(0);
  
  // Real data states
  const [user, setUser] = useState<UserData | null>(null);
  const [discordStats, setDiscordStats] = useState<DiscordStats>({ online: 0, total: 0, active: 50, loading: true });
  const [whitelistStats, setWhitelistStats] = useState({ approved: 0, total: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Discord stats and user data on mount
  useEffect(() => {
    // Fetch Discord stats
    fetch('/api/discord/stats')
      .then(res => res.json())
      .then(data => {
        if (data.online !== undefined && data.total !== undefined) {
          setDiscordStats({ 
            online: data.online, 
            total: data.total, 
            active: data.active || Math.floor(data.total * 0.1),
            loading: false 
          });
        }
      })
      .catch(err => console.error('Error fetching Discord stats:', err));

    // Fetch current user
    fetch('/api/auth/user')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setCurrentPage('dashboard');
        }
      })
      .catch(() => {
        // User not logged in, stay on landing
      })
      .finally(() => setIsLoading(false));

    // Fetch whitelist stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setWhitelistStats({
          approved: data.approved || 0,
          total: data.total || 0,
          pending: data.pending || 0
        });
      })
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  // Timer effect for quiz
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (quizState === 'quiz') {
      interval = setInterval(() => {
        setQuizTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = () => {
    // Redirect to Discord OAuth
    window.location.href = '/auth/discord';
  };

  const handleLogout = () => {
    fetch('/api/auth/logout')
      .then(() => {
        setUser(null);
        setCurrentPage('landing');
      })
      .catch(console.error);
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const answeredCount = answers.filter(a => a !== -1).length;
  const progressPercent = Math.round((answeredCount / 50) * 100);

  // Landing Page
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/favela-bg.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        </div>

        {/* Characters */}
        <div className="absolute bottom-0 left-0 w-1/3 h-4/5 hidden lg:block">
          <img 
            src="/character-male.png" 
            alt="Character" 
            className="w-full h-full object-contain object-bottom animate-float"
            style={{ animationDelay: '0s' }}
          />
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-4/5 hidden lg:block">
          <img 
            src="/character-female.png" 
            alt="Character" 
            className="w-full h-full object-contain object-bottom animate-float"
            style={{ animationDelay: '1s' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          {/* Badge */}
          <div className="mb-6">
            <Badge className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2 text-violet-400" />
              TrapCity RP • 1 Mes Online
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-2 tracking-tight">
            <span className="text-white">TRAPCITY</span>
          </h1>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-center mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">ROLEPLAY</span>
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-center max-w-xl mb-4 text-lg">
            Donde cada historia cobra vida y cada decisión marca la diferencia.
          </p>
          <p className="text-gray-400 text-center mb-10">
            Tu nueva realidad comienza aquí.
          </p>

          {/* CTA Button */}
          <Button 
            onClick={() => user ? setCurrentPage('whitelist') : setCurrentPage('login')}
            className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white px-8 py-6 text-lg font-semibold rounded-xl animate-pulse-glow"
          >
            <Play className="w-5 h-5 mr-2" />
            {user ? 'Ir a Whitelist' : 'Comenzar Aventura'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Stats */}
          <div className="flex gap-8 md:gap-16 mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-violet-400">
                {isLoading || discordStats.loading ? '...' : discordStats.online}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Online Discord</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-violet-400">
                {isLoading || discordStats.loading ? '...' : discordStats.total}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Miembros Discord</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-violet-400">
                {isLoading || discordStats.loading ? '...' : discordStats.active}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Usuarios Activos</div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 text-sm animate-bounce">
            Descubre más
            <ChevronDown className="w-5 h-5 mx-auto mt-1" />
          </div>
        </div>
      </div>
    );
  }

  // Login Page
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-black to-black" />
        
        {/* Left side - Info */}
        <div className="relative z-10 hidden lg:flex flex-1 flex-col justify-center px-16">
          <div className="mb-8">
            <div className="text-2xl font-bold text-white mb-1">TRAPCITY</div>
            <div className="text-violet-400 font-bold">RP</div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Bienvenido a
          </h1>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent mb-6">
            TrapCity RP
          </h2>
          
          <p className="text-gray-400 text-lg mb-10 max-w-md">
            La comunidad de roleplay más inmersiva de habla hispana
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-4">
              <Users className="w-5 h-5 text-violet-400" />
              <span className="text-sm text-gray-300">Comunidad activa</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-4">
              <Shield className="w-5 h-5 text-violet-400" />
              <span className="text-sm text-gray-300">Sistema de whitelist</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-4">
              <Star className="w-5 h-5 text-violet-400" />
              <span className="text-sm text-gray-300">Roleplay de calidad</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-4">
              <Zap className="w-5 h-5 text-violet-400" />
              <span className="text-sm text-gray-300">Eventos exclusivos</span>
            </div>
          </div>

          <div className="flex gap-8 mt-10">
            <div>
              <div className="text-3xl font-bold text-white">{discordStats.total.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Usuarios activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{whitelistStats.approved}+</div>
              <div className="text-sm text-gray-500">Whitelists aprobadas</div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white text-center mb-2">Iniciar Sesión</h2>
              <p className="text-gray-400 text-center text-sm mb-8">
                Conecta tu cuenta de Discord para continuar
              </p>

              <Button 
                onClick={handleLogin}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.963.074.074 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.963a.078.078 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Continuar con Discord
                <ChevronRight className="w-5 h-5" />
              </Button>

              <div className="mt-8">
                <div className="text-xs text-gray-500 text-center mb-4 uppercase tracking-wider">Información</div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/5 rounded-lg p-4">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Conexión segura</div>
                      <div className="text-xs text-gray-400">Utilizamos OAuth2 de Discord</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 rounded-lg p-4">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Primera vez?</div>
                      <div className="text-xs text-gray-400">Te guiamos paso a paso</div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-6">
                Al continuar, aceptas nuestros <a href="#" className="text-violet-400 hover:underline">Términos de Servicio</a> y <a href="#" className="text-violet-400 hover:underline">Política de Privacidad</a>
              </p>
            </div>

            <p className="text-center text-gray-600 text-sm mt-6">
              2026 TrapCity RP. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Component
  const Sidebar = () => (
    <aside className="w-72 bg-[#0a0a0a] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-400 rounded-xl flex items-center justify-center">
            <span className="font-bold text-white text-sm">TC</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">TrapCity<span className="text-violet-400">RP</span></h1>
            <p className="text-xs text-gray-500">Panel de Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menú</div>
        
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${currentPage === 'dashboard' ? 'text-white bg-white/5 border-r-2 border-violet-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        
        <button 
          onClick={() => setCurrentPage('profile')}
          className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${currentPage === 'profile' ? 'text-white bg-white/5 border-r-2 border-violet-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <User className="w-5 h-5" />
          <span>Mi Perfil</span>
        </button>
        
        <button 
          onClick={() => setCurrentPage('applications')}
          className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${currentPage === 'applications' ? 'text-white bg-white/5 border-r-2 border-violet-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <FileText className="w-5 h-5" />
          <span>Aplicaciones</span>
          <span className="ml-auto text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">0</span>
        </button>
        
        <button 
          onClick={() => setCurrentPage('rules')}
          className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${currentPage === 'rules' ? 'text-white bg-white/5 border-r-2 border-violet-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Normativas</span>
        </button>

        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Soporte</div>
        
        <button className="w-full flex items-center gap-3 px-6 py-3 text-left text-gray-400 hover:text-white hover:bg-white/5 transition">
          <HelpCircle className="w-5 h-5" />
          <span>Ayuda</span>
          <span className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </button>
        
        <button className="w-full flex items-center gap-3 px-6 py-3 text-left text-gray-400 hover:text-white hover:bg-white/5 transition">
          <Settings className="w-5 h-5" />
          <span>Ajustes</span>
        </button>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : ''} />
            <AvatarFallback className="bg-violet-500/20 text-violet-400">{user?.username?.substring(0, 2).toUpperCase() || 'US'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user?.username || 'Usuario'}</p>
            <p className="text-xs text-gray-500 truncate">@{user?.username} <span className="text-gray-500">(Discord)</span></p>
          </div>
          <span className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );

  // Header Component
  const Header = () => (
    <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Sistema Operativo
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4 mr-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-400">Online Discord:</span>
            <span className="font-semibold text-white">{discordStats.online || '...'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Total Discord:</span>
            <span className="font-semibold text-white">{discordStats.total || '...'}</span>
          </div>
        </div>
        
        <button className="relative p-2 text-gray-400 hover:text-white transition">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
        </button>
        
        <Button 
          onClick={() => setCurrentPage('whitelist')}
          className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition animate-pulse-glow"
        >
          <Plus className="w-4 h-4" />
          Nueva Aplicación
        </Button>
      </div>
    </header>
  );

  // Dashboard Page
  if (currentPage === 'dashboard') {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 ml-72">
          <Header />
          
          <div className="p-6">
            {/* Welcome */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm mb-4">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>Panel de Control</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Bienvenido, <span className="text-gradient">{user?.username || 'Usuario'}</span></h1>
              <p className="text-gray-400">Tu aventura continúa • {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Whitelist Progress */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-400" />
                    Progreso de Whitelist
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-5 border border-violet-500/30">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold text-white">Fase 1</div>
                          <div className="text-xs text-violet-400">Cuestionario</div>
                        </div>
                        <Badge className="bg-violet-500/20 text-violet-400">Pendiente</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">50 preguntas sobre las normativas del servidor</p>
                      <Button 
                        onClick={() => setCurrentPage('whitelist')}
                        className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white"
                      >
                        Continuar
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10 opacity-60">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold text-white">Fase 2</div>
                          <div className="text-xs text-gray-400">Avanzado</div>
                        </div>
                        <Badge className="bg-gray-700 text-gray-400">Bloqueada</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">Completa Fase 1 para desbloquear</p>
                      <Button disabled className="w-full bg-gray-700 text-gray-400 cursor-not-allowed">
                        <Lock className="w-4 h-4 mr-2" />
                        Bloqueado
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recent Applications */}
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-violet-400" />
                      Aplicaciones Recientes
                    </h3>
                    <button 
                      onClick={() => setCurrentPage('applications')}
                      className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      Ver todas
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-400 mb-2">No tienes aplicaciones aún</h4>
                    <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Comienza creando tu primera aplicación para unirte a la comunidad</p>
                    <Button 
                      onClick={() => setCurrentPage('whitelist')}
                      className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Crear aplicación
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Profile Completion */}
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Completado de Perfil</h3>
                    <span className="text-violet-400 font-bold">50%</span>
                  </div>
                  <Progress value={50} className="h-2 mb-4" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Discord conectado</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Username configurado</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-4 h-4 rounded-full border border-gray-600" />
                      <span className="text-gray-500">Whitelist Phase 1</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-4 h-4 rounded-full border border-gray-600" />
                      <span className="text-gray-500">Whitelist Phase 2</span>
                    </div>
                  </div>
                </div>

                {/* My Requests */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-400" />
                    Mis Solicitudes
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">0</div>
                      <div className="text-xs text-gray-400">Total</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">0</div>
                      <div className="text-xs text-gray-400">Pendientes</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">0</div>
                      <div className="text-xs text-gray-400">Aprobadas</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">0</div>
                      <div className="text-xs text-gray-400">Rechazadas</div>
                    </div>
                  </div>
                </div>

                {/* Forms */}
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-400" />
                      Formularios
                    </h3>
                    <button className="text-xs text-violet-400 hover:text-violet-300">Ver todos</button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition cursor-pointer">
                      <div className="text-sm font-medium text-white">Solicitud entrada al Staff de TrapCityRP</div>
                      <div className="text-xs text-gray-500 mt-1">Este formulario sirve como filtro para aquellos que tienen pens...</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition cursor-pointer">
                      <div className="text-sm font-medium text-white">Formulario Abogados</div>
                      <div className="text-xs text-gray-500 mt-1">Únete al grupo que defiende los derechos en la ciudad. Necesita...</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition cursor-pointer">
                      <div className="text-sm font-medium text-white">Formulario EMS</div>
                      <div className="text-xs text-gray-500 mt-1">Formulario de ingreso EMS - TrapCityRP Se parte del equipo...</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition cursor-pointer">
                      <div className="text-sm font-medium text-white">Formulario de entrada a POLICIA CREATIVA</div>
                      <div className="text-xs text-gray-500 mt-1">Formulario de Postulación — Cuerpo Policial • Tienes voc...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Whitelist Page
  if (currentPage === 'whitelist') {
    if (quizState === 'intro') {
      return (
        <div className="flex min-h-screen bg-black">
          <Sidebar />
          <main className="flex-1 ml-72">
            <Header />
            
            <div className="p-6 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 mb-4">
                  <Shield className="w-3 h-3 mr-1" />
                  Whitelist Fase 1
                </Badge>
                <h2 className="text-3xl font-bold mb-2">Formulario de <span className="text-gradient">Normativas</span></h2>
                <p className="text-gray-400">Demuestra tu conocimiento de las reglas del servidor</p>
              </div>

              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-violet-400" />
                  Instrucciones
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-400 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">50 preguntas de opción múltiple</h4>
                      <p className="text-sm text-gray-400">Basadas en las normativas del servidor</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-400 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Sin límite de tiempo</h4>
                      <p className="text-sm text-gray-400">Tómate el tiempo que necesites, pero se registrará la duración</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-400 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Puedes navegar entre preguntas</h4>
                      <p className="text-sm text-gray-400">Responde en el orden que prefieras y revisa antes de enviar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-400 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Revisión por staff</h4>
                      <p className="text-sm text-gray-400">Al finalizar, un miembro del staff revisará tu formulario</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-200">
                    <strong>Recomendación:</strong> Antes de comenzar, te sugerimos revisar las <a href="#" className="text-violet-400 hover:underline">normativas del servidor</a> para asegurarte de estar preparado.
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => setQuizState('quiz')}
                className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white py-4 text-lg font-semibold rounded-xl animate-pulse-glow"
              >
                <Play className="w-5 h-5 mr-2" />
                Comenzar Formulario
              </Button>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                Máximo 2 intentos por día. Las respuestas no se muestran al finalizar.
              </p>
            </div>
          </main>
        </div>
      );
    }

    if (quizState === 'quiz') {
      const question = quizQuestions[currentQuestion];
      
      return (
        <div className="flex min-h-screen bg-black">
          <Sidebar />
          <main className="flex-1 ml-72">
            <Header />
            
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                {/* Quiz Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setQuizState('intro')}
                      className="text-gray-400 hover:text-white flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Salir
                    </button>
                    <span className="text-sm text-gray-400">Formulario de Normativas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(quizTimer)}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">{answeredCount} de 50 respondidas</span>
                    <span className="text-violet-400">{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Question Area */}
                  <div className="lg:col-span-2 glass rounded-2xl p-6">
                    <div className="mb-4">
                      <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 mb-4">
                        {question.category}
                      </Badge>
                      <h3 className="text-lg font-semibold mb-2">Pregunta {currentQuestion + 1} de 50</h3>
                      <p className="text-xl text-white">{question.question}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {question.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          className={`w-full text-left p-4 rounded-xl border transition ${
                            answers[currentQuestion] === idx 
                              ? 'bg-violet-500/20 border-violet-500 text-white' 
                              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="inline-block w-8 h-8 rounded-lg bg-white/10 text-center leading-8 mr-3 text-sm font-semibold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                      <Button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        variant="outline"
                        className="px-6 py-3 border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                        Anterior
                      </Button>
                      <Button
                        onClick={() => setCurrentQuestion(Math.min(49, currentQuestion + 1))}
                        disabled={currentQuestion === 49}
                        className="px-6 py-3 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white"
                      >
                        Siguiente
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Navigation Grid */}
                  <div className="glass rounded-2xl p-6">
                    <h4 className="font-semibold mb-4">Navegación</h4>
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {quizQuestions.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentQuestion(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                            idx === currentQuestion 
                              ? 'bg-violet-500 text-white' 
                              : answers[idx] !== -1 
                                ? 'bg-green-500/50 text-green-200' 
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs mb-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-violet-500 rounded" />
                        <span className="text-gray-400">Actual</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded" />
                        <span className="text-gray-400">Respondida</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-white/10 rounded" />
                        <span className="text-gray-400">Pendiente</span>
                      </div>
                    </div>

                    <Button
                      disabled={answeredCount < 40}
                      className={`w-full py-3 rounded-xl font-semibold transition ${
                        answeredCount >= 40 
                          ? 'bg-green-600 hover:bg-green-500 text-white' 
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {answeredCount >= 40 ? 'Enviar Formulario' : `Mínimo 40 respuestas (${answeredCount}/40)`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }
  }

  // Profile Page
  if (currentPage === 'profile') {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 ml-72">
          <Header />
          
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Profile Header */}
              <div className="glass rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : ''} />
                    <AvatarFallback className="bg-violet-500/20 text-violet-400 text-2xl">
                      {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-white">{user?.username || 'Usuario'}</h2>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Check className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    </div>
                    <p className="text-gray-400">@{user?.username} <span className="text-gray-500">(Discord)</span></p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-green-400">Conectado</span>
                    </div>
                  </div>
                  <Badge className="bg-gray-700 text-gray-400">
                    <Lock className="w-3 h-3 mr-1" />
                    Sin Whitelist
                  </Badge>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="bg-white/5 border-b border-white/10 w-full justify-start rounded-none h-auto p-0 mb-6">
                  <TabsTrigger 
                    value="info" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:text-white rounded-none px-6 py-3 text-gray-400"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Información
                  </TabsTrigger>
                  <TabsTrigger 
                    value="devices"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:text-white rounded-none px-6 py-3 text-gray-400"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Dispositivos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:text-white rounded-none px-6 py-3 text-gray-400"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Historia del Personaje
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-violet-400" />
                        Información Personal
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Nombre</div>
                          <div className="text-white">{user?.username || 'Usuario'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Nombre de usuario</div>
                          <div className="text-white">@{user?.username?.toLowerCase() || 'usuario'} <span className="text-gray-500">(Discord)</span></div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Correo Electrónico</div>
                          <div className="text-white flex items-center gap-2">
                            <span>{user?.email || 'No disponible'}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Discord ID</div>
                          <div className="text-violet-400 font-mono text-sm">{user?.id || 'No disponible'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">En Servidor</div>
                          <div className="text-gray-400 flex items-center gap-2">
                            {user?.inGuild ? (
                              <span className="text-green-400 flex items-center gap-1">
                                <Check className="w-4 h-4" /> Sí - Miembro verificado
                              </span>
                            ) : (
                              <span className="text-yellow-400">No - Unirse al servidor</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-violet-400" />
                        Cuentas Vinculadas
                      </h3>
                      <div className="bg-white/5 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                          {user?.avatar ? (
                            <img 
                              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                              alt="Avatar" 
                              className="w-10 h-10 rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[#5865F2]/20 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.963.074.074 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.963a.078.078 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                              </svg>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-white">Discord</div>
                            <div className="text-xs text-violet-400">ID: {user?.id || 'N/A'}</div>
                          </div>
                          <Check className="w-5 h-5 text-violet-400" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-t border-white/10">
                          <span className="text-sm text-gray-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Estado de Cuenta
                          </span>
                          <span className="text-green-400 text-sm">Verificada</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-white/10">
                          <span className="text-sm text-gray-400 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Whitelists Aprobadas
                          </span>
                          <span className="text-white font-semibold">{whitelistStats.approved}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-white/10">
                          <span className="text-sm text-gray-400 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Total Usuarios Discord
                          </span>
                          <span className="text-white font-semibold">{discordStats.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-400" />
                      Biografía
                    </h3>
                    <p className="text-gray-400">{user?.inGuild 
                      ? `Miembro activo de TrapCity RP. Usuario de Discord conectado: ${user.username}. Únete a nuestra comunidad de roleplay!` 
                      : 'No has agregado una biografía aún. Completa tu perfil conectándote al servidor de Discord.'}</p>
                  </div>
                </TabsContent>

                <TabsContent value="devices" className="mt-0">
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-violet-400" />
                      Dispositivos Recientes
                      <span className="text-sm text-gray-500">(5 dispositivos)</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {[
                        { name: 'Chrome en Windows', active: true, date: '12 abr 2026, 13:51' },
                        { name: 'Chrome en Windows', active: true, date: '12 abr 2026, 03:29' },
                        { name: 'Chrome en Windows', active: true, date: '11 abr 2026, 20:21' },
                        { name: 'Chrome en Windows', active: false, date: '10 abr 2026, 12:35' },
                        { name: 'Chrome en Windows', active: false, date: '19 mar 2026, 00:07' },
                      ].map((device, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                              <Monitor className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white flex items-center gap-2">
                                {device.name}
                                {device.active && (
                                  <Badge className="bg-green-500/20 text-green-400 text-xs">Activo</Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">Escritorio • 216.238.179.xxx</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Última actividad</div>
                            <div className="text-sm text-gray-300">{device.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-4">
                      Los dispositivos se registran automáticamente cuando inicias sesión. Por seguridad, las direcciones IP se muestran parcialmente ocultas.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  <div className="glass rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Historia del Personaje Bloqueada</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      Para crear la historia de tu personaje, primero debes aprobar la <span className="text-violet-400">Whitelist Fase 1</span>. Esto asegura que comprendas las normativas del servidor antes de desarrollar tu personaje.
                    </p>
                    <Button 
                      onClick={() => setCurrentPage('whitelist')}
                      className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Ir a Whitelist Fase 1
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Applications Page
  if (currentPage === 'applications') {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 ml-72">
          <Header />
          
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Mis Aplicaciones</h2>
                <p className="text-gray-400">Gestiona y revisa tus solicitudes</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-violet-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">2</div>
                      <div className="text-xs text-gray-400">Total</div>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">1</div>
                      <div className="text-xs text-gray-400">Pendientes</div>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">0</div>
                      <div className="text-xs text-gray-400">Aprobadas</div>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">1</div>
                      <div className="text-xs text-gray-400">Rechazadas</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="glass rounded-xl p-4 mb-6">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar aplicación..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-violet-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Applications List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Whitelist Fase 1</div>
                        <div className="text-xs text-gray-500">#cmw42712</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400">En Progreso</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    Iniciado: 12 abr 2026
                  </div>
                </div>

                <div className="glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Whitelist Fase 1</div>
                        <div className="text-xs text-gray-500">#cmw3ec9</div>
                      </div>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400">Rechazada</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      Iniciado: 11 ene 2026
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4" />
                      Completado: 11 ene 2026
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 mt-3">
                      <div className="text-xs text-gray-500 mb-1">Comentario del revisor:</div>
                      <div className="text-sm text-red-400">Rechazado por: randynius</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="w-4 h-4" />
                      Revisado por: <span className="text-gray-300">(Staff)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Rules Page
  if (currentPage === 'rules') {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const filteredRules = rulesData.filter(rule => {
      const matchesSearch = rule.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           rule.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || rule.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 ml-72">
          <Header />
          
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Normativas <span className="text-gradient">TrapCity RP</span></h2>
                <p className="text-gray-400">Lee cuidadosamente antes de realizar la whitelist</p>
              </div>

              {/* Search and Filter */}
              <div className="glass rounded-xl p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Buscar normativa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-violet-500 focus:outline-none transition"
                    />
                  </div>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none transition"
                  >
                    <option value="">Todas las categorías</option>
                    <option value="Zonas del servidor">Zonas del servidor</option>
                    <option value="Sistema de Muerte">Sistema de Muerte</option>
                    <option value="Normas Generales">Normas Generales</option>
                    <option value="Normas de Abogados">Normas de Abogados</option>
                  </select>
                </div>
              </div>

              {/* Rules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRules.map((rule) => (
                  <div key={rule.id} className="glass rounded-xl p-5 hover:border-violet-500/30 transition cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center group-hover:bg-violet-500/30 transition">
                          <rule.icon className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <div className="text-xs text-violet-400 font-mono">{rule.id}</div>
                          <div className="font-semibold text-white text-sm">{rule.title}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-3">{rule.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge className="bg-white/5 text-gray-400 text-xs">{rule.category}</Badge>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition" />
                    </div>
                  </div>
                ))}
              </div>

              {filteredRules.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron normativas</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;

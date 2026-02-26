import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export const LegalDisclaimer = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'transparent', border: 'none', padding: '0.25rem 0',
                    color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6,
                    fontSize: '0.75rem', fontWeight: '800', transition: 'all 0.2s',
                    fontFamily: 'var(--font-inter)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
            >
                <ShieldAlert size={14} color="var(--text-muted)" />
                Aviso Legal sobre Inteligencia Artificial
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expanded && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(190, 24, 93, 0.15)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.6', color: 'var(--text-muted)', margin: 0, opacity: 0.8, fontWeight: '400', fontFamily: 'var(--font-inter)' }}>
                        Nota de Responsabilidad: La información generada en <em>Solemia Nutripal</em> proviene de modelos de Inteligencia Artificial como herramienta de asistencia clínica. No constituye un diagnóstico médico. El profesional de la salud es el único responsable de revisar, validar y autorizar cualquier cálculo o sugerencia algorítmica antes de su aplicación clínica.
                    </p>
                </div>
            )}
        </div>
    );
};

export const PrivacyPolicyContent = () => (
    <div style={{ lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--solemia-charcoal)' }}>
        <p style={{ marginBottom: '2rem' }}><strong>Fecha de última actualización:</strong> Febrero 2026</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>1. Identidad y Domicilio del Responsable</h3>
        <p style={{ marginBottom: '1.5rem' }}>Solemia Nutripal (en lo sucesivo "Solemia" o el "Responsable"), operando bajo las leyes de los Estados Unidos Mexicanos, es la persona moral responsable del tratamiento, uso y protección de sus datos personales, así como de los datos que usted (el "Usuario", "Nutriólogo" o "Profesional") ingrese a la plataforma respecto a sus propios clientes y/o pacientes, actuando Solemia en este último caso estrictamente como <strong>Encargado del Tratamiento</strong> en términos de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>2. Datos Personales que Recabamos</h3>
        <p style={{ marginBottom: '0.5rem' }}>Para llevar a cabo las finalidades descritas en el presente aviso, recabaremos las siguientes categorías de datos personales:</p>
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
            <li><strong>Datos de Identificación del Usuario:</strong> Nombre completo, correo electrónico, teléfono, datos de facturación y fiscales.</li>
            <li><strong>Datos de Uso y Navegación:</strong> Direcciones IP, tipo de navegador, sistema operativo, tiempos de acceso y páginas visitadas (recolectados mediante cookies y tecnologías similares).</li>
            <li><strong>Datos de Pacientes (Sensibles):</strong> Solemia procesa datos ingresados por el Usuario titular de la cuenta, los cuales pueden incluir nombres, información antropométrica, hábitos alimenticios, historiales clínicos, padecimientos, alergias y análisis bioquímicos. <strong>Estos datos son considerados patrimoniales y sensibles</strong>, y su ingreso a la plataforma es responsabilidad exclusiva del Usuario.</li>
        </ul>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>3. Finalidades del Tratamiento de los Datos</h3>
        <p style={{ marginBottom: '0.5rem' }}>Los datos personales que recabamos son utilizados para las siguientes finalidades primarias (estrictamente necesarias para el servicio):</p>
        <ul style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>Creación, gestión y mantenimiento de la cuenta de Usuario (SaaS B2B).</li>
            <li>Procesamiento de pagos y facturación a través de nuestros proveedores (ej. Mercado Pago, Stripe).</li>
            <li>Almacenamiento en la nube y organización de los expedientes clínicos creados por el Usuario.</li>
            <li>Procesamiento algorítmico y análisis automatizado mediante Inteligencia Artificial para asistir al Usuario en su labor clínica.</li>
            <li>Cumplimiento de obligaciones legales, resolución de disputas y protección de nuestros legítimos intereses.</li>
        </ul>
        <p style={{ marginBottom: '1.5rem' }}>De manera secundaria, podremos utilizar su información de contacto para enviarle notificaciones técnicas, actualizaciones de producto, boletines informativos y ofertas relevantes, a lo cual puede oponerse en cualquier momento.</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>4. Transferencia de Datos a Terceros y subprocesadores (IA)</h3>
        <p style={{ marginBottom: '0.5rem' }}>Solemia se compromete a no vender, alquilar ni comercializar su información personal ni la de sus pacientes. Sin embargo, para operar la infraestructura técnica del Software as a Service (SaaS), se realizan transferencias a subprocesadores bajo estrictos Acuerdos de Procesamiento de Datos (DPA):</p>
        <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
            <li><strong>Servicios en la Nube (Hosting y BD):</strong> Proveedores como Vercel y Supabase, utilizados para alojar la aplicación y bases de datos con encriptación en tránsito y en reposo (AES-256).</li>
            <li><strong>Pasarelas de Pago:</strong> Proveedores certificados PCI-DSS para el cobro de suscripciones.</li>
            <li><strong>Cláusula Crítica de Inteligencia Artificial (LLMs):</strong> Para proveer la funcionalidad de análisis clínico y asistencia, porciones de texto(anonimizadas y/o seudonimizadas bajo la responsabilidad del Usuario) son transmitidas a través de APIs empresariales de proveedores de IA (ej. OpenAI LLC, Anthropic). Solemia mantiene contratos empresariales de <em>Zero Data Retention Protocol</em>, lo que garantiza jurídicamente que <strong>estos proveedores externos NO utilizarán los datos de sus pacientes para entrenar, ajustar o mejorar sus modelos fundamentales públicos ni privados.</strong></li>
        </ul>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>5. Responsabilidad del Usuario (Profesional de la Salud)</h3>
        <p style={{ marginBottom: '1.5rem' }}>Al ser Solemia el <em>Encargado</em> tecnológico, <strong>el Usuario actúa como el Responsable legal primario</strong> frente a sus propios pacientes. El Usuario garantiza bajo juramento que ha obtenido el <strong>Consentimiento Informado</strong> previo y expreso de sus pacientes para recolectar su información de salud, digitalizarla y procesarla utilizando herramientas tecnológicas en la nube y algoritmos de Inteligencia Artificial de terceros, eximiendo a Solemia de cualquier reclamación, multa o litigio por falta de dicho consentimiento.</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>6. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h3>
        <p style={{ marginBottom: '1.5rem' }}>Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Para el ejercicio de cualquiera de los derechos ARCO, usted o el titular originario de los datos (el paciente) deberá presentar la solicitud respectiva a través del correo electrónico de soporte de Solemia.</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>7. Medidas de Seguridad y Modificaciones al Aviso</h3>
        <p>Solemia ha implementado medidas de seguridad administrativas, técnicas y físicas, tales como control de accesos basados en roles (RLS), criptografía (SSL/TLS) y firmas digitales (Signed URLs) para proteger sus datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado. Cualquier modificación a este Aviso de Privacidad será notificada a través de la plataforma.</p>
    </div>
);

export const TermsAndConditionsContent = () => (
    <div style={{ lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--solemia-charcoal)' }}>
        <p style={{ marginBottom: '2rem' }}><strong>Efectivos a partir de:</strong> Febrero 2026</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>1. Aceptación de los Términos y Naturaleza del Servicio</h3>
        <p style={{ marginBottom: '1.5rem' }}>Estos Términos y Condiciones ("Términos") constituyen un contrato legalmente vinculante entre usted (el "Usuario", "Usted" o el "Profesional") y Solemia Nutripal ("Solemia", "Nosotros" o "Manejador"). Al crear una cuenta, acceder o utilizar la plataforma Solemia Nutripal, usted reconoce haber leído, entendido y aceptado cumplir con todos los términos aquí descritos. Solemia es una plataforma "Software as a Service" (SaaS) Business-to-Business (B2B) desarrollada como una herramienta digital de gestión de pacientes y asistencia impulsada por Inteligencia Artificial (IA), diseñada <strong>única y exclusivamente para el uso de profesionales de la salud debidamente certificados (Nutriólogos, Médicos, Dietistas).</strong></p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>2. Creación de Cuentas y Seguridad</h3>
        <p style={{ marginBottom: '1.5rem' }}>Para acceder a los Servicios, debe registrarse proporcionando información precisa, actual y completa. Usted es responsable de mantener la confidencialidad de sus credenciales de inicio de sesión y de todas las actividades que ocurran bajo su cuenta. Solemia se reserva el derecho de suspender o cancelar cuentas que violen la seguridad, compartan accesos de forma ilícita (uso simultáneo abusivo) o infrinjan estos Términos.</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>3. Licencia de Uso y Propiedad Intelectual</h3>
        <p style={{ marginBottom: '1.5rem' }}>Solemia le otorga una licencia limitada, no exclusiva, no sublicenciable y revocable para acceder y utilizar el Software con fines profesionales internos. Todo el código fuente, la interfaz de usuario, las bases de datos algorítmicas, la marca comercial "Solemia", logotipos y el "know-how" del sistema subyacente son propiedad intelectual exclusiva de Solemia o de sus licenciantes. Queda estrictamente prohibido realizar ingeniería inversa, descompilar, copiar, reproducir, modificar o crear trabajos derivados de la Plataforma o utilizar el servicio para desarrollar un producto competitivo.</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>4. Descargo Fundamental de Responsabilidad Médica y Clínica (Uso de IA)</h3>
        <div style={{ backgroundColor: 'rgba(225, 29, 72, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(225, 29, 72, 0.2)', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                4.1 Limitación Absoluta. Solemia no provee diagnósticos médicos directos, ni tratamientos, ni servicios de salud a pacientes finales. La plataforma y sus algoritmos de IA son exclusivamente herramientas de "ASISTENCIA" (Co-Pilot). Las sugerencias, resúmenes, inferencias o cálculos emitidos por la IA son de naturaleza probabilística y pueden contener errores, imprecisiones u omisiones ("ALUCINACIONES").
                <br /><br />
                4.2 Responsabilidad del Usuario. El Usuario (Nutriólogo / Profesional) acepta y reconoce ser el ÚNICO RESPONSABLE de la interpretación y validación clínica y humana de toda información procesada por la plataforma antes de su aplicación en un paciente real. El Usuario asume total responsabilidad civil, penal, administrativa y ética derivada del tratamiento prescrito a sus pacientes. Solemia Nutripal queda categóricamente exonerado de cualquier demanda por negligencia médica, mala praxis, lesiones, daños a la salud o muerte derivada del uso (correcto o incorrecto) de la plataforma.
            </p>
        </div>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>5. Condiciones Financieras: Pagos, Suscripciones y "Garantía Blindada"</h3>
        <p style={{ marginBottom: '0.5rem' }}>El uso de Solemia opera mediante suscripciones prepagadas (recurrentes) procesadas por agentes de pago autorizados (Mercado Pago). El servicio continuará facturándose automáticamente en el ciclo acordado (mensual, semestral o anual) hasta que el Usuario decida cancelar su suscripción a través del panel de control de su cuenta, lo cual debe y puede hacerse antes de la fecha de corte.</p>
        <p style={{ marginBottom: '1.5rem' }}><strong>5.1. Garantía Blindada (Reembolso de 15 Días):</strong> Como compromiso de calidad, los <em>nuevos</em> usuarios (primer ciclo de facturación) están protegidos por una garantía de devolución total de su pago inicial si solicitan la cancelación y el reembolso dentro de los primeros quince (15) días naturales posteriores a la fecha de activación, sin preguntas. Esta política solo aplica al primer pago. Una vez vencidos los 15 días iniciales, o para periodos de renovación subsiguientes, <strong>no existen devoluciones pro-rata ni reembolsos totales</strong> por el tiempo no utilizado en el mes o año activo.</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>6. Disponibilidad del Servicio (SLA) y Modificaciones</h3>
        <p style={{ marginBottom: '1.5rem' }}>Solemia realiza esfuerzos comercialmente razonables para mantener una disponibilidad de red del 99.9%. No obstante, al encontrarnos cimentados en infraestructuras de computación en la Nube (AWS/GCP/Vercel) y depender de LLMs de alta demanda (OpenAI/Anthropic), el servicio se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD". No garantizamos que el servicio estará libre de interrupciones técnicas temporales (mantenimientos programados o caídas de terceros). Solemia se reserva el derecho de modificar el software, agregar características o alterar módulos en cualquier momento para su actualización y mejora continua.</p>

        <h3 style={{ marginBottom: '1rem', fontWeight: '800', color: 'var(--solemia-plum)' }}>7. Indemnización y Jurisdicción</h3>
        <p style={{ marginBottom: '1.5rem' }}>Usted acepta indemnizar y eximir de responsabilidad a Solemia, sus fundadores, empleados y afiliados contra todos los daños, reclamaciones de terceros y gastos, incluidos los honorarios razonables de abogados, que surjan de su uso de la plataforma, de sus decisiones clínicas, o de la violación de estos términos o de las leyes locales aplicables en su territorio de ejercicio. Estos términos se rigen e interpretan de acuerdo con las leyes de los Estados Unidos Mexicanos, renunciando a cualquier otra jurisdicción que pudiera corresponderles por motivo de domicilio presente o futuro.</p>
    </div>
);

export const DataAndAIPolicyContent = () => (
    <div>
        <h3 style={{ marginBottom: '1rem', fontWeight: '800' }}>1. Transparencia Algorítmica</h3>
        <p>Nuestra plataforma integra modelos grandes de lenguaje (LLMs) orientados a procesar el lenguaje natural de historiales clínicos y sugerir análisis nutricionales. Estos algoritmos funcionan identificando patrones y carecen de comprensión fisiológica real.</p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>2. Privacidad de los Datos en la IA</h3>
        <p>Es política estricta de Solemia que los datos analizados <strong>nunca</strong> sean utilizados para retroalimentar el entrenamiento de los modelos base de nuestros proveedores de Inteligencia Artificial. Se aplican técnicas de mitigación y los contratos empresariales con dichas APIs (Zero Data Retention API policies) aseguran la confidencialidad.</p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>3. Mitigación de Alucinaciones</h3>
        <p>La IA puede, en ocasiones, generar información imprecisa ("alucinaciones"). Solemia implementa barandales lógicos (guardrails) orientados a que la IA rechace proveer indicaciones en casos críticos y sugiera "consultar la bibliografía pertinente". No obstante, la validación del "Humano en el Bucle" (Human in the loop) es obligatoria por parte del profesional.</p>
    </div>
);

export const CookiesPolicyContent = () => (
    <div>
        <h3 style={{ marginBottom: '1rem', fontWeight: '800' }}>Uso de Cookies y Almacenamiento Local</h3>
        <p>Solemia Nutripal utiliza cookies estrictamente necesarias y tecnologías de almacenamiento local de su navegador para mantener las sesiones de usuario seguras, recordar preferencias de la interfaz y garantizar el correcto enrutamiento del flujo de trabajo dentro del panel clínico.</p>
        <p>Utilizamos herramientas de analítica anónima para entender la interacción del usuario y mejorar el rendimiento técnico de la plataforma. Al continuar usando nuestra web y nuestros servicios en la nube, usted acepta el almacenamiento de estas cookies esenciales para el funcionamiento del SaaS.</p>
    </div>
);

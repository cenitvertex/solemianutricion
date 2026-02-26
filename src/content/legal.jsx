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
    <div>
        <h3 style={{ marginBottom: '1rem', fontWeight: '800' }}>1. Identidad y Domicilio del Responsable</h3>
        <p>Solemia Nutripal (en adelante "Solemia"), con sede de operaciones en México, es la entidad responsable del tratamiento y protección de sus datos personales, así como de los datos que usted (el "Nutriólogo" o "Profesional") ingrese a la plataforma respecto a sus pacientes, actuando Solemia en este último caso como Encargado del Tratamiento.</p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>2. Datos Personales Sensibles y Finalidad del Tratamiento</h3>
        <p>Solemia recopila información de los profesionales (nombre, correo, teléfono) para la gestión de la cuenta, cobro y prestación del servicio SaaS.</p>
        <p><strong>Respecto a los pacientes:</strong> Solemia procesa datos de salud y hábitos alimenticios ingresados exclusivamente por el Profesional. La finalidad única de este procesamiento es generar análisis, resúmenes y asistencia clínica mediante algoritmos de Inteligencia Artificial para uso exclusivo del Profesional.</p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>3. Transferencia de Datos e Inteligencia Artificial</h3>
        <p><strong>Cláusula Crítica:</strong> Para proveer la funcionalidad de análisis clínico, los datos anónimos o seudonimizados pueden ser transmitidos a las APIs de nuestros proveedores de Inteligencia Artificial (ej. OpenAI, Anthropic). Solemia garantiza contractualmente que <strong>estos proveedores no utilizarán los datos de sus pacientes para entrenar modelos públicos o propios</strong>. La transmisión se realiza mediante canales cifrados y el procesamiento es de naturaleza efímera o estrictamente controlada.</p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>4. Derechos ARCO</h3>
        <p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos. En el caso de los pacientes, el Profesional es el Responsable directo ante ellos, y Solemia actuará según las instrucciones del Profesional para la eliminación de historiales clínicos cuando sea requerido. Para cualquier solicitud legal, contáctenos a través de los canales de soporte de la plataforma.</p>
    </div>
);

export const TermsAndConditionsContent = () => (
    <div>
        <h3 style={{ marginBottom: '1rem', fontWeight: '800' }}>1. Naturaleza del Servicio y Licencia</h3>
        <p>Solemia Nutripal es una herramienta "Software as a Service" (SaaS) B2B diseñada para asistir a nutriólogos y profesionales de la salud. Se otorga una licencia limitada, no exclusiva e intransferible para el uso de la plataforma. Queda estrictamente prohibida la ingeniería inversa, copia o distribución no autorizada de la plataforma o sus mecánicas subyacentes de IA.</p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>2. Deslinde de Responsabilidad Clínica (Uso de IA)</h3>
        <p style={{ textTransform: 'uppercase', fontWeight: '700', fontSize: '0.85rem' }}>
            Solemia Nutripal no provee diagnósticos médicos directos ni consejos de salud directos a pacientes. La IA es una herramienta de asistencia probabilística y no reemplaza el criterio humano. El usuario (Nutriólogo) es el único y absoluto responsable de la interpretación de la información generada por la IA, de los tratamientos prescritos y de la validación de alergias o condiciones médicas. Solemia no asume ninguna responsabilidad civil, penal o administrativa por negligencia médica, malos diagnósticos o efectos adversos en los pacientes del usuario.
        </p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>3. Obligación de Consentimiento Informado</h3>
        <p>El Profesional se obliga a obtener el consentimiento informado de sus pacientes antes de ingresar su información médica a Solemia, notificándoles explícitamente que sus datos serán procesados por herramientas automatizadas y modelos de Inteligencia Artificial. Solemia se exime de cualquier disputa legal derivada de la omisión de este paso por parte del Profesional.</p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>4. Pagos, Suscripciones y Garantía Blindada</h3>
        <p>Las suscripciones se cobran por adelantado a través de nuestro proveedor de pagos (Mercado Pago). <strong>Garantía Blindada de 15 Días:</strong> Los nuevos usuarios tienen derecho a solicitar un reembolso íntegro de su primera suscripción dentro de los primeros 15 días naturales de uso si la plataforma no cumple con sus expectativas. Pasado este plazo, no se emitirán reembolsos por periodos parciales utilizados. Solemia se reserva el derecho de cancelar cuentas en caso de fraude o violación a estos términos.</p>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '800' }}>5. Nivel de Servicio (SLA)</h3>
        <p>Solemia hace esfuerzos razonables para mantener la plataforma operativa 24/7. Sin embargo, al depender de infraestructuras en la nube de terceros y proveedores de modelos de lenguaje subyacentes, no garantizamos una disponibilidad ininterrumpida o libre de errores temporales.</p>
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

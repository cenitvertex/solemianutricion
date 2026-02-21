import React, { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const WelcomeTour = ({ isOpen, onComplete }) => {
    useEffect(() => {
        if (!isOpen) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            popoverClass: 'solemia-tour-popover',
            nextBtnText: 'Siguiente',
            prevBtnText: 'Atrás',
            doneBtnText: '¡Entendido!',
            progressText: 'Paso {{current}} de {{total}}',
            onDeselected: () => {
                // Si el usuario hace clic fuera o cierra, completamos el tour para que no buclee
                onComplete();
            },
            onDestroyed: () => {
                onComplete();
            },
            steps: [
                {
                    element: null, // Centrado
                    popover: {
                        title: '✨ ¡Bienvenida a Solemia Nutrición!',
                        description: 'Estamos muy emocionados de acompañarte en la digitalización de tu consultorio. Este breve recorrido te enseñará a dominar tu nueva plataforma en segundos.',
                        position: 'center'
                    }
                },
                {
                    element: '.tour-metrics',
                    popover: {
                        title: '📊 El Pulso de tu Clínica',
                        description: 'Aquí verás tus métricas clave: pacientes agendados, ventas y crecimiento. Todo de un vistazo para que tomes mejores decisiones.',
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '.tour-search',
                    popover: {
                        title: '🔍 Directorio Inteligente',
                        description: 'Encuentra a cualquier paciente al instante. Puedes filtrar por nombre o ver quién ha tenido actividad reciente con un solo clic.',
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '.tour-add-patient',
                    popover: {
                        title: '🤖 Potencia tu Consulta con IA',
                        description: 'Agrega un paciente aquí para comenzar. Nuestra IA analizará su expediente y te dará resúmenes clínicos de alta precisión automáticamente.',
                        side: "bottom",
                        align: 'end'
                    }
                },
                {
                    element: '.tour-settings',
                    popover: {
                        title: '⚙️ Tu Consultorio, Tus Reglas',
                        description: 'Personaliza tu perfil, gestiona tu suscripción y ajusta cómo quieres que tu asistente de IA te ayude cada día.',
                        side: "left",
                        align: 'start'
                    }
                },
                {
                    element: null,
                    popover: {
                        title: '🚀 ¡Todo listo para brillar!',
                        description: 'Ya conoces lo básico. Recuerda que puedes volver a ver este tutorial en la sección de configuración en cualquier momento.',
                        position: 'center'
                    }
                }
            ]
        });

        driverObj.drive();

        // Cleanup al desmontar
        return () => {
            driverObj.destroy();
        };
    }, [isOpen]);

    return null; // El tour se maneja por DOM externo, no renderiza nada el componente en sí
};

export default WelcomeTour;

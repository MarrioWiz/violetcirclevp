# V de Gowin — trazabilidad del proyecto

**Pregunta central:** ¿Cómo puede una plataforma digital apoyar a las mujeres estudiantes de la UVP a identificar, reportar y recibir orientación ante situaciones de acoso o violencia digital, con base en un diagnóstico real de la comunidad universitaria?

Docente: Edgar Cardona Sierra · Problemática Social Contemporánea · 7.º semestre, grupo 7C · ISTI, UVP.

## Pregunta → principios → funciones → hallazgos

| Parte de la pregunta | Principio (marco conceptual) | Función en la app | Hallazgo del cuestionario que la justifica |
|---|---|---|---|
| **Identificar** | La violencia digital es una extensión de la violencia de género. | Orientación guiada "¿Esto es violencia digital?" (árbol de decisión offline, 8 tipos + riesgo). Biblioteca "Aprende y cuídate" (10 artículos). | P10–P11: dudan si lo que viven es violencia digital. |
| **Identificar** | Prevención. | Autoevaluación de seguridad digital con resultado cualitativo. Guía de seguridad de cuentas. | P14: "biblioteca de autocuidado digital". |
| **Reportar / documentar** | Información clara sobre canales reduce la revictimización. | Bitácora privada cifrada con evidencia, hash SHA-256 y PDF exportable. | P9: reportar en plataforma, denuncia formal; P11: miedo y desconocimiento. |
| **Reportar** | Protección. | Guías de bloqueo, reporte y privacidad en WhatsApp, Instagram, TikTok, Facebook y correo/otras. | P5: plataformas donde más ocurre. |
| **Recibir orientación** | Información + apoyo. | Guía de primeros pasos (evidencia, cuentas, evitar riesgos). Rutas formales con "qué esperar". Directorio verificado. | P8: a quién acuden; P10: no conocen canales. |
| **Recibir orientación** | Apoyo (chat). | Conversación guiada rotulada como asistente informativo (no persona ni profesional). | P14: "chat de orientación y apoyo". |
| **Círculo de confianza** | Las redes de apoyo entre pares fortalecen la respuesta. | Círculo de 1–5 contactos local y cifrado; plantillas; "Cómo acompañar" para compartir. | P8: acuden a amigas y familia; P13–P14: "red de contactos de confianza". |
| **Respuesta rápida** | Protección. | "Necesito ayuda ahora": alerta en 3 toques (Mensajes/WhatsApp con texto listo, 911, bitácora). | P13–P14: "botón de reporte/alerta rápida". |
| **Seguridad percibida** | Prevención + protección. | PIN/Face ID, bloqueo automático, pantalla de privacidad, salida rápida a calculadora, notificaciones discretas, borrado total. | P15: privacidad, discreción, control de sus datos. |
| **Plataforma** | Accesibilidad. | iPhone primero (Expo Go/TestFlight/PWA) y Android sin cambios. | P12: sistema operativo del móvil. |

## Alcances y límites reflejados en la app

| Límite | Dónde se ve |
|---|---|
| No es servicio de emergencia | Onboarding, franja fija del 911 en Inicio y Directorio, Ajustes, Acerca de. |
| No sustituye denuncia, atención psicológica, jurídica ni autoridades | Aviso de alcance (onboarding, Inicio, Ajustes); resultado de la orientación. |
| Orientación inicial | Textos de resultados: "orientativo, no es un diagnóstico legal". |
| Directorio verificado | Solo se muestran entradas `verified: true` con fuente y fecha; el resto se marca "estamos verificando". |
| Alcance UVP | Copy dirigido a la comunidad UVP; categoría "Dentro de la UVP" en el directorio. |

## Datos del problema (fuente del proyecto)

- MOCIBA 2024 (INEGI): 21.0 % de usuarias/os de internet de 12+ años vivió ciberacoso; 22.2 % en mujeres; Puebla 23.4 %.
- ENDIREH 2021 (INEGI): 20.2 % de mujeres reporta violencia en el ámbito escolar.

# Guía de Extracción para Agente Nutricional (Solemia)

Esta guía define el estándar de información que el Agente IA debe extraer de los documentos del paciente (Expediente Clínico y Plan Nutricional) para poblar los campos del sistema de manera eficiente y profesional.

---

## 1. Análisis y Resumen
**Columna DB:** `objective_and_params`

El agente debe sintetizar la información en dos bloques claros: **Resumen** (Estado actual y progreso) y **Análisis** (Interpretación clínica).

### Estándar de Contenido:
- **Resumen (Snapshot):**
    - Fase del tratamiento: (Ej. Inicial, Seguimiento, Mantenimiento).
    - Meta principal: (Ej. Pérdida de grasa, Aumento de masa muscular, Control glucémico).
    - Nivel de adherencia: (Si se menciona en seguimientos previos).
- **Análisis (Criterio Profesional):**
    - Evaluación de indicadores antropométricos (IMC, % grasa, peso) y tendencias.
    - Observaciones sobre marcadores bioquímicos relevantes (Glucosa, Triglicéridos, etc.).
    - Relación entre hábitos reportados y el plan actual.

**Ejemplo de salida:**
> **| Resumen |** Paciente en fase de seguimiento con enfoque en recomposición corporal. Reporta alta adherencia al plan previo. Meta: Reducir % de grasa abdominal.
> 
> **| Análisis |** Presenta una disminución de 1.5kg de masa grasa con mantenimiento de masa muscular. Glucosa en ayunas estable (95 mg/dL). Se observa mejora en la digestión al eliminar lácteos. El plan actual prioriza el aumento de fibra y proteínas magras.

---

## 2. Condiciones y Alergias
**Columna DB:** `allergies` (Tipo: JSONB Array)

Este campo es crítico para la seguridad del paciente. El agente debe identificar no solo alergias, sino también condiciones médicas que dicten exclusiones alimentarias.

### Categorías de Extracción:
1. **Diagnósticos Médicos:** (Ej. Diabetes Tipo 2, Hipotiroidismo, Hipertensión).
2. **Alergias (IgE):** Reacciones graves (Ej. Cacahuates, Mariscos).
3. **Intolerancias / Sensibilidades:** (Ej. Lactosa, Gluten no celíaco).
4. **Restricciones por Medicación:** Alimentos prohibidos por interacción con fármacos.

**Instrucción para el Agente:**
Extraer únicamente los términos técnicos o nombres de alimentos/condiciones. Si no se encuentran, dejar vacío.

**Ejemplo de salida (Formato Array):**
`["Diabetes Tipo 2", "Hipertensión", "Intolerancia a la Lactosa", "Alergia a las Nueces"]`

---

## Directrices de Eficiencia para el Agente (Prompting)
- **Claridad ante todo:** No usar lenguaje vago. Ser específico con cifras y términos médicos si aparecen en el documento.
- **Formato Consistente:** Mantener siempre la estructura de "Resumen" y "Análisis" separada por encabezados claros.
- **Nivel de detalle:** El nutricionista debe poder entender el estado de la paciente en menos de 10 segundos de lectura.

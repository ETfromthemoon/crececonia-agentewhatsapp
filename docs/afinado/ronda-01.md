# Ronda 01 — Descubrimiento (voz de marca, servicios, calificación)

> Objetivo de la ronda: capturar lo esencial de la marca de Sergio para escribir la primera
> versión "real" del system prompt, las FAQs base y las reglas de calificación de leads.

## Preguntas (responder en este mismo archivo o por chat)

### A) Sobre ti y la marca
1. ¿Cómo te presentas en una frase? (qué haces y para quién)
2. ¿Qué tono quieres? (cercano/formal, tú/usted, con/sin emojis, longitud típica)
3. 3-5 ejemplos de cómo hablas tú (frases o respuestas reales que suenen a ti).
4. ¿Hay cosas que el agente NUNCA debe decir o prometer?

### B) Servicios y oferta
5. ¿Qué ofreces exactamente? (formaciones, consultoría, charlas, mentorías, productos…)
6. ¿Precios o rangos? ¿El agente puede mencionarlos o mejor derivar a llamada?
7. ¿Cuál es tu cliente ideal? ¿Y a quién NO quieres como cliente?

### C) Calificación de leads
8. ¿Qué hace que un lead sea "bueno" para ti? (señales de interés real)
9. ¿Qué datos quieres capturar sí o sí? (nombre, email, necesidad, presupuesto, plazo…)
10. ¿Cuándo es momento de ofrecer la llamada de Cal.com?

### D) Agenda y escalado
11. ¿Duración y tipo de la llamada? (15/30 min, descubrimiento, etc. → `eventTypeId` de Cal.com)
12. ¿Cuándo quieres que el agente te escale a ti? (casos, palabras clave, enfado…)

### E) Conocimiento (RAG)
13. URLs de tu web/blog a indexar (y/o sitemap).
14. PDFs/guías/materiales que quieras que el agente conozca.
15. 10-15 preguntas frecuentes reales que te llegan por WhatsApp.

## Respuestas (decisiones tomadas)

- **A1 Posicionamiento:** beneficio/venta → "Ayudamos a PYMEs a ahorrar horas y vender más con IA aplicada".
- **A2 Tono:** tú + emojis con moderación + mensajes muy cortos (1-3 frases).
- **A3 Voz:** mezcla motivador + didáctico para el contenido; cierres comerciales suaves.
- **A4 Nunca:** todas las barreras (no inventar precios/plazos ni garantizar resultados; no
  criticar competidores; no consejo legal/fiscal/médico; no datos de terceros; no prometer de más).
- **B5 Oferta:** consultoría e implementación de IA; cursos básicos (PDF ahora, video pronto);
  guías y "skills" de regalo.
- **B6 Precios:** no dar precio en el chat; calificar y derivar a llamada.
- **B7 Cliente ideal:** PYMEs que quieren implementar/automatizar con IA.
- **C8 Señales de buen lead:** todas (problema concreto, urgencia, decisor/presupuesto, pregunta
  por cómo trabajamos/precio, rol/empresa).
- **C9 Datos a capturar:** nombre + necesidad + email (con permiso) + **web o redes sociales**.
- **C10 Llamada:** ofrecer SOLO a potenciales clientes con presupuesto e interés reales.
- **D11 Escalado:** todas las situaciones (piden persona, enfado/queja, oportunidad grande/empresa,
  tema sensible/fuera de alcance, propuesta a medida).
- **D12 Conocimiento (RAG):** todo en https://www.crececonia.cl + Instagram @crececoniacl.
- **D13 FAQs:** están en crececonia.cl (se obtendrán en la ingesta de RAG).
- **Alcance de marca:** captar email (con permiso) para la newsletter + ofrecer recurso de regalo +
  invitar a seguir @crececoniacl.

## Cambios derivados (implementados)

- `src/brain/prompt.ts`: persona reescrita (Crececonia, es-CL, todas las decisiones anteriores).
- `src/config.ts`: `DEFAULT_TIMEZONE = America/Santiago`; nuevo `BRAND` (nombre, web, instagram).
- `src/brain/tools.ts` + `src/db/leads.ts` + `migrations/0001_init.sql`: campo `web_o_redes` /
  columna `web_socials` para capturar web/redes del lead.
- `src/rag/sources.ts`: fuentes de RAG (crececonia.cl + sitemap + Instagram) con nota del 403.

## Pendiente de Sergio
- FAQs y contenido real: la web bloquea fetchers (403). Para el RAG: dar acceso (User-Agent /
  Browser Rendering) o pegar el contenido clave (servicios, FAQs, cursos).

# Adivina la figura · CirculArte Lab

Juego de observación: identifica una silueta mientras 60 círculos de Fourier dibujan su contorno.

## Probar

Sin instalar dependencias, abre `jugar.html` en Chrome o Edge. Para trabajar con los módulos separados:

```sh
npm start
```

Abre http://127.0.0.1:4173. Requiere Node.js 20 o superior para el servidor local.

## Reglas

- Cinco rondas de 18 segundos, elegidas entre diez figuras.
- Cuatro opciones por ronda; también puedes responder con las teclas 1–4.
- Puntos al acertar: `max(100, round(1000 - segundos × 40) - errores × 100 - (pista ? 150 : 0))`.
- Respuesta incorrecta: elimina la opción y resta 100 a la recompensa posible.
- Pista: elimina una opción incorrecta, muestra una pista y resta 150.
- Tiempo agotado: 0 puntos. La mejor partida se guarda en este navegador.
- La partida se pausa si cambias de pestaña. Escape pausa o reanuda.

## Código

| Archivo | Responsabilidad |
| --- | --- |
| `dist/index.html` | Pantalla y explicación «Cómo funciona». |
| `dist/style.css` | Diseño adaptable a móvil. |
| `dist/engine.js` | Contornos, remuestreo, Fourier y cálculo de puntos. |
| `dist/game.js` | Estado, rondas, reloj, respuestas y render en Canvas. |
| `serve.mjs` | Servidor HTTP local, sin dependencias. |
| `scripts/build-standalone.mjs` | Regenera `jugar.html` desde los archivos de `dist/`. |

Flujo de juego: `begin → startRound → tick/draw → answer → endRound → finish`.

El motor es una implementación didáctica del mismo principio matemático utilizado por [CirculArte](https://github.com/elporter17/estudio-epiciclos); no necesita imágenes ni servicios externos. La fuente de Google Fonts es opcional y tiene fuentes de respaldo.

## TikTok Mini Games

Esta versión es un **prototipo web**, no un paquete listo para TikTok Mini Games. La Content Posting API para subir videos no publica juegos.

Para publicar el juego hay que adaptar el render, ciclo de vida y almacenamiento al runtime y SDK de TikTok, preparar el paquete requerido y completar la verificación del publicador y la revisión del juego. No contiene claves, tokens, integración de anuncios, compras ni seguimiento.

- [Flujo oficial](https://developers.tiktok.com/docs/en/mini-games-integration-workflow)
- [SDK oficial](https://developers.tiktok.com/docs/en/mini-games-sdk-overview)

## Verificación

El prototipo se comprobó en navegador: partida de cinco rondas, errores, pistas, pausa, aciertos, resultado, reinicio y tiempo agotado. Se verificaron la sintaxis JavaScript, las curvas de las diez figuras y la fórmula de puntuación.

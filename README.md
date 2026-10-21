# Carta — crea el menú de tu restaurante

Carta es una app web pensada para el móvil que permite diseñar el menú de un restaurante en cuatro pasos:

1. **Fondo** — sube una foto desde tu galería o cámara, elige uno de los fondos predeterminados (pizarra, madera, mármol, kraft, esmeralda, terracota) o un color liso. Ajusta una capa para oscurecer o aclarar la foto y, si quieres, añade tu logo.
2. **Platos** — escribe el nombre del restaurante, un subtítulo y un pie de página. Añade platos con nombre y precio (el precio se alinea a la derecha), descripciones opcionales y secciones (Entrantes, Postres…). También puedes pegar una lista completa de golpe.
3. **Estilo** — estilos rápidos de un toque, formato (historia 9:16, vertical 4:5, A4 o cuadrado), 16 fuentes, tamaños, espaciados, márgenes, alineación, colores, moneda, puntos o línea entre plato y precio, sombra y recuadro translúcido.
4. **Guardar** — exporta el menú como imagen en alta calidad y guárdalo en la galería (o descárgalo).

Todo lo que añades se guarda automáticamente como borrador: al volver a abrir la app encuentras tu menú tal como lo dejaste.

## Tecnologías

- [TanStack Start](https://tanstack.com/start) + React 19 + Tailwind CSS 4
- Renderizado en `<canvas>`: la vista previa y la imagen exportada usan el mismo código
- **Netlify Database** (Postgres + Drizzle ORM) para los borradores
- **Netlify Blobs** para las fotos y logos subidos
- **Netlify Image CDN** para servir los fondos predeterminados optimizados

## Desarrollo local

```bash
pnpm install
netlify dev     # emula Database, Blobs e Image CDN localmente
```

Si cambias `db/schema.ts`, genera una migración con:

```bash
npx drizzle-kit generate --name <descripcion_del_cambio>
```

Las migraciones se aplican automáticamente al desplegar en Netlify.

## Ideas para el futuro

- Varios menús guardados por dispositivo (lista de borradores)
- Cuentas de usuario para editar el mismo menú desde varios dispositivos
- Arrastrar para reordenar platos y mover bloques de texto directamente sobre la imagen

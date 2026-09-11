# Bingo grego

App web para crear cartóns de bingo imprimíbeis co alfabeto grego e xogar cun bombo interactivo na aula.

Autor: Alejandro Morón Bandín  
Ano: 2026  
Licenza: MIT

## Que inclúe

- Bombo de letras gregas con maiúsculas e minúsculas.
- Historial de extraccións e taboleiro visual de letras xa saídas.
- Xerador de cartóns imprimíbeis con semente reproducíbel.
- Folios A4 verticais con series de 10 cartóns clásicos 3x9.
- Número total de cartóns en múltiplos de 10, cun mínimo de 10.
- Letras maiúsculas e minúsculas mesturadas.
- Opción para mostrar ou ocultar o nome das letras nos cartóns.
- Impresión optimizada en A4 apaisado, gardábel como PDF desde o navegador.
- Publicación directa en GitHub Pages sen servidor Python.

## Uso

Abre `index.html` no navegador ou serve o cartafol do proxecto cun servidor local:

```bash
npm run dev
```

Despois visita:

```text
http://localhost:5173
```

Para crear un PDF, entra en **Cartóns**, indica cantos cartóns queres e usa **Imprimir / PDF**. No diálogo do navegador escolle "Gardar como PDF".

## GitHub Pages

O repositorio inclúe un workflow en `.github/workflows/deploy.yml`. Para activalo:

1. Vai a **Settings > Pages** no repositorio de GitHub.
2. Escolle **GitHub Actions** como fonte de publicación.
3. Fai push a `main`.

## Desenvolvemento

Esta versión é unha app estática con JavaScript modular e CSS, sen dependencias de runtime nin paso de build obrigatorio.

Comprobar sintaxe:

```bash
npm run build
```

Estrutura principal:

- `index.html`: estrutura da app.
- `src/main.js`: interacción e renderizado.
- `src/caller.js`: lóxica do bombo.
- `src/cards.js`: xeración dos cartóns.
- `src/alphabet.js`: alfabeto grego.
- `src/random.js`: xeración determinista con semente.
- `src/styles.css`: interface.
- `src/print.css`: saída imprimíbel.

## Versión Streamlit

O ficheiro `app.py` conserva a primeira versión en Streamlit con xeración de PDF mediante ReportLab. A versión recomendada para uso e publicación é a app estática.

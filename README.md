# LP Imóvel | Directcon Consórcios

Protótipo local responsivo em React, baseado na copy de imóvel, no Sistema Visual Digital da Directcon e nos componentes extraídos de produção.

## Executar

```powershell
npm install
npm run dev
```

Abra `http://127.0.0.1:5178` ou a URL indicada pelo Vite.

Para gerar a versão estática:

```powershell
npm run build
```

Os arquivos são gravados em `dist/`.

## Estrutura

- `src/main.jsx`: conteúdo, seções e interações da LP.
- `src/styles.css`: sistema visual e comportamento responsivo.
- `src/components/testimonials-data.js`: copies, fotos e enquadramento dos depoimentos da seção `Quem já está dentro de casa`. Os cards reusam o `.photo-card` da jornada.
- `src/components/Comparador.tsx`: adaptação local do comparador usado em produção.
- `src/components/Simulador.tsx`: adaptação local do simulador usado em produção.
- `src/components/SmoothHeroZoomOverride.tsx`: comportamento do hero usado em produção.
- `src/components/BarsContainerLoadOverride.tsx`: comportamento de entrada das barras usado em produção.
- `public/assets/`: fotos, logos e fontes carregadas localmente.

## Breakpoints validados

- Phone: 390 px e limite de 809 px.
- Tablet: 810 px e limite de 1199 px.
- Desktop: 1200 px e 1440 px.

O QA incluiu ausência de overflow horizontal, carregamento de fontes e imagens, menu mobile, acordeões, sliders, campos da estimativa, crop de imagens e destino dos CTAs.

## Antes de publicar

- Completar os dados regulatórios da administradora parceira e os canais oficiais.
- Remover `noindex, nofollow` do `index.html` somente quando a versão estiver aprovada para indexação.
- Confirmar as condições e premissas comerciais do comparador com a operação.

## Fotos dos depoimentos

As fotos vieram como PNG de 1,3 a 1,8 MB e foram reduzidas para 640 px de largura em webp — o card renderiza 320 x 270:

```powershell
ffmpeg -y -i henrique.png -vf "scale=640:-2:flags=lanczos" -c:v libwebp -quality 82 -compression_level 6 public/assets/henrique.webp
```

Resultado: 1,5 MB para 19 kB (Henrique), 1,8 MB para 23 kB (Guilherme) e 1,3 MB para 25 kB (André).

## Tailwind

Instalado e configurado (`@tailwindcss/vite`, alias `@`, `components.json`, `src/lib/utils.ts`, `src/tailwind.css`) para receber componentes da 21st.dev/shadcn em `src/components/ui/`. **Hoje nenhum componente usa**: os depoimentos passaram a seguir o `.photo-card` da própria LP, então `src/tailwind.css` não é importado por ninguém. A infra ficou de pé para o próximo componente externo; se não houver, dá para remover as quatro dependências e os arquivos acima sem tocar em mais nada.

Para instalar um componente da 21st.dev:

```powershell
$env:API_KEY_21ST = "sua-chave"
npx @21st-dev/cli add <autor>/<componente>
```

O registry exige a chave; sem ela responde `authentication_required`. Ao voltar a usar Tailwind, reimporte `./tailwind.css` em `src/main.jsx` antes de `./styles.css`.

## Observação de origem

Os arquivos de `C:/Users/mateu/Desktop/Directcon/codigo-producao` foram usados como fonte de comportamento e permaneceram inalterados. Este protótipo foi criado em uma pasta separada.

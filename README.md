# Astro (client:load) でコンポーネントが二重に表示された

## 再現方法

```
git clone https://github.com/omasakun/astro-notes-01.git
cd astro-notes-01
pnpm install
pnpm dev
```

結果:
- `localhost:8137/ok` : Hello が一回表示される
- `localhost:8137/dup` : Hello が二回表示される

## 原因

p要素の中にdiv要素があり、想定通りでないDOMが生成されたことが原因。

問題の`/dup`ではp要素の中に`<Hello />`が入っており、`<Hello />`は`<div>Hello</div>`を返すコンポーネントとして定義されている。

ところでp要素を閉じるまでの間に他のブロックレベル要素がパースされた場合、自動的に段落を閉じるという仕様がある。[^1][^2] そのため、Astroにより生成されたHTMLや、そこから作られるDOM (ChromeでJSを無効化して`/dup`を開いて確認した) は下に示すようになる。（本題でない部分は省略した）

このように`<div>Hello</div>`はパース時に`<p>...</p>`の外に出てしまうため、ハイドレーション後に`<astro-island>`が表示するHelloと、`<p>...</p>`の外に出たHelloの両方が表示され、二重になってしまう。




元の Astro:
```astro
---
import { Hello } from "src/components/Hello";
---

<body>
  <p>
    <Hello client:load />
  </p>
</body>
```

生成されたHTML:
```html
<body>
  <p>
    <astro-island>
      <div>Hello</div>
    </astro-island>
  </p>
</body>
```

パース後:
```html
<body>
  <p>
    <astro-island></astro-island>
  </p>
  <div>Hello</div>
  <p></p>
</body>
```

ハイドレーション後:
```html
<body>
  <p>
    <astro-island>
      <div>Hello</div>
    </astro-island>
  </p>
  <div>Hello</div>
  <p></p>
</body>
```


## まとめ

要素が意図せず二重に表示されるのは、自動的にタグが閉じられているせいかもしれない。

その時は、正しくない要素の入れ子になっていないか確かめると良い。

[^1]: Paragraphs are block-level elements, and notably will automatically close if another block-level element is parsed before the closing \</p> tag. ([MDN](https://developer.mozilla.org/ja/docs/Web/HTML/Element/p))

[^2]: A p element's end tag may be omitted if the p element is immediately followed by an address, article, aside, blockquote, details, div, dl, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hgroup, hr, main, menu, nav, ol, p, pre, search, section, table, or ul element, or if there is no more content in the parent element and the parent element is an HTML element that is not an a, audio, del, ins, map, noscript, or video element, or an autonomous custom element. ([HTML Living Standard](https://html.spec.whatwg.org/multipage/syntax.html#optional-tags))
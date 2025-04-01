import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh">
      <Head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🎭</text></svg>" />
        <meta name="description" content="脱口秀AI智能体，基于自压缩DID技术" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 
// frontend/src/components/Layout.jsx
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, title = "楽々省エネ計算 | 建築設計者のための省エネ計算ツール" }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="複雑化する省エネ法を、シンプルに。建築設計者の負担を軽減し、本来の創造的な設計業務に集中できる省エネ計算ツール by Archi-Prisma Design works" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="省エネ計算,BEI計算,建築物省エネ法,建築設計,エネルギー計算,Archi-Prisma" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
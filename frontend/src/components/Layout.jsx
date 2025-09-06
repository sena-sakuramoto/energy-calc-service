// frontend/src/components/Layout.jsx
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import SEOHead from './SEOHead';

export default function Layout({ 
  children, 
  title,
  description,
  keywords,
  url
}) {
  return (
    <>
      <SEOHead 
        title={title}
        description={description}
        keywords={keywords}
        url={url}
      />
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
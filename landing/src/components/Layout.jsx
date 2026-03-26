import Header from './Header';
import Footer from './Footer';
import SEOHead from './SEOHead';

export default function Layout({
  children,
  title,
  description,
  keywords,
  path,
}) {
  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        path={path}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}

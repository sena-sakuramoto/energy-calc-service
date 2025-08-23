// frontend/src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-secondary-dark py-6 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} 省エネ計算サービス. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
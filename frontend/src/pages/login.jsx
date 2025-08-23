// frontend/src/pages/login.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// バリデーションスキーマ
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('メールアドレスの形式が正しくありません')
    .required('メールアドレスは必須です'),
  password: Yup.string()
    .required('パスワードは必須です'),
});

export default function Login() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const success = await login(values.email, values.password);
      if (success) {
        router.push('/projects');
      } else {
        setError('ログインに失敗しました。メールアドレスかパスワードが正しくない可能性があります。');
      }
    } catch (error) {
      setError('エラーが発生しました。しばらくしてからもう一度お試しください。');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded">
            {error}
          </div>
        )}
        
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-1 font-medium">
                  メールアドレス
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block mb-1 font-medium">
                  パスワード
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md"
              >
                {isSubmitting ? 'ログイン中...' : 'ログイン'}
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="mt-4 text-center">
          <p>
            アカウントをお持ちでない方は
            <Link href="/register" className="text-primary hover:underline">
              こちら
            </Link>
            から登録
          </p>
        </div>
      </div>
    </Layout>
  );
}
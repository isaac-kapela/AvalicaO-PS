import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import AdminPanel from '../../components/AdminPanel';

export default function AdminPainel() {
  const router = useRouter();
  const [pin, setPin] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pin');
    if (!saved) {
      router.replace('/admin');
    } else {
      setPin(saved);
    }
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem('admin_pin');
    router.push('/admin');
  }

  if (!pin) {
    return (
      <Layout title="Admin">
        <div className="card"><p>Verificando acesso...</p></div>
      </Layout>
    );
  }

  return (
    <Layout title="Painel Admin">
      <AdminPanel pin={pin} onLogout={handleLogout} />
    </Layout>
  );
}

import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { AdminPage } from './pages/AdminPage';
import { CatalogPage } from './pages/CatalogPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

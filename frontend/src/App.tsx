import { RouterProvider } from 'react-router-dom';
import { router } from './router/index';
import { AuthProvider } from './modules/auth/AuthContext';

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

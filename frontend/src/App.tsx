import { RouterProvider } from 'react-router-dom';
import { router } from './router/index';

export function App() {
  return <RouterProvider router={router} />;
}

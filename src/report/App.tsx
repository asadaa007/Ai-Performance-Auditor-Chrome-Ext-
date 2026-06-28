import { RouterProvider, createHashRouter } from 'react-router-dom';
import { reportRoutes } from '@report/navigation/reportRoutes';

const router = createHashRouter(reportRoutes);

export function App() {
  return <RouterProvider router={router} />;
}

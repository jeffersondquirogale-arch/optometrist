import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { PatientListPage } from '../modules/patients/PatientListPage';
import { PatientNewPage } from '../modules/patients/PatientNewPage';
import { ConsultationNewPage } from '../modules/consultations/ConsultationNewPage';
import { PrintConsultationPage } from '../modules/print-template/PrintConsultationPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <PatientListPage />,
      },
      {
        path: 'patients/new',
        element: <PatientNewPage />,
      },
      {
        path: 'consultations/new',
        element: <ConsultationNewPage />,
      },
    ],
  },
  {
    path: '/print/consultations/:id',
    element: <PrintConsultationPage />,
  },
]);

import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { LoginPage } from '../modules/auth/LoginPage';
import { ForbiddenPage } from '../modules/auth/ForbiddenPage';
import { PatientListPage } from '../modules/patients/PatientListPage';
import { PatientNewPage } from '../modules/patients/PatientNewPage';
import { PatientDetailPage } from '../modules/patients/PatientDetailPage';
import { PatientHistoryPage } from '../modules/patients/PatientHistoryPage';
import { PatientEvolutionPage } from '../modules/patients/PatientEvolutionPage';
import { ConsultationFormPage } from '../modules/consultations/ConsultationFormPage';
import { ConsultationDetailPage } from '../modules/consultations/ConsultationDetailPage';
import { ConsultationListPage } from '../modules/consultations/ConsultationListPage';
import { AppointmentListPage } from '../modules/appointments/AppointmentListPage';
import { PrintConsultationPage } from '../modules/print-template/PrintConsultationPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <PatientListPage />,
          },
          {
            path: 'patients/:id',
            element: <PatientDetailPage />,
          },
          {
            path: 'patients/:id/history',
            element: <PatientHistoryPage />,
          },
          {
            path: 'patients/:id/evolution',
            element: <PatientEvolutionPage />,
          },
          {
            path: 'appointments',
            element: <AppointmentListPage />,
          },
          // Rutas restringidas a ADMIN y STAFF (creación/edición de pacientes)
          {
            element: <RoleGuard roles={['ADMIN', 'STAFF']} />,
            children: [
              {
                path: 'patients/new',
                element: <PatientNewPage />,
              },
            ],
          },
          // Rutas restringidas a ADMIN y DOCTOR (gestión clínica)
          {
            element: <RoleGuard roles={['ADMIN', 'DOCTOR']} />,
            children: [
              {
                path: 'consultations',
                element: <ConsultationListPage />,
              },
              {
                path: 'consultations/new',
                element: <ConsultationFormPage mode="new" />,
              },
              {
                path: 'consultations/:id',
                element: <ConsultationDetailPage />,
              },
              {
                path: 'consultations/:id/edit',
                element: <ConsultationFormPage mode="edit" />,
              },
            ],
          },
        ],
      },
      // Impresión restringida a ADMIN y DOCTOR
      {
        element: <RoleGuard roles={['ADMIN', 'DOCTOR']} />,
        children: [
          {
            path: '/print/consultations/:id',
            element: <PrintConsultationPage />,
          },
        ],
      },
    ],
  },
]);

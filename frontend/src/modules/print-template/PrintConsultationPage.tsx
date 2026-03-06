import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { printApi, Consultation } from '../../services/api';
import '../../styles/print.css';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatOptical(value?: number) {
  if (value === undefined || value === null) return '';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

export function PrintConsultationPage() {
  const { id } = useParams<{ id: string }>();

  const { data: consultation, isLoading, error } = useQuery<Consultation>({
    queryKey: ['print-consultation', id],
    queryFn: () => printApi.getConsultation(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Cargando datos de la consulta...
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        No se pudo cargar la consulta. Verifique el ID e intente nuevamente.
      </div>
    );
  }

  const { patient, doctor, lensometry, visualAcuity, finalFormula } = consultation;

  return (
    <div className="print-page">
      {/* Encabezado */}
      <div className="print-header">
        <div className="print-header__clinic">
          <h1>{doctor.clinicName ?? 'Clínica Óptica'}</h1>
          {doctor.clinicAddress && <p>{doctor.clinicAddress}</p>}
          {doctor.clinicPhone && <p>Tel: {doctor.clinicPhone}</p>}
        </div>
        <div className="print-header__doctor">
          <strong>Dr./Dra. {doctor.user.name}</strong>
          <p>Matrícula N.° {doctor.licenseNumber}</p>
          {doctor.specialty && <p>{doctor.specialty}</p>}
        </div>
      </div>

      <div className="print-doc-title">Ficha de Consulta Oftalmológica</div>

      {/* Datos del paciente */}
      <div className="print-section">
        <div className="print-section__title">Datos del Paciente</div>
        <div className="print-section__body">
          <div className="print-field-row">
            <div className="print-field">
              <div className="print-field__label">Apellido y Nombre</div>
              <div className="print-field__value">
                {patient.lastName}, {patient.firstName}
              </div>
            </div>
            <div className="print-field">
              <div className="print-field__label">Documento</div>
              <div className="print-field__value">{patient.documentId ?? ''}</div>
            </div>
            <div className="print-field">
              <div className="print-field__label">Fecha de Nac.</div>
              <div className="print-field__value">{formatDate(patient.birthDate)}</div>
            </div>
          </div>
          <div className="print-field-row">
            <div className="print-field">
              <div className="print-field__label">Teléfono</div>
              <div className="print-field__value">{patient.phone ?? ''}</div>
            </div>
            <div className="print-field">
              <div className="print-field__label">Email</div>
              <div className="print-field__value">{patient.email ?? ''}</div>
            </div>
            <div className="print-field">
              <div className="print-field__label">Ocupación</div>
              <div className="print-field__value">{patient.occupation ?? ''}</div>
            </div>
          </div>
          <div className="print-field-row">
            <div className="print-field">
              <div className="print-field__label">Dirección</div>
              <div className="print-field__value">{patient.address ?? ''}</div>
            </div>
            <div className="print-field">
              <div className="print-field__label">Fecha de consulta</div>
              <div className="print-field__value">{formatDate(consultation.consultationDate)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivo de consulta */}
      <div className="print-section">
        <div className="print-section__title">Motivo de Consulta</div>
        <div className="print-section__body">
          <div className="print-textarea">{consultation.reason ?? ''}</div>
        </div>
      </div>

      {/* Lensometría */}
      <div className="print-section">
        <div className="print-section__title">Lensometría (Graduación anterior)</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>Esfera</th>
                <th>Cilindro</th>
                <th>Eje</th>
                <th>ADD</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="eye-label">OD (Derecho)</td>
                <td>{lensometry ? formatOptical(lensometry.odSphere) : ''}</td>
                <td>{lensometry ? formatOptical(lensometry.odCylinder) : ''}</td>
                <td>{lensometry?.odAxis ?? ''}</td>
                <td>{lensometry ? formatOptical(lensometry.odAdd) : ''}</td>
                <td rowSpan={2}>{lensometry?.notes ?? ''}</td>
              </tr>
              <tr>
                <td className="eye-label">OI (Izquierdo)</td>
                <td>{lensometry ? formatOptical(lensometry.oiSphere) : ''}</td>
                <td>{lensometry ? formatOptical(lensometry.oiCylinder) : ''}</td>
                <td>{lensometry?.oiAxis ?? ''}</td>
                <td>{lensometry ? formatOptical(lensometry.oiAdd) : ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Agudeza visual */}
      <div className="print-section">
        <div className="print-section__title">Agudeza Visual</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>Sin corrección (SC)</th>
                <th>Con corrección (CC)</th>
                <th>Visión próxima</th>
                <th>PIO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="eye-label">OD</td>
                <td>{visualAcuity?.odScVision ?? ''}</td>
                <td>{visualAcuity?.odCcVision ?? ''}</td>
                <td rowSpan={2}>{visualAcuity?.nearVision ?? ''}</td>
                <td rowSpan={2}>{visualAcuity?.iop ?? ''}</td>
              </tr>
              <tr>
                <td className="eye-label">OI</td>
                <td>{visualAcuity?.oiScVision ?? ''}</td>
                <td>{visualAcuity?.oiCcVision ?? ''}</td>
              </tr>
            </tbody>
          </table>
          {visualAcuity?.notes && (
            <div className="mt-1 text-muted" style={{ fontSize: '9pt' }}>
              {visualAcuity.notes}
            </div>
          )}
        </div>
      </div>

      {/* Fórmula final */}
      <div className="print-section">
        <div className="print-section__title">Fórmula Final Recetada</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>Esfera</th>
                <th>Cilindro</th>
                <th>Eje</th>
                <th>ADD</th>
                <th>Prisma</th>
                <th>DP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="eye-label">OD</td>
                <td>{finalFormula ? formatOptical(finalFormula.odSphere) : ''}</td>
                <td>{finalFormula ? formatOptical(finalFormula.odCylinder) : ''}</td>
                <td>{finalFormula?.odAxis ?? ''}</td>
                <td>{finalFormula ? formatOptical(finalFormula.odAdd) : ''}</td>
                <td>{finalFormula?.odPrism ?? ''}</td>
                <td>{finalFormula?.dpOd ?? ''}</td>
              </tr>
              <tr>
                <td className="eye-label">OI</td>
                <td>{finalFormula ? formatOptical(finalFormula.oiSphere) : ''}</td>
                <td>{finalFormula ? formatOptical(finalFormula.oiCylinder) : ''}</td>
                <td>{finalFormula?.oiAxis ?? ''}</td>
                <td>{finalFormula ? formatOptical(finalFormula.oiAdd) : ''}</td>
                <td>{finalFormula?.oiPrism ?? ''}</td>
                <td>{finalFormula?.dpOi ?? ''}</td>
              </tr>
            </tbody>
          </table>
          {finalFormula && (
            <div className="print-field-row" style={{ marginTop: '3mm' }}>
              <div className="print-field">
                <div className="print-field__label">Tipo de lente</div>
                <div className="print-field__value">{finalFormula.lensType ?? ''}</div>
              </div>
              <div className="print-field">
                <div className="print-field__label">Material</div>
                <div className="print-field__value">{finalFormula.lensMaterial ?? ''}</div>
              </div>
              <div className="print-field">
                <div className="print-field__label">Tratamiento</div>
                <div className="print-field__value">{finalFormula.lensCoating ?? ''}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="print-section">
        <div className="print-section__title">Diagnóstico</div>
        <div className="print-section__body">
          <div className="print-textarea">{consultation.diagnosis ?? ''}</div>
        </div>
      </div>

      {/* Tratamiento */}
      <div className="print-section">
        <div className="print-section__title">Tratamiento Indicado</div>
        <div className="print-section__body">
          <div className="print-textarea">{consultation.treatment ?? ''}</div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="print-section">
        <div className="print-section__title">Observaciones</div>
        <div className="print-section__body">
          <div className="print-textarea">{consultation.observations ?? ''}</div>
        </div>
      </div>

      {/* Firma y sello */}
      <div className="print-signature">
        <div className="print-signature__box">
          <p>Firma y Sello del Profesional</p>
          <p style={{ marginTop: '2mm' }}>Dr./Dra. {doctor.user.name}</p>
          <p>Mat. N.° {doctor.licenseNumber}</p>
        </div>
      </div>

      {/* Pie de página */}
      <div className="print-footer">
        <p>
          Documento generado el {formatDate(new Date().toISOString())} — Sistema de Gestión
          Clínica Óptica (Fase 1)
        </p>
      </div>

      {/* Botón de impresión (oculto en impresión real) */}
      <div className="no-print" style={{ textAlign: 'center', padding: '1rem' }}>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Imprimir
        </button>
      </div>
    </div>
  );
}

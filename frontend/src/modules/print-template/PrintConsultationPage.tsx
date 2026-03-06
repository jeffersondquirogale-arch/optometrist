import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { printApi, Consultation } from '../../services/api';
import '../../styles/print.css';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatOptical(value?: number | null) {
  if (value === undefined || value === null) return '';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

function dash(val?: string | number | null) {
  if (val === undefined || val === null || val === '') return '—';
  return String(val);
}

/** Renders text as form-style lined rows. Empty or absent text still shows blank lines. */
function FormLines({ text, minLines = 2 }: { text?: string | null; minLines?: number }) {
  const trimmed = (text ?? '').trim();
  const lines = trimmed ? trimmed.split('\n') : [];
  const emptyCount = Math.max(0, minLines - lines.length);
  return (
    <div className="print-lines">
      {lines.map((line, i) => (
        <div key={i} className="print-lines__line print-lines__line--content">
          {line || <>&nbsp;</>}
        </div>
      ))}
      {Array.from({ length: emptyCount }).map((_, i) => (
        <div key={`empty-${i}`} className="print-lines__line print-lines__line--empty">&nbsp;</div>
      ))}
    </div>
  );
}

/* ─── Sub-componentes de tabla ────────────────────────────────────────────── */

interface EyeTableProps {
  columns: { header: string; width?: string }[];
  odCells: React.ReactNode[];
  oiCells: React.ReactNode[];
  notesRowspan?: React.ReactNode;
}

function EyeTable({ columns, odCells, oiCells, notesRowspan }: EyeTableProps) {
  return (
    <table className="print-table">
      <thead>
        <tr>
          <th style={{ width: '12mm' }}>Ojo</th>
          {columns.map((col, i) => (
            <th key={i} style={col.width ? { width: col.width } : {}}>
              {col.header}
            </th>
          ))}
          {notesRowspan !== undefined && <th style={{ width: '22%' }}>Obs.</th>}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="eye-label eye-od">OD</td>
          {odCells.map((cell, i) => <td key={i}>{cell}</td>)}
          {notesRowspan !== undefined && (
            <td rowSpan={2} className="notes-cell" style={{ whiteSpace: 'normal' }}>
              {notesRowspan}
            </td>
          )}
        </tr>
        <tr>
          <td className="eye-label eye-oi">OI</td>
          {oiCells.map((cell, i) => <td key={i}>{cell}</td>)}
        </tr>
      </tbody>
    </table>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */

export function PrintConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: consultation, isLoading, error } = useQuery<Consultation>({
    queryKey: ['print-consultation', id],
    queryFn: () => printApi.getConsultation(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Cargando datos de la consulta…
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

  const {
    patient, doctor,
    lensometry, visualAcuity, finalFormula,
    ocularMotility, externalExam, cftaMoscopia,
    keratometry, colorTest, stereopsisTest,
    refraction, subjectiveRefraction,
  } = consultation;

  return (
    <div className="print-page">

      {/* ── Encabezado clínica / doctor ─────────────────────────────────────── */}
      <div className="print-header">
        <div className="print-header__clinic">
          <div className="print-header__clinic-name">
            {doctor.clinicName ?? 'Clínica Óptica'}
          </div>
          {doctor.clinicAddress && (
            <div className="print-header__clinic-detail">{doctor.clinicAddress}</div>
          )}
          {doctor.clinicPhone && (
            <div className="print-header__clinic-detail">Tel.: {doctor.clinicPhone}</div>
          )}
        </div>

        <div className="print-header__center">
          <div className="print-doc-title">Ficha de Consulta Oftalmológica</div>
          <div className="print-header__date-box">
            <span className="print-field__label">Fecha:&nbsp;</span>
            <span className="print-header__date-value">
              {formatDate(consultation.consultationDate)}
            </span>
            {consultation.control && (
              <>
                &ensp;|&ensp;
                <span className="print-field__label">Próx. control:&nbsp;</span>
                <span className="print-header__date-value">{consultation.control}</span>
              </>
            )}
          </div>
        </div>

        <div className="print-header__doctor">
          <div className="print-header__doctor-name">
            Dr./Dra.&nbsp;{doctor.user.name}
          </div>
          <div className="print-header__doctor-detail">
            Mat. N.°&nbsp;{doctor.licenseNumber}
          </div>
          {doctor.specialty && (
            <div className="print-header__doctor-detail">{doctor.specialty}</div>
          )}
        </div>
      </div>

      {/* ── Datos del paciente ───────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Datos del Paciente</div>
        <div className="print-section__body print-patient-grid">
          <div className="print-field print-field--wide">
            <div className="print-field__label">Apellido y Nombre</div>
            <div className="print-field__value">
              {patient.lastName}, {patient.firstName}
            </div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Documento</div>
            <div className="print-field__value">{dash(patient.documentId)}</div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Fecha Nac.</div>
            <div className="print-field__value">{formatDate(patient.birthDate)}</div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Teléfono</div>
            <div className="print-field__value">{dash(patient.phone)}</div>
          </div>
          <div className="print-field print-field--2col">
            <div className="print-field__label">Dirección</div>
            <div className="print-field__value">{dash(patient.address)}</div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Email</div>
            <div className="print-field__value">{dash(patient.email)}</div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Ocupación</div>
            <div className="print-field__value">{dash(patient.occupation)}</div>
          </div>
        </div>
      </div>

      {/* ── Motivo de consulta ───────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Motivo de Consulta</div>
        <div className="print-section__body">
          <FormLines text={consultation.reason} minLines={2} />
        </div>
      </div>

      {/* ── Lensometría ──────────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Lensometría (Graduación Anterior)</div>
        <div className="print-section__body">
          <EyeTable
            columns={[
              { header: 'Esfera', width: '16%' },
              { header: 'Cilindro', width: '16%' },
              { header: 'Eje (°)', width: '14%' },
              { header: 'ADD', width: '14%' },
            ]}
            odCells={[
              formatOptical(lensometry?.odSphere),
              formatOptical(lensometry?.odCylinder),
              lensometry?.odAxis ?? '',
              formatOptical(lensometry?.odAdd),
            ]}
            oiCells={[
              formatOptical(lensometry?.oiSphere),
              formatOptical(lensometry?.oiCylinder),
              lensometry?.oiAxis ?? '',
              formatOptical(lensometry?.oiAdd),
            ]}
            notesRowspan={lensometry?.notes ?? ''}
          />
        </div>
      </div>

      {/* ── Agudeza visual ───────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Agudeza Visual</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '12mm' }}>Ojo</th>
                <th>SC (sin correc.)</th>
                <th>CC (con correc.)</th>
                <th>Vis. Próxima</th>
                <th>PIO</th>
                <th>Vis. Cromática</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="eye-label eye-od">OD</td>
                <td>{visualAcuity?.odScVision ?? ''}</td>
                <td>{visualAcuity?.odCcVision ?? ''}</td>
                <td rowSpan={2}>{visualAcuity?.nearVision ?? ''}</td>
                <td rowSpan={2}>{visualAcuity?.iop ?? ''}</td>
                <td rowSpan={2}>{visualAcuity?.colorVision ?? ''}</td>
              </tr>
              <tr>
                <td className="eye-label eye-oi">OI</td>
                <td>{visualAcuity?.oiScVision ?? ''}</td>
                <td>{visualAcuity?.oiCcVision ?? ''}</td>
              </tr>
            </tbody>
          </table>
          {visualAcuity?.notes && (
            <div className="print-notes">{visualAcuity.notes}</div>
          )}
        </div>
      </div>

      {/* ── Motilidad ocular + Examen externo + CFTA / Moscopia (3 col) ──────── */}
      <div className="print-three-col">
        {/* Motilidad ocular */}
        <div className="print-section">
          <div className="print-section__title">Motilidad Ocular</div>
          <div className="print-section__body">
            <table className="print-table print-table--compact">
              <tbody>
                <tr><th>Versiones</th><td>{dash(ocularMotility?.versions)}</td></tr>
                <tr><th>Ducciones</th><td>{dash(ocularMotility?.ductions)}</td></tr>
                <tr><th>Cover Test</th><td>{dash(ocularMotility?.coverTest)}</td></tr>
                <tr><th>Hirschberg</th><td>{dash(ocularMotility?.hirschberg)}</td></tr>
                <tr><th>NPC</th><td>{dash(ocularMotility?.npc)}</td></tr>
              </tbody>
            </table>
            {ocularMotility?.notes && (
              <div className="print-notes">{ocularMotility.notes}</div>
            )}
          </div>
        </div>

        {/* Examen externo */}
        <div className="print-section">
          <div className="print-section__title">Examen Externo</div>
          <div className="print-section__body">
            <table className="print-table print-table--compact">
              <tbody>
                <tr><th>Párpados</th><td>{dash(externalExam?.eyelids)}</td></tr>
                <tr><th>Conjuntiva</th><td>{dash(externalExam?.conjunctiva)}</td></tr>
                <tr><th>Córnea</th><td>{dash(externalExam?.cornea)}</td></tr>
                <tr><th>Iris</th><td>{dash(externalExam?.iris)}</td></tr>
                <tr><th>Pupila</th><td>{dash(externalExam?.pupil)}</td></tr>
              </tbody>
            </table>
            {externalExam?.notes && (
              <div className="print-notes">{externalExam.notes}</div>
            )}
          </div>
        </div>

        {/* CFTA / Moscopia */}
        <div className="print-section">
          <div className="print-section__title">CFTA / Moscopia</div>
          <div className="print-section__body">
            <table className="print-table print-table--compact">
              <tbody>
                <tr><th>Campimetría</th><td>{dash(cftaMoscopia?.campimetry)}</td></tr>
                <tr><th>Tonometría</th><td>{dash(cftaMoscopia?.tonometry)}</td></tr>
                <tr><th>A-scan</th><td>{dash(cftaMoscopia?.ascan)}</td></tr>
                <tr><th>Miodesopsias</th><td>{dash(cftaMoscopia?.floaters)}</td></tr>
                <tr><th>Cristalino</th><td>{dash(externalExam?.lens)}</td></tr>
              </tbody>
            </table>
            {cftaMoscopia?.notes && (
              <div className="print-notes">{cftaMoscopia.notes}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fondo de ojo (separado para mayor legibilidad) ────────────────────── */}
      {externalExam?.fundus && (
        <div className="print-section">
          <div className="print-section__title">Fondo de Ojo</div>
          <div className="print-section__body">
            <div className="print-field__value">{externalExam.fundus}</div>
          </div>
        </div>
      )}

      {/* ── Queratometría ────────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Queratometría</div>
        <div className="print-section__body">
          <EyeTable
            columns={[
              { header: 'K1 (D)', width: '20%' },
              { header: 'Eje K1 (°)', width: '18%' },
              { header: 'K2 (D)', width: '20%' },
              { header: 'Eje K2 (°)', width: '18%' },
            ]}
            odCells={[
              formatOptical(keratometry?.odK1),
              keratometry?.odK1Axis ?? '',
              formatOptical(keratometry?.odK2),
              keratometry?.odK2Axis ?? '',
            ]}
            oiCells={[
              formatOptical(keratometry?.oiK1),
              keratometry?.oiK1Axis ?? '',
              formatOptical(keratometry?.oiK2),
              keratometry?.oiK2Axis ?? '',
            ]}
          />
          {keratometry?.notes && (
            <div className="print-notes">{keratometry.notes}</div>
          )}
        </div>
      </div>

      {/* ── Test color + Estereopsis (dos columnas) ──────────────────────────── */}
      <div className="print-two-col">
        <div className="print-section">
          <div className="print-section__title">Test de Color</div>
          <div className="print-section__body">
            <table className="print-table print-table--compact">
              <tbody>
                <tr>
                  <th>Tipo de test</th>
                  <td colSpan={3}>{dash(colorTest?.testType)}</td>
                </tr>
                <tr>
                  <th>OD</th><td>{dash(colorTest?.odResult)}</td>
                  <th>OI</th><td>{dash(colorTest?.oiResult)}</td>
                </tr>
              </tbody>
            </table>
            {colorTest?.notes && (
              <div className="print-notes">{colorTest.notes}</div>
            )}
          </div>
        </div>

        <div className="print-section">
          <div className="print-section__title">Estereopsis</div>
          <div className="print-section__body">
            <table className="print-table print-table--compact">
              <tbody>
                <tr><th>Tipo de test</th><td>{dash(stereopsisTest?.testType)}</td></tr>
                <tr><th>Resultado</th><td>{dash(stereopsisTest?.result)}</td></tr>
                <tr>
                  <th>Segs. de arco</th>
                  <td>{stereopsisTest?.seconds != null ? stereopsisTest.seconds : '—'}</td>
                </tr>
              </tbody>
            </table>
            {stereopsisTest?.notes && (
              <div className="print-notes">{stereopsisTest.notes}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Refracción objetiva ──────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Refracción Objetiva</div>
        <div className="print-section__body">
          <EyeTable
            columns={[
              { header: 'Esfera', width: '22%' },
              { header: 'Cilindro', width: '22%' },
              { header: 'Eje (°)', width: '20%' },
            ]}
            odCells={[
              formatOptical(refraction?.odSphere),
              formatOptical(refraction?.odCylinder),
              refraction?.odAxis ?? '',
            ]}
            oiCells={[
              formatOptical(refraction?.oiSphere),
              formatOptical(refraction?.oiCylinder),
              refraction?.oiAxis ?? '',
            ]}
          />
          {refraction?.notes && (
            <div className="print-notes">{refraction.notes}</div>
          )}
        </div>
      </div>

      {/* ── Refracción subjetiva ──────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Refracción Subjetiva</div>
        <div className="print-section__body">
          <EyeTable
            columns={[
              { header: 'Esfera', width: '16%' },
              { header: 'Cilindro', width: '16%' },
              { header: 'Eje (°)', width: '13%' },
              { header: 'ADD', width: '13%' },
              { header: 'Visión lograda', width: '18%' },
            ]}
            odCells={[
              formatOptical(subjectiveRefraction?.odSphere),
              formatOptical(subjectiveRefraction?.odCylinder),
              subjectiveRefraction?.odAxis ?? '',
              formatOptical(subjectiveRefraction?.odAdd),
              subjectiveRefraction?.odVision ?? '',
            ]}
            oiCells={[
              formatOptical(subjectiveRefraction?.oiSphere),
              formatOptical(subjectiveRefraction?.oiCylinder),
              subjectiveRefraction?.oiAxis ?? '',
              formatOptical(subjectiveRefraction?.oiAdd),
              subjectiveRefraction?.oiVision ?? '',
            ]}
          />
          {subjectiveRefraction?.notes && (
            <div className="print-notes">{subjectiveRefraction.notes}</div>
          )}
        </div>
      </div>

      {/* ── Fórmula final ────────────────────────────────────────────────────── */}
      <div className="print-section print-section--highlight">
        <div className="print-section__title">Fórmula Final Recetada</div>
        <div className="print-section__body">
          <EyeTable
            columns={[
              { header: 'Esfera', width: '14%' },
              { header: 'Cilindro', width: '14%' },
              { header: 'Eje (°)', width: '12%' },
              { header: 'ADD', width: '12%' },
              { header: 'Prisma', width: '14%' },
              { header: 'DP (mm)', width: '12%' },
            ]}
            odCells={[
              formatOptical(finalFormula?.odSphere),
              formatOptical(finalFormula?.odCylinder),
              finalFormula?.odAxis ?? '',
              formatOptical(finalFormula?.odAdd),
              finalFormula?.odPrism ?? '',
              finalFormula?.dpOd ?? '',
            ]}
            oiCells={[
              formatOptical(finalFormula?.oiSphere),
              formatOptical(finalFormula?.oiCylinder),
              finalFormula?.oiAxis ?? '',
              formatOptical(finalFormula?.oiAdd),
              finalFormula?.oiPrism ?? '',
              finalFormula?.dpOi ?? '',
            ]}
          />
          {finalFormula && (
            <div className="print-field-row" style={{ marginTop: '2mm' }}>
              <div className="print-field">
                <div className="print-field__label">Tipo de lente</div>
                <div className="print-field__value">{finalFormula.lensType ?? ''}</div>
              </div>
              <div className="print-field">
                <div className="print-field__label">Material</div>
                <div className="print-field__value">{finalFormula.lensMaterial ?? ''}</div>
              </div>
              <div className="print-field">
                <div className="print-field__label">Tratamiento / Coating</div>
                <div className="print-field__value">{finalFormula.lensCoating ?? ''}</div>
              </div>
            </div>
          )}
          {finalFormula?.notes && (
            <div className="print-notes">{finalFormula.notes}</div>
          )}
        </div>
      </div>

      {/* ── Diagnóstico + Tratamiento (dos columnas) ─────────────────────────── */}
      <div className="print-two-col">
        <div className="print-section">
          <div className="print-section__title">Diagnóstico</div>
          <div className="print-section__body">
            <FormLines text={consultation.diagnosis} minLines={3} />
          </div>
        </div>
        <div className="print-section">
          <div className="print-section__title">Tratamiento Indicado</div>
          <div className="print-section__body">
            <FormLines text={consultation.treatment} minLines={3} />
          </div>
        </div>
      </div>

      {/* ── Observaciones ────────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Observaciones</div>
        <div className="print-section__body">
          <FormLines text={consultation.observations} minLines={2} />
        </div>
      </div>

      {/* ── Firma y sello ────────────────────────────────────────────────────── */}
      <div className="print-signature-block">
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '7pt', color: '#666', fontStyle: 'italic', lineHeight: 1.4 }}>
            Documento generado el {formatDate(new Date().toISOString())} —
            Sistema de Gestión Clínica Óptica (Fase 5A)
          </div>
        </div>
        <div className="print-signature__box">
          <div className="print-signature__label">Firma y Sello del Profesional</div>
          <div className="print-signature__img-area">
            &nbsp;
          </div>
          <div className="print-signature__line" />
          <div className="print-signature__name">Dr./Dra.&nbsp;{doctor.user.name}</div>
          <div className="print-signature__mat">Mat. N.°&nbsp;{doctor.licenseNumber}</div>
        </div>
      </div>

      {/* ── Barra de acción (oculta al imprimir) ─────────────────────────────── */}
      <div className="no-print print-action-bar">
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>
    </div>
  );
}

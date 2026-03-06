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

function formatOptical(value?: number | null) {
  if (value === undefined || value === null) return '';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

function dash(val?: string | number | null) {
  if (val === undefined || val === null || val === '') return '—';
  return String(val);
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
          <div className="print-header__clinic-name">{doctor.clinicName ?? 'Clínica Óptica'}</div>
          {doctor.clinicAddress && <div className="print-header__clinic-detail">{doctor.clinicAddress}</div>}
          {doctor.clinicPhone && <div className="print-header__clinic-detail">Tel.: {doctor.clinicPhone}</div>}
        </div>
        <div className="print-header__center">
          <div className="print-doc-title">Ficha de Consulta Oftalmológica</div>
          <div className="print-header__date-box">
            <span className="print-field__label">Fecha de consulta:&nbsp;</span>
            <span className="print-header__date-value">{formatDate(consultation.consultationDate)}</span>
            {consultation.control && (
              <>
                <span className="print-field__label" style={{ marginLeft: '6mm' }}>Próximo control:&nbsp;</span>
                <span className="print-header__date-value">{consultation.control}</span>
              </>
            )}
          </div>
        </div>
        <div className="print-header__doctor">
          <div className="print-header__doctor-name">Dr./Dra. {doctor.user.name}</div>
          <div className="print-header__doctor-detail">Mat. N.° {doctor.licenseNumber}</div>
          {doctor.specialty && <div className="print-header__doctor-detail">{doctor.specialty}</div>}
        </div>
      </div>

      {/* ── Datos del paciente ───────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Datos del Paciente</div>
        <div className="print-section__body print-patient-grid">
          <div className="print-field print-field--wide">
            <div className="print-field__label">Apellido y Nombre</div>
            <div className="print-field__value">{patient.lastName}, {patient.firstName}</div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Documento</div>
            <div className="print-field__value">{dash(patient.documentId)}</div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Fecha de Nac.</div>
            <div className="print-field__value">{formatDate(patient.birthDate)}</div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Teléfono</div>
            <div className="print-field__value">{dash(patient.phone)}</div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Email</div>
            <div className="print-field__value">{dash(patient.email)}</div>
          </div>
          <div className="print-field">
            <div className="print-field__label">Ocupación</div>
            <div className="print-field__value">{dash(patient.occupation)}</div>
          </div>
          <div className="print-field print-field--full">
            <div className="print-field__label">Dirección</div>
            <div className="print-field__value">{dash(patient.address)}</div>
          </div>
        </div>
      </div>

      {/* ── Motivo de consulta ───────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Motivo de Consulta</div>
        <div className="print-section__body">
          <div className="print-textarea">{consultation.reason ?? ''}</div>
        </div>
      </div>

      {/* ── Lensometría ──────────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Lensometría (Graduación Anterior)</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>Esfera</th>
                <th>Cilindro</th>
                <th>Eje (°)</th>
                <th>ADD</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="eye-label eye-od">OD</td>
                <td>{lensometry ? formatOptical(lensometry.odSphere) : ''}</td>
                <td>{lensometry ? formatOptical(lensometry.odCylinder) : ''}</td>
                <td>{lensometry?.odAxis ?? ''}</td>
                <td>{lensometry ? formatOptical(lensometry.odAdd) : ''}</td>
                <td rowSpan={2} className="notes-cell">{lensometry?.notes ?? ''}</td>
              </tr>
              <tr>
                <td className="eye-label eye-oi">OI</td>
                <td>{lensometry ? formatOptical(lensometry.oiSphere) : ''}</td>
                <td>{lensometry ? formatOptical(lensometry.oiCylinder) : ''}</td>
                <td>{lensometry?.oiAxis ?? ''}</td>
                <td>{lensometry ? formatOptical(lensometry.oiAdd) : ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Agudeza visual ───────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Agudeza Visual</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>SC (sin corrección)</th>
                <th>CC (con corrección)</th>
                <th>Visión próxima</th>
                <th>PIO</th>
                <th>Visión cromática</th>
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

      {/* ── Motilidad ocular + Examen externo (dos columnas) ─────────────────── */}
      <div className="print-two-col">
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
            {ocularMotility?.notes && <div className="print-notes">{ocularMotility.notes}</div>}
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
              </tbody>
            </table>
            {cftaMoscopia?.notes && <div className="print-notes">{cftaMoscopia.notes}</div>}
          </div>
        </div>
      </div>

      {/* ── Examen externo ───────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Examen Externo</div>
        <div className="print-section__body">
          <table className="print-table print-table--compact">
            <tbody>
              <tr>
                <th>Párpados</th><td>{dash(externalExam?.eyelids)}</td>
                <th>Conjuntiva</th><td>{dash(externalExam?.conjunctiva)}</td>
                <th>Córnea</th><td>{dash(externalExam?.cornea)}</td>
              </tr>
              <tr>
                <th>Iris</th><td>{dash(externalExam?.iris)}</td>
                <th>Pupila</th><td>{dash(externalExam?.pupil)}</td>
                <th>Cristalino</th><td>{dash(externalExam?.lens)}</td>
              </tr>
              <tr>
                <th>Fondo de ojo</th><td colSpan={5}>{dash(externalExam?.fundus)}</td>
              </tr>
            </tbody>
          </table>
          {externalExam?.notes && <div className="print-notes">{externalExam.notes}</div>}
        </div>
      </div>

      {/* ── Queratometría ────────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Queratometría</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>K1 (D)</th>
                <th>Eje K1 (°)</th>
                <th>K2 (D)</th>
                <th>Eje K2 (°)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="eye-label eye-od">OD</td>
                <td>{keratometry ? formatOptical(keratometry.odK1) : ''}</td>
                <td>{keratometry?.odK1Axis ?? ''}</td>
                <td>{keratometry ? formatOptical(keratometry.odK2) : ''}</td>
                <td>{keratometry?.odK2Axis ?? ''}</td>
              </tr>
              <tr>
                <td className="eye-label eye-oi">OI</td>
                <td>{keratometry ? formatOptical(keratometry.oiK1) : ''}</td>
                <td>{keratometry?.oiK1Axis ?? ''}</td>
                <td>{keratometry ? formatOptical(keratometry.oiK2) : ''}</td>
                <td>{keratometry?.oiK2Axis ?? ''}</td>
              </tr>
            </tbody>
          </table>
          {keratometry?.notes && <div className="print-notes">{keratometry.notes}</div>}
        </div>
      </div>

      {/* ── Test color + Estereopsis (dos columnas) ──────────────────────────── */}
      <div className="print-two-col">
        <div className="print-section">
          <div className="print-section__title">Test de Color</div>
          <div className="print-section__body">
            <table className="print-table print-table--compact">
              <tbody>
                <tr><th>Tipo de test</th><td colSpan={3}>{dash(colorTest?.testType)}</td></tr>
                <tr>
                  <th>OD</th><td>{dash(colorTest?.odResult)}</td>
                  <th>OI</th><td>{dash(colorTest?.oiResult)}</td>
                </tr>
              </tbody>
            </table>
            {colorTest?.notes && <div className="print-notes">{colorTest.notes}</div>}
          </div>
        </div>

        <div className="print-section">
          <div className="print-section__title">Estereopsis</div>
          <div className="print-section__body">
            <table className="print-table print-table--compact">
              <tbody>
                <tr><th>Tipo de test</th><td>{dash(stereopsisTest?.testType)}</td></tr>
                <tr><th>Resultado</th><td>{dash(stereopsisTest?.result)}</td></tr>
                <tr><th>Segs. de arco</th><td>{stereopsisTest?.seconds != null ? stereopsisTest.seconds : '—'}</td></tr>
              </tbody>
            </table>
            {stereopsisTest?.notes && <div className="print-notes">{stereopsisTest.notes}</div>}
          </div>
        </div>
      </div>

      {/* ── Refracción objetiva ──────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Refracción (Objetiva)</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>Esfera</th>
                <th>Cilindro</th>
                <th>Eje (°)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="eye-label eye-od">OD</td>
                <td>{refraction ? formatOptical(refraction.odSphere) : ''}</td>
                <td>{refraction ? formatOptical(refraction.odCylinder) : ''}</td>
                <td>{refraction?.odAxis ?? ''}</td>
              </tr>
              <tr>
                <td className="eye-label eye-oi">OI</td>
                <td>{refraction ? formatOptical(refraction.oiSphere) : ''}</td>
                <td>{refraction ? formatOptical(refraction.oiCylinder) : ''}</td>
                <td>{refraction?.oiAxis ?? ''}</td>
              </tr>
            </tbody>
          </table>
          {refraction?.notes && <div className="print-notes">{refraction.notes}</div>}
        </div>
      </div>

      {/* ── Refracción subjetiva ──────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Subjetivo (Refracción Subjetiva)</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>Esfera</th>
                <th>Cilindro</th>
                <th>Eje (°)</th>
                <th>ADD</th>
                <th>Visión lograda</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="eye-label eye-od">OD</td>
                <td>{subjectiveRefraction ? formatOptical(subjectiveRefraction.odSphere) : ''}</td>
                <td>{subjectiveRefraction ? formatOptical(subjectiveRefraction.odCylinder) : ''}</td>
                <td>{subjectiveRefraction?.odAxis ?? ''}</td>
                <td>{subjectiveRefraction ? formatOptical(subjectiveRefraction.odAdd) : ''}</td>
                <td>{subjectiveRefraction?.odVision ?? ''}</td>
              </tr>
              <tr>
                <td className="eye-label eye-oi">OI</td>
                <td>{subjectiveRefraction ? formatOptical(subjectiveRefraction.oiSphere) : ''}</td>
                <td>{subjectiveRefraction ? formatOptical(subjectiveRefraction.oiCylinder) : ''}</td>
                <td>{subjectiveRefraction?.oiAxis ?? ''}</td>
                <td>{subjectiveRefraction ? formatOptical(subjectiveRefraction.oiAdd) : ''}</td>
                <td>{subjectiveRefraction?.oiVision ?? ''}</td>
              </tr>
            </tbody>
          </table>
          {subjectiveRefraction?.notes && <div className="print-notes">{subjectiveRefraction.notes}</div>}
        </div>
      </div>

      {/* ── Fórmula final ────────────────────────────────────────────────────── */}
      <div className="print-section print-section--highlight">
        <div className="print-section__title">Fórmula Final Recetada</div>
        <div className="print-section__body">
          <table className="print-table">
            <thead>
              <tr>
                <th>Ojo</th>
                <th>Esfera</th>
                <th>Cilindro</th>
                <th>Eje (°)</th>
                <th>ADD</th>
                <th>Prisma</th>
                <th>DP (mm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="eye-label eye-od">OD</td>
                <td>{finalFormula ? formatOptical(finalFormula.odSphere) : ''}</td>
                <td>{finalFormula ? formatOptical(finalFormula.odCylinder) : ''}</td>
                <td>{finalFormula?.odAxis ?? ''}</td>
                <td>{finalFormula ? formatOptical(finalFormula.odAdd) : ''}</td>
                <td>{finalFormula?.odPrism ?? ''}</td>
                <td>{finalFormula?.dpOd ?? ''}</td>
              </tr>
              <tr>
                <td className="eye-label eye-oi">OI</td>
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
                <div className="print-field__label">Tratamiento / Coating</div>
                <div className="print-field__value">{finalFormula.lensCoating ?? ''}</div>
              </div>
            </div>
          )}
          {finalFormula?.notes && <div className="print-notes">{finalFormula.notes}</div>}
        </div>
      </div>

      {/* ── Diagnóstico ──────────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Diagnóstico</div>
        <div className="print-section__body">
          <div className="print-textarea">{consultation.diagnosis ?? ''}</div>
        </div>
      </div>

      {/* ── Tratamiento ──────────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Tratamiento Indicado</div>
        <div className="print-section__body">
          <div className="print-textarea">{consultation.treatment ?? ''}</div>
        </div>
      </div>

      {/* ── Observaciones ────────────────────────────────────────────────────── */}
      <div className="print-section">
        <div className="print-section__title">Observaciones</div>
        <div className="print-section__body">
          <div className="print-textarea">{consultation.observations ?? ''}</div>
        </div>
      </div>

      {/* ── Firma y sello ────────────────────────────────────────────────────── */}
      <div className="print-signature-row">
        <div className="print-signature__box">
          <div className="print-signature__line"></div>
          <div className="print-signature__caption">Firma y Sello del Profesional</div>
          <div className="print-signature__name">Dr./Dra. {doctor.user.name}</div>
          <div className="print-signature__mat">Mat. N.° {doctor.licenseNumber}</div>
        </div>
      </div>

      {/* ── Pie de página ────────────────────────────────────────────────────── */}
      <div className="print-footer">
        Documento generado el {formatDate(new Date().toISOString())} — Sistema de Gestión Clínica Óptica (Fase 3B)
      </div>

      {/* ── Botón de impresión (oculto al imprimir) ──────────────────────────── */}
      <div className="no-print print-action-bar">
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>
    </div>
  );
}

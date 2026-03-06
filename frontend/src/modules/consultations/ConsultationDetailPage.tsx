import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { consultationsApi, Consultation } from '../../services/api';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatOpt(value?: number | null) {
  if (value === undefined || value === null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="form-control" style={{ background: '#f9fafb' }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#4b5563',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '0.4rem',
        marginBottom: '0.75rem',
        marginTop: '1.25rem',
      }}
    >
      {children}
    </h3>
  );
}

export function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: consultation,
    isLoading,
    error,
  } = useQuery<Consultation>({
    queryKey: ['consultation', id],
    queryFn: () => consultationsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-muted">Cargando consulta...</p>;
  if (error || !consultation)
    return <div className="alert alert-error">No se pudo cargar la consulta.</div>;

  const { patient, doctor, lensometry, visualAcuity, finalFormula, ocularMotility, externalExam,
    cftaMoscopia, keratometry, colorTest, stereopsisTest, refraction, subjectiveRefraction } = consultation;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="page-title">Detalle de Consulta — {formatDate(consultation.consultationDate)}</h2>
        <div className="flex gap-2">
          <Link to={`/patients/${patient.id}/history`} className="btn btn-secondary">
            ← Historial del paciente
          </Link>
          <Link to={`/consultations/${id}/edit`} className="btn btn-secondary">
            ✏️ Editar
          </Link>
          <Link to={`/print/consultations/${id}`} className="btn btn-primary" target="_blank">
            🖨️ Imprimir
          </Link>
        </div>
      </div>

      <div className="card">
        <SectionTitle>Datos generales</SectionTitle>
        <div className="form-grid">
          <Row
            label="Paciente"
            value={`${patient.lastName}, ${patient.firstName}`}
          />
          <Row label="Doctor" value={doctor.user.name} />
          <Row label="Fecha de consulta" value={formatDate(consultation.consultationDate)} />
          <Row label="Estado de pago" value={consultation.paymentStatus} />
        </div>

        <SectionTitle>Motivo de consulta</SectionTitle>
        <div className="form-group">
          <div className="form-control" style={{ background: '#f9fafb', minHeight: '3rem' }}>
            {consultation.reason ?? '—'}
          </div>
        </div>

        {lensometry && (
          <>
            <SectionTitle>Lensometría</SectionTitle>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Ojo</th><th>Esfera</th><th>Cilindro</th><th>Eje</th><th>ADD</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>OD</td>
                    <td>{formatOpt(lensometry.odSphere)}</td>
                    <td>{formatOpt(lensometry.odCylinder)}</td>
                    <td>{lensometry.odAxis ?? '—'}</td>
                    <td>{formatOpt(lensometry.odAdd)}</td>
                  </tr>
                  <tr>
                    <td>OI</td>
                    <td>{formatOpt(lensometry.oiSphere)}</td>
                    <td>{formatOpt(lensometry.oiCylinder)}</td>
                    <td>{lensometry.oiAxis ?? '—'}</td>
                    <td>{formatOpt(lensometry.oiAdd)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {visualAcuity && (
          <>
            <SectionTitle>Agudeza Visual</SectionTitle>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Ojo</th><th>SC</th><th>CC</th><th>Visión próxima</th><th>PIO</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>OD</td>
                    <td>{visualAcuity.odScVision ?? '—'}</td>
                    <td>{visualAcuity.odCcVision ?? '—'}</td>
                    <td rowSpan={2}>{visualAcuity.nearVision ?? '—'}</td>
                    <td rowSpan={2}>{visualAcuity.iop ?? '—'}</td>
                  </tr>
                  <tr>
                    <td>OI</td>
                    <td>{visualAcuity.oiScVision ?? '—'}</td>
                    <td>{visualAcuity.oiCcVision ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {ocularMotility && (
          <>
            <SectionTitle>Motilidad Ocular</SectionTitle>
            <div className="form-grid">
              <Row label="Versiones" value={ocularMotility.versions} />
              <Row label="Ducciones" value={ocularMotility.ductions} />
              <Row label="Cover Test" value={ocularMotility.coverTest} />
              <Row label="Hirschberg" value={ocularMotility.hirschberg} />
              <Row label="NPC" value={ocularMotility.npc} />
            </div>
          </>
        )}

        {externalExam && (
          <>
            <SectionTitle>Examen Externo</SectionTitle>
            <div className="form-grid">
              <Row label="Párpados" value={externalExam.eyelids} />
              <Row label="Conjuntiva" value={externalExam.conjunctiva} />
              <Row label="Córnea" value={externalExam.cornea} />
              <Row label="Iris" value={externalExam.iris} />
              <Row label="Pupila" value={externalExam.pupil} />
              <Row label="Cristalino" value={externalExam.lens} />
              <Row label="Fondo de ojo" value={externalExam.fundus} />
            </div>
          </>
        )}

        {cftaMoscopia && (
          <>
            <SectionTitle>CFTA Moscopia</SectionTitle>
            <div className="form-grid">
              <Row label="Campimetría" value={cftaMoscopia.campimetry} />
              <Row label="Tonometría" value={cftaMoscopia.tonometry} />
              <Row label="A-scan" value={cftaMoscopia.ascan} />
              <Row label="Moscas volantes" value={cftaMoscopia.floaters} />
            </div>
          </>
        )}

        {keratometry && (
          <>
            <SectionTitle>Queratometría</SectionTitle>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Ojo</th><th>K1</th><th>Eje K1</th><th>K2</th><th>Eje K2</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>OD</td>
                    <td>{keratometry.odK1?.toFixed(2) ?? '—'}</td>
                    <td>{keratometry.odK1Axis ?? '—'}</td>
                    <td>{keratometry.odK2?.toFixed(2) ?? '—'}</td>
                    <td>{keratometry.odK2Axis ?? '—'}</td>
                  </tr>
                  <tr>
                    <td>OI</td>
                    <td>{keratometry.oiK1?.toFixed(2) ?? '—'}</td>
                    <td>{keratometry.oiK1Axis ?? '—'}</td>
                    <td>{keratometry.oiK2?.toFixed(2) ?? '—'}</td>
                    <td>{keratometry.oiK2Axis ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {colorTest && (
          <>
            <SectionTitle>Test de Color</SectionTitle>
            <div className="form-grid">
              <Row label="Tipo de test" value={colorTest.testType} />
              <Row label="OD" value={colorTest.odResult} />
              <Row label="OI" value={colorTest.oiResult} />
            </div>
          </>
        )}

        {stereopsisTest && (
          <>
            <SectionTitle>Estereopsis</SectionTitle>
            <div className="form-grid">
              <Row label="Tipo de test" value={stereopsisTest.testType} />
              <Row label="Resultado" value={stereopsisTest.result} />
              <Row label="Segundos de arco" value={stereopsisTest.seconds} />
            </div>
          </>
        )}

        {refraction && (
          <>
            <SectionTitle>Refracción (Objetiva)</SectionTitle>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Ojo</th><th>Esfera</th><th>Cilindro</th><th>Eje</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>OD</td>
                    <td>{formatOpt(refraction.odSphere)}</td>
                    <td>{formatOpt(refraction.odCylinder)}</td>
                    <td>{refraction.odAxis ?? '—'}</td>
                  </tr>
                  <tr>
                    <td>OI</td>
                    <td>{formatOpt(refraction.oiSphere)}</td>
                    <td>{formatOpt(refraction.oiCylinder)}</td>
                    <td>{refraction.oiAxis ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {subjectiveRefraction && (
          <>
            <SectionTitle>Subjetivo</SectionTitle>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Ojo</th><th>Esfera</th><th>Cilindro</th><th>Eje</th><th>ADD</th><th>Visión</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>OD</td>
                    <td>{formatOpt(subjectiveRefraction.odSphere)}</td>
                    <td>{formatOpt(subjectiveRefraction.odCylinder)}</td>
                    <td>{subjectiveRefraction.odAxis ?? '—'}</td>
                    <td>{formatOpt(subjectiveRefraction.odAdd)}</td>
                    <td>{subjectiveRefraction.odVision ?? '—'}</td>
                  </tr>
                  <tr>
                    <td>OI</td>
                    <td>{formatOpt(subjectiveRefraction.oiSphere)}</td>
                    <td>{formatOpt(subjectiveRefraction.oiCylinder)}</td>
                    <td>{subjectiveRefraction.oiAxis ?? '—'}</td>
                    <td>{formatOpt(subjectiveRefraction.oiAdd)}</td>
                    <td>{subjectiveRefraction.oiVision ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {finalFormula && (
          <>
            <SectionTitle>Fórmula Final</SectionTitle>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Ojo</th><th>Esfera</th><th>Cilindro</th><th>Eje</th><th>ADD</th><th>Prisma</th><th>DP</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>OD</td>
                    <td>{formatOpt(finalFormula.odSphere)}</td>
                    <td>{formatOpt(finalFormula.odCylinder)}</td>
                    <td>{finalFormula.odAxis ?? '—'}</td>
                    <td>{formatOpt(finalFormula.odAdd)}</td>
                    <td>{finalFormula.odPrism ?? '—'}</td>
                    <td>{finalFormula.dpOd ?? '—'}</td>
                  </tr>
                  <tr>
                    <td>OI</td>
                    <td>{formatOpt(finalFormula.oiSphere)}</td>
                    <td>{formatOpt(finalFormula.oiCylinder)}</td>
                    <td>{finalFormula.oiAxis ?? '—'}</td>
                    <td>{formatOpt(finalFormula.oiAdd)}</td>
                    <td>{finalFormula.oiPrism ?? '—'}</td>
                    <td>{finalFormula.dpOi ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="form-grid" style={{ marginTop: '0.75rem' }}>
              <Row label="Tipo de lente" value={finalFormula.lensType} />
              <Row label="Material" value={finalFormula.lensMaterial} />
              <Row label="Tratamiento" value={finalFormula.lensCoating} />
            </div>
          </>
        )}

        <SectionTitle>Diagnóstico</SectionTitle>
        <div className="form-group">
          <div className="form-control" style={{ background: '#f9fafb', minHeight: '3rem' }}>
            {consultation.diagnosis ?? '—'}
          </div>
        </div>

        <SectionTitle>Tratamiento</SectionTitle>
        <div className="form-group">
          <div className="form-control" style={{ background: '#f9fafb', minHeight: '3rem' }}>
            {consultation.treatment ?? '—'}
          </div>
        </div>

        {consultation.control && (
          <>
            <SectionTitle>Control</SectionTitle>
            <div className="form-group">
              <div className="form-control" style={{ background: '#f9fafb', minHeight: '2rem' }}>
                {consultation.control}
              </div>
            </div>
          </>
        )}

        {consultation.observations && (
          <>
            <SectionTitle>Observaciones</SectionTitle>
            <div className="form-group">
              <div className="form-control" style={{ background: '#f9fafb', minHeight: '3rem' }}>
                {consultation.observations}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

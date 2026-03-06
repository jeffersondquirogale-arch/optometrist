import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  consultationsApi,
  patientsApi,
  CreateConsultationInput,
  Consultation,
} from '../../services/api';

type SectionKey =
  | 'general'
  | 'reason'
  | 'lensometry'
  | 'visualAcuity'
  | 'ocularMotility'
  | 'externalExam'
  | 'cftaMoscopia'
  | 'keratometry'
  | 'colorTest'
  | 'stereopsisTest'
  | 'refraction'
  | 'subjectiveRefraction'
  | 'finalFormula'
  | 'diagnosis';

const SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: 'general', label: 'Datos generales', icon: '📋' },
  { key: 'reason', label: 'Motivo', icon: '💬' },
  { key: 'lensometry', label: 'Lensometría', icon: '🔭' },
  { key: 'visualAcuity', label: 'Agudeza Visual', icon: '👁️' },
  { key: 'ocularMotility', label: 'Motilidad Ocular', icon: '↔️' },
  { key: 'externalExam', label: 'Examen Externo', icon: '🔬' },
  { key: 'cftaMoscopia', label: 'CFTA / Moscopia', icon: '📊' },
  { key: 'keratometry', label: 'Queratometría', icon: '⭕' },
  { key: 'colorTest', label: 'Test de Color', icon: '🎨' },
  { key: 'stereopsisTest', label: 'Estereopsis', icon: '👓' },
  { key: 'refraction', label: 'Refracción', icon: '📐' },
  { key: 'subjectiveRefraction', label: 'Subjetivo', icon: '🎯' },
  { key: 'finalFormula', label: 'Fórmula Final', icon: '📄' },
  { key: 'diagnosis', label: 'Diagnóstico / Tx', icon: '🏥' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#e8eef6',
      borderLeft: '4px solid #1a6ab1',
      padding: '0.4rem 0.75rem',
      marginBottom: '1rem',
      borderRadius: '0 4px 4px 0',
    }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a3a5c', margin: 0 }}>
        {children}
      </h3>
    </div>
  );
}

function numOrUndef(val: string): number | undefined {
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

function intOrUndef(val: string): number | undefined {
  const n = parseInt(val, 10);
  return isNaN(n) ? undefined : n;
}

const emptyForm: CreateConsultationInput = {
  patientId: '',
  doctorId: '',
  reason: '',
  diagnosis: '',
  treatment: '',
  control: '',
  observations: '',
  paymentStatus: 'PENDIENTE',
  lensometry: {
    odSphere: undefined, odCylinder: undefined, odAxis: undefined, odAdd: undefined,
    oiSphere: undefined, oiCylinder: undefined, oiAxis: undefined, oiAdd: undefined,
    notes: '',
  },
  visualAcuity: {
    odScVision: '', oiScVision: '',
    odCcVision: '', oiCcVision: '',
    nearVision: '', colorVision: '', iop: '', notes: '',
  },
  ocularMotility: {
    versions: '', ductions: '', coverTest: '', hirschberg: '', npc: '', notes: '',
  },
  externalExam: {
    eyelids: '', conjunctiva: '', cornea: '', iris: '', pupil: '', lens: '', fundus: '', notes: '',
  },
  cftaMoscopia: { campimetry: '', tonometry: '', ascan: '', floaters: '', notes: '' },
  keratometry: {
    odK1: undefined, odK1Axis: undefined, odK2: undefined, odK2Axis: undefined,
    oiK1: undefined, oiK1Axis: undefined, oiK2: undefined, oiK2Axis: undefined,
    notes: '',
  },
  colorTest: { odResult: '', oiResult: '', testType: '', notes: '' },
  stereopsisTest: { result: '', testType: '', seconds: undefined, notes: '' },
  refraction: {
    odSphere: undefined, odCylinder: undefined, odAxis: undefined,
    oiSphere: undefined, oiCylinder: undefined, oiAxis: undefined,
    notes: '',
  },
  subjectiveRefraction: {
    odSphere: undefined, odCylinder: undefined, odAxis: undefined, odAdd: undefined, odVision: '',
    oiSphere: undefined, oiCylinder: undefined, oiAxis: undefined, oiAdd: undefined, oiVision: '',
    notes: '',
  },
  finalFormula: {
    odSphere: undefined, odCylinder: undefined, odAxis: undefined, odAdd: undefined, odPrism: '',
    oiSphere: undefined, oiCylinder: undefined, oiAxis: undefined, oiAdd: undefined, oiPrism: '',
    lensType: '', lensMaterial: '', lensCoating: '',
    dpOd: undefined, dpOi: undefined, notes: '',
  },
};

function consultationToForm(c: Consultation): CreateConsultationInput {
  return {
    patientId: c.patientId,
    doctorId: c.doctorId,
    reason: c.reason ?? '',
    diagnosis: c.diagnosis ?? '',
    treatment: c.treatment ?? '',
    control: c.control ?? '',
    observations: c.observations ?? '',
    paymentStatus: c.paymentStatus,
    paymentAmount: c.paymentAmount,
    lensometry: c.lensometry ?? emptyForm.lensometry,
    visualAcuity: c.visualAcuity ?? emptyForm.visualAcuity,
    ocularMotility: c.ocularMotility ?? emptyForm.ocularMotility,
    externalExam: c.externalExam ?? emptyForm.externalExam,
    cftaMoscopia: c.cftaMoscopia ?? emptyForm.cftaMoscopia,
    keratometry: c.keratometry ?? emptyForm.keratometry,
    colorTest: c.colorTest ?? emptyForm.colorTest,
    stereopsisTest: c.stereopsisTest ?? emptyForm.stereopsisTest,
    refraction: c.refraction ?? emptyForm.refraction,
    subjectiveRefraction: c.subjectiveRefraction ?? emptyForm.subjectiveRefraction,
    finalFormula: c.finalFormula ?? emptyForm.finalFormula,
  };
}

export function ConsultationFormPage({ mode }: { mode: 'new' | 'edit' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const preselectedPatientId = searchParams.get('patientId') ?? '';
  const [activeSection, setActiveSection] = useState<SectionKey>('general');
  const [form, setForm] = useState<CreateConsultationInput>({
    ...emptyForm,
    patientId: preselectedPatientId,
  });
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: patientsApi.getAll,
  });

  const { data: existingConsultation } = useQuery<Consultation>({
    queryKey: ['consultation', id],
    queryFn: () => consultationsApi.getById(id!),
    enabled: mode === 'edit' && !!id,
  });

  useEffect(() => {
    if (existingConsultation) {
      setForm(consultationToForm(existingConsultation));
    }
  }, [existingConsultation]);

  const createMutation = useMutation({
    mutationFn: consultationsApi.create,
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['consultations'] });
      qc.invalidateQueries({ queryKey: ['patient-history'] });
      navigate(`/consultations/${c.id}`);
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateConsultationInput>) => consultationsApi.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultation', id] });
      navigate(`/consultations/${id}`);
    },
    onError: (err: Error) => setError(err.message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function setBase(field: keyof CreateConsultationInput, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setNested<K extends keyof CreateConsultationInput>(
    section: K,
    field: string,
    value: unknown,
  ) {
    setForm((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as Record<string, unknown>), [field]: value },
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.patientId) { setError('Seleccione un paciente.'); return; }
    if (!form.doctorId) { setError('Ingrese el ID del doctor.'); return; }
    if (mode === 'new') {
      createMutation.mutate(form);
    } else {
      updateMutation.mutate(form);
    }
  }

  function changeSection(key: SectionKey) {
    setActiveSection(key);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    contentRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  const thStyle: React.CSSProperties = {
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    padding: '0.4rem 0.6rem',
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    textAlign: 'center',
    color: '#374151',
  };

  /** Numeric optical field rendered as a table cell */
  const optField = (
    section: keyof CreateConsultationInput,
    field: string,
    label: string,
    isInt = false,
  ) => {
    const nested = form[section] as Record<string, unknown> | undefined;
    const raw = nested?.[field];
    const strVal = raw !== undefined && raw !== null ? String(raw) : '';
    return (
      <td style={{ border: '1px solid #d1d5db', padding: '0.25rem 0.35rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
        <input
          type="number"
          step={isInt ? '1' : '0.25'}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.9rem', background: 'transparent', textAlign: 'center' }}
          value={strVal}
          onChange={(e) =>
            setNested(section, field, isInt ? intOrUndef(e.target.value) : numOrUndef(e.target.value))
          }
        />
      </td>
    );
  };

  /** Inline text cell inside an eye comparison table */
  const txtCell = (
    section: keyof CreateConsultationInput,
    field: string,
    label: string,
  ) => {
    const nested = form[section] as Record<string, unknown> | undefined;
    const val = (nested?.[field] as string) ?? '';
    return (
      <td style={{ border: '1px solid #d1d5db', padding: '0.25rem 0.35rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
        <input
          type="text"
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.9rem', background: 'transparent' }}
          value={val}
          onChange={(e) => setNested(section, field, e.target.value)}
        />
      </td>
    );
  };

  /** Standalone text / textarea field */

  const txtField = (
    section: keyof CreateConsultationInput,
    field: string,
    label: string,
    rows = 1,
  ) => {
    const nested = form[section] as Record<string, unknown> | undefined;
    const val = (nested?.[field] as string) ?? '';
    return (
      <div className="form-group">
        <label>{label}</label>
        {rows > 1 ? (
          <textarea
            className="form-control"
            rows={rows}
            value={val}
            onChange={(e) => setNested(section, field, e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="form-control"
            value={val}
            onChange={(e) => setNested(section, field, e.target.value)}
          />
        )}
      </div>
    );
  };

  /** Shared OD/OI comparison table */
  const EyeCompTable = ({
    cols,
    odRow,
    oiRow,
  }: {
    cols: string[];
    odRow: React.ReactNode[];
    oiRow: React.ReactNode[];
  }) => (
    <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '3.5rem' }}>Ojo</th>
            {cols.map((c) => (
              <th key={c} style={thStyle}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #d1d5db', padding: '0.3rem 0.5rem', fontWeight: 700, color: '#003380', background: '#f9fafb', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>OD</td>
            {odRow}
          </tr>
          <tr>
            <td style={{ border: '1px solid #d1d5db', padding: '0.3rem 0.5rem', fontWeight: 700, color: '#800000', background: '#f9fafb', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>OI</td>
            {oiRow}
          </tr>
        </tbody>
      </table>
    </div>
  );

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    width: '100%',
    textAlign: 'left',
    padding: '0.45rem 0.7rem',
    background: active ? '#1a6ab1' : 'transparent',
    color: active ? '#fff' : '#374151',
    border: active ? '1px solid #1a6ab1' : '1px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: active ? 700 : 400,
    transition: 'background 0.15s, border-color 0.15s',
    outline: 'none',
  });

  return (
    <div>
      <h2 className="page-title">
        {mode === 'new' ? 'Nueva Consulta' : 'Editar Consulta'}
      </h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        {/* ── Sidebar de navegación (sticky) ── */}
        <nav
          style={{
            width: '175px',
            flexShrink: 0,
            position: 'sticky',
            top: '1rem',
            background: '#fff',
            border: '1px solid #dde1e7',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '0.5rem',
            maxHeight: 'calc(100vh - 6rem)',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '0.4rem', paddingLeft: '0.4rem' }}>
            Secciones
          </div>
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              className="cf-nav-btn"
              data-active={activeSection === s.key ? 'true' : undefined}
              onClick={() => changeSection(s.key)}
              style={navBtnStyle(activeSection === s.key)}
            >
              <span style={{ fontSize: '0.9rem' }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        {/* ── Contenido principal ── */}
        <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: 0 }}>
          <div className="card" ref={contentRef}>
          {/* ── General ── */}
          {activeSection === 'general' && (
            <>
              <SectionTitle>Datos generales</SectionTitle>
              <div className="form-grid">
                <div className="form-group">
                  <label>Paciente *</label>
                  <select
                    className="form-control"
                    value={form.patientId}
                    onChange={(e) => setBase('patientId', e.target.value)}
                    required
                    disabled={mode === 'edit'}
                  >
                    <option value="">— Seleccionar paciente —</option>
                    {patients?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName}, {p.firstName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>ID del Doctor *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ID del perfil del doctor"
                    value={form.doctorId}
                    onChange={(e) => setBase('doctorId', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Estado de pago</label>
                  <select
                    className="form-control"
                    value={form.paymentStatus}
                    onChange={(e) => setBase('paymentStatus', e.target.value)}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="PAGADO">Pagado</option>
                    <option value="PARCIAL">Parcial</option>
                    <option value="ANULADO">Anulado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Importe ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={form.paymentAmount ?? ''}
                    onChange={(e) => setBase('paymentAmount', numOrUndef(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Motivo ── */}
          {activeSection === 'reason' && (
            <>
              <SectionTitle>Motivo de consulta</SectionTitle>
              <div className="form-group">
                <label>Motivo</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={form.reason ?? ''}
                  onChange={(e) => setBase('reason', e.target.value)}
                />
              </div>
            </>
          )}

          {/* ── Lensometría ── */}
          {activeSection === 'lensometry' && (
            <>
              <SectionTitle>Lensometría (Graduación Anterior)</SectionTitle>
              <EyeCompTable
                cols={['Esfera', 'Cilindro', 'Eje (°)', 'ADD']}
                odRow={[
                  optField('lensometry', 'odSphere', 'Esfera'),
                  optField('lensometry', 'odCylinder', 'Cilindro'),
                  optField('lensometry', 'odAxis', 'Eje', true),
                  optField('lensometry', 'odAdd', 'ADD'),
                ]}
                oiRow={[
                  optField('lensometry', 'oiSphere', 'Esfera'),
                  optField('lensometry', 'oiCylinder', 'Cilindro'),
                  optField('lensometry', 'oiAxis', 'Eje', true),
                  optField('lensometry', 'oiAdd', 'ADD'),
                ]}
              />
              {txtField('lensometry', 'notes', 'Observaciones', 2)}
            </>
          )}

          {/* ── Agudeza Visual ── */}
          {activeSection === 'visualAcuity' && (
            <>
              <SectionTitle>Agudeza Visual</SectionTitle>
              <EyeCompTable
                cols={['SC (sin corrección)', 'CC (con corrección)']}
                odRow={[
                  txtCell('visualAcuity', 'odScVision', 'OD SC'),
                  txtCell('visualAcuity', 'odCcVision', 'OD CC'),
                ]}
                oiRow={[
                  txtCell('visualAcuity', 'oiScVision', 'OI SC'),
                  txtCell('visualAcuity', 'oiCcVision', 'OI CC'),
                ]}
              />
              <div className="form-grid">
                {txtField('visualAcuity', 'nearVision', 'Visión próxima')}
                {txtField('visualAcuity', 'colorVision', 'Visión cromática')}
                {txtField('visualAcuity', 'iop', 'PIO (presión intraocular)')}
              </div>
              {txtField('visualAcuity', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Motilidad Ocular ── */}
          {activeSection === 'ocularMotility' && (
            <>
              <SectionTitle>Motilidad Ocular</SectionTitle>
              <div className="form-grid">
                {txtField('ocularMotility', 'versions', 'Versiones')}
                {txtField('ocularMotility', 'ductions', 'Ducciones')}
                {txtField('ocularMotility', 'coverTest', 'Cover Test')}
                {txtField('ocularMotility', 'hirschberg', 'Hirschberg')}
                {txtField('ocularMotility', 'npc', 'NPC')}
              </div>
              {txtField('ocularMotility', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Examen Externo ── */}
          {activeSection === 'externalExam' && (
            <>
              <SectionTitle>Examen Externo</SectionTitle>
              <div className="form-grid">
                {txtField('externalExam', 'eyelids', 'Párpados')}
                {txtField('externalExam', 'conjunctiva', 'Conjuntiva')}
                {txtField('externalExam', 'cornea', 'Córnea')}
                {txtField('externalExam', 'iris', 'Iris')}
                {txtField('externalExam', 'pupil', 'Pupila')}
                {txtField('externalExam', 'lens', 'Cristalino')}
                {txtField('externalExam', 'fundus', 'Fondo de ojo')}
              </div>
              {txtField('externalExam', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── CFTA Moscopia ── */}
          {activeSection === 'cftaMoscopia' && (
            <>
              <SectionTitle>CFTA Moscopia</SectionTitle>
              <div className="form-grid">
                {txtField('cftaMoscopia', 'campimetry', 'Campimetría')}
                {txtField('cftaMoscopia', 'tonometry', 'Tonometría')}
                {txtField('cftaMoscopia', 'ascan', 'A-scan')}
                {txtField('cftaMoscopia', 'floaters', 'Moscas volantes')}
              </div>
              {txtField('cftaMoscopia', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Queratometría ── */}
          {activeSection === 'keratometry' && (
            <>
              <SectionTitle>Queratometría</SectionTitle>
              <EyeCompTable
                cols={['K1 (D)', 'Eje K1 (°)', 'K2 (D)', 'Eje K2 (°)']}
                odRow={[
                  optField('keratometry', 'odK1', 'K1'),
                  optField('keratometry', 'odK1Axis', 'Eje', true),
                  optField('keratometry', 'odK2', 'K2'),
                  optField('keratometry', 'odK2Axis', 'Eje', true),
                ]}
                oiRow={[
                  optField('keratometry', 'oiK1', 'K1'),
                  optField('keratometry', 'oiK1Axis', 'Eje', true),
                  optField('keratometry', 'oiK2', 'K2'),
                  optField('keratometry', 'oiK2Axis', 'Eje', true),
                ]}
              />
              {txtField('keratometry', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Test de Color ── */}
          {activeSection === 'colorTest' && (
            <>
              <SectionTitle>Test de Color</SectionTitle>
              <div className="form-grid">
                {txtField('colorTest', 'testType', 'Tipo de test (Ishihara, Farnsworth…)')}
                {txtField('colorTest', 'odResult', 'OD Resultado')}
                {txtField('colorTest', 'oiResult', 'OI Resultado')}
              </div>
              {txtField('colorTest', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Estereopsis ── */}
          {activeSection === 'stereopsisTest' && (
            <>
              <SectionTitle>Estereopsis</SectionTitle>
              <div className="form-grid">
                {txtField('stereopsisTest', 'testType', 'Tipo de test (TNO, Randot…)')}
                {txtField('stereopsisTest', 'result', 'Resultado')}
                <div className="form-group">
                  <label>Segundos de arco</label>
                  <input
                    type="number"
                    step="1"
                    className="form-control"
                    value={(form.stereopsisTest as Record<string, unknown>)?.seconds != null
                      ? String((form.stereopsisTest as Record<string, unknown>).seconds)
                      : ''}
                    onChange={(e) => setNested('stereopsisTest', 'seconds', intOrUndef(e.target.value))}
                  />
                </div>
              </div>
              {txtField('stereopsisTest', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Refracción ── */}
          {activeSection === 'refraction' && (
            <>
              <SectionTitle>Refracción (Objetiva)</SectionTitle>
              <EyeCompTable
                cols={['Esfera', 'Cilindro', 'Eje (°)']}
                odRow={[
                  optField('refraction', 'odSphere', 'Esfera'),
                  optField('refraction', 'odCylinder', 'Cilindro'),
                  optField('refraction', 'odAxis', 'Eje', true),
                ]}
                oiRow={[
                  optField('refraction', 'oiSphere', 'Esfera'),
                  optField('refraction', 'oiCylinder', 'Cilindro'),
                  optField('refraction', 'oiAxis', 'Eje', true),
                ]}
              />
              {txtField('refraction', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Subjetivo ── */}
          {activeSection === 'subjectiveRefraction' && (
            <>
              <SectionTitle>Subjetivo (Refracción Subjetiva)</SectionTitle>
              <EyeCompTable
                cols={['Esfera', 'Cilindro', 'Eje (°)', 'ADD', 'Visión lograda']}
                odRow={[
                  optField('subjectiveRefraction', 'odSphere', 'Esfera'),
                  optField('subjectiveRefraction', 'odCylinder', 'Cilindro'),
                  optField('subjectiveRefraction', 'odAxis', 'Eje', true),
                  optField('subjectiveRefraction', 'odAdd', 'ADD'),
                  txtCell('subjectiveRefraction', 'odVision', 'Visión'),
                ]}
                oiRow={[
                  optField('subjectiveRefraction', 'oiSphere', 'Esfera'),
                  optField('subjectiveRefraction', 'oiCylinder', 'Cilindro'),
                  optField('subjectiveRefraction', 'oiAxis', 'Eje', true),
                  optField('subjectiveRefraction', 'oiAdd', 'ADD'),
                  txtCell('subjectiveRefraction', 'oiVision', 'Visión'),
                ]}
              />
              {txtField('subjectiveRefraction', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Fórmula Final ── */}
          {activeSection === 'finalFormula' && (
            <>
              <SectionTitle>Fórmula Final Recetada</SectionTitle>
              <EyeCompTable
                cols={['Esfera', 'Cilindro', 'Eje (°)', 'ADD', 'Prisma', 'DP (mm)']}
                odRow={[
                  optField('finalFormula', 'odSphere', 'Esfera'),
                  optField('finalFormula', 'odCylinder', 'Cilindro'),
                  optField('finalFormula', 'odAxis', 'Eje', true),
                  optField('finalFormula', 'odAdd', 'ADD'),
                  txtCell('finalFormula', 'odPrism', 'Prisma'),
                  optField('finalFormula', 'dpOd', 'DP'),
                ]}
                oiRow={[
                  optField('finalFormula', 'oiSphere', 'Esfera'),
                  optField('finalFormula', 'oiCylinder', 'Cilindro'),
                  optField('finalFormula', 'oiAxis', 'Eje', true),
                  optField('finalFormula', 'oiAdd', 'ADD'),
                  txtCell('finalFormula', 'oiPrism', 'Prisma'),
                  optField('finalFormula', 'dpOi', 'DP'),
                ]}
              />
              <div className="form-grid">
                {txtField('finalFormula', 'lensType', 'Tipo de lente')}
                {txtField('finalFormula', 'lensMaterial', 'Material')}
                {txtField('finalFormula', 'lensCoating', 'Tratamiento / Coating')}
              </div>
              {txtField('finalFormula', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Diagnóstico / Tratamiento ── */}
          {activeSection === 'diagnosis' && (
            <>
              <SectionTitle>Diagnóstico</SectionTitle>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.diagnosis ?? ''}
                  onChange={(e) => setBase('diagnosis', e.target.value)}
                />
              </div>
              <SectionTitle>Tratamiento</SectionTitle>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.treatment ?? ''}
                  onChange={(e) => setBase('treatment', e.target.value)}
                />
              </div>
              <SectionTitle>Control</SectionTitle>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Próximo control…"
                  value={form.control ?? ''}
                  onChange={(e) => setBase('control', e.target.value)}
                />
              </div>
              <SectionTitle>Observaciones</SectionTitle>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.observations ?? ''}
                  onChange={(e) => setBase('observations', e.target.value)}
                />
              </div>
            </>
          )}
        </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Guardando...' : mode === 'new' ? 'Crear Consulta' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(mode === 'edit' ? `/consultations/${id}` : '/')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

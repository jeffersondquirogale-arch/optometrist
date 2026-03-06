import { useState, FormEvent, useEffect } from 'react';
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

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'general', label: 'Datos generales' },
  { key: 'reason', label: 'Motivo de consulta' },
  { key: 'lensometry', label: 'Lensometría' },
  { key: 'visualAcuity', label: 'Agudeza Visual' },
  { key: 'ocularMotility', label: 'Motilidad Ocular' },
  { key: 'externalExam', label: 'Examen Externo' },
  { key: 'cftaMoscopia', label: 'CFTA Moscopia' },
  { key: 'keratometry', label: 'Queratometría' },
  { key: 'colorTest', label: 'Test de Color' },
  { key: 'stereopsisTest', label: 'Estereopsis' },
  { key: 'refraction', label: 'Refracción' },
  { key: 'subjectiveRefraction', label: 'Subjetivo' },
  { key: 'finalFormula', label: 'Fórmula Final' },
  { key: 'diagnosis', label: 'Diagnóstico / Tratamiento' },
];

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
  lensometry: { odSphere: undefined, odCylinder: undefined, odAxis: undefined, odAdd: undefined, oiSphere: undefined, oiCylinder: undefined, oiAxis: undefined, oiAdd: undefined, notes: '' },
  visualAcuity: { odScVision: '', oiScVision: '', odCcVision: '', oiCcVision: '', nearVision: '', colorVision: '', iop: '', notes: '' },
  ocularMotility: { versions: '', ductions: '', coverTest: '', hirschberg: '', npc: '', notes: '' },
  externalExam: { eyelids: '', conjunctiva: '', cornea: '', iris: '', pupil: '', lens: '', fundus: '', notes: '' },
  cftaMoscopia: { campimetry: '', tonometry: '', ascan: '', floaters: '', notes: '' },
  keratometry: { odK1: undefined, odK1Axis: undefined, odK2: undefined, odK2Axis: undefined, oiK1: undefined, oiK1Axis: undefined, oiK2: undefined, oiK2Axis: undefined, notes: '' },
  colorTest: { odResult: '', oiResult: '', testType: '', notes: '' },
  stereopsisTest: { result: '', testType: '', seconds: undefined, notes: '' },
  refraction: { odSphere: undefined, odCylinder: undefined, odAxis: undefined, oiSphere: undefined, oiCylinder: undefined, oiAxis: undefined, notes: '' },
  subjectiveRefraction: { odSphere: undefined, odCylinder: undefined, odAxis: undefined, odAdd: undefined, odVision: '', oiSphere: undefined, oiCylinder: undefined, oiAxis: undefined, oiAdd: undefined, oiVision: '', notes: '' },
  finalFormula: { odSphere: undefined, odCylinder: undefined, odAxis: undefined, odAdd: undefined, odPrism: '', oiSphere: undefined, oiCylinder: undefined, oiAxis: undefined, oiAdd: undefined, oiPrism: '', lensType: '', lensMaterial: '', lensCoating: '', dpOd: undefined, dpOi: undefined, notes: '' },
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
      <div className="form-group">
        <label>{label}</label>
        <input
          type="number"
          step={isInt ? '1' : '0.25'}
          className="form-control"
          value={strVal}
          onChange={(e) =>
            setNested(section, field, isInt ? intOrUndef(e.target.value) : numOrUndef(e.target.value))
          }
        />
      </div>
    );
  };

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

  return (
    <div>
      <h2 className="page-title">
        {mode === 'new' ? 'Nueva Consulta' : 'Editar Consulta'}
      </h2>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Section tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginBottom: '1rem',
        }}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveSection(s.key)}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: activeSection === s.key ? 700 : 400,
              background: activeSection === s.key ? '#2563eb' : '#f3f4f6',
              color: activeSection === s.key ? '#fff' : '#374151',
              borderColor: activeSection === s.key ? '#2563eb' : '#d1d5db',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
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
              <SectionTitle>Lensometría</SectionTitle>
              <div className="form-grid">
                {optField('lensometry', 'odSphere', 'OD Esfera')}
                {optField('lensometry', 'odCylinder', 'OD Cilindro')}
                {optField('lensometry', 'odAxis', 'OD Eje', true)}
                {optField('lensometry', 'odAdd', 'OD ADD')}
                {optField('lensometry', 'oiSphere', 'OI Esfera')}
                {optField('lensometry', 'oiCylinder', 'OI Cilindro')}
                {optField('lensometry', 'oiAxis', 'OI Eje', true)}
                {optField('lensometry', 'oiAdd', 'OI ADD')}
              </div>
              {txtField('lensometry', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Agudeza Visual ── */}
          {activeSection === 'visualAcuity' && (
            <>
              <SectionTitle>Agudeza Visual</SectionTitle>
              <div className="form-grid">
                {txtField('visualAcuity', 'odScVision', 'OD SC (sin corrección)')}
                {txtField('visualAcuity', 'oiScVision', 'OI SC (sin corrección)')}
                {txtField('visualAcuity', 'odCcVision', 'OD CC (con corrección)')}
                {txtField('visualAcuity', 'oiCcVision', 'OI CC (con corrección)')}
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
              <div className="form-grid">
                {optField('keratometry', 'odK1', 'OD K1')}
                {optField('keratometry', 'odK1Axis', 'OD Eje K1', true)}
                {optField('keratometry', 'odK2', 'OD K2')}
                {optField('keratometry', 'odK2Axis', 'OD Eje K2', true)}
                {optField('keratometry', 'oiK1', 'OI K1')}
                {optField('keratometry', 'oiK1Axis', 'OI Eje K1', true)}
                {optField('keratometry', 'oiK2', 'OI K2')}
                {optField('keratometry', 'oiK2Axis', 'OI Eje K2', true)}
              </div>
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
                {optField('stereopsisTest', 'seconds', 'Segundos de arco', true)}
              </div>
              {txtField('stereopsisTest', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Refracción ── */}
          {activeSection === 'refraction' && (
            <>
              <SectionTitle>Refracción (Objetiva)</SectionTitle>
              <div className="form-grid">
                {optField('refraction', 'odSphere', 'OD Esfera')}
                {optField('refraction', 'odCylinder', 'OD Cilindro')}
                {optField('refraction', 'odAxis', 'OD Eje', true)}
                {optField('refraction', 'oiSphere', 'OI Esfera')}
                {optField('refraction', 'oiCylinder', 'OI Cilindro')}
                {optField('refraction', 'oiAxis', 'OI Eje', true)}
              </div>
              {txtField('refraction', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Subjetivo ── */}
          {activeSection === 'subjectiveRefraction' && (
            <>
              <SectionTitle>Subjetivo</SectionTitle>
              <div className="form-grid">
                {optField('subjectiveRefraction', 'odSphere', 'OD Esfera')}
                {optField('subjectiveRefraction', 'odCylinder', 'OD Cilindro')}
                {optField('subjectiveRefraction', 'odAxis', 'OD Eje', true)}
                {optField('subjectiveRefraction', 'odAdd', 'OD ADD')}
                {txtField('subjectiveRefraction', 'odVision', 'OD Visión lograda')}
                {optField('subjectiveRefraction', 'oiSphere', 'OI Esfera')}
                {optField('subjectiveRefraction', 'oiCylinder', 'OI Cilindro')}
                {optField('subjectiveRefraction', 'oiAxis', 'OI Eje', true)}
                {optField('subjectiveRefraction', 'oiAdd', 'OI ADD')}
                {txtField('subjectiveRefraction', 'oiVision', 'OI Visión lograda')}
              </div>
              {txtField('subjectiveRefraction', 'notes', 'Notas', 2)}
            </>
          )}

          {/* ── Fórmula Final ── */}
          {activeSection === 'finalFormula' && (
            <>
              <SectionTitle>Fórmula Final</SectionTitle>
              <div className="form-grid">
                {optField('finalFormula', 'odSphere', 'OD Esfera')}
                {optField('finalFormula', 'odCylinder', 'OD Cilindro')}
                {optField('finalFormula', 'odAxis', 'OD Eje', true)}
                {optField('finalFormula', 'odAdd', 'OD ADD')}
                {txtField('finalFormula', 'odPrism', 'OD Prisma')}
                {optField('finalFormula', 'dpOd', 'DP OD')}
                {optField('finalFormula', 'oiSphere', 'OI Esfera')}
                {optField('finalFormula', 'oiCylinder', 'OI Cilindro')}
                {optField('finalFormula', 'oiAxis', 'OI Eje', true)}
                {optField('finalFormula', 'oiAdd', 'OI ADD')}
                {txtField('finalFormula', 'oiPrism', 'OI Prisma')}
                {optField('finalFormula', 'dpOi', 'DP OI')}
                {txtField('finalFormula', 'lensType', 'Tipo de lente')}
                {txtField('finalFormula', 'lensMaterial', 'Material')}
                {txtField('finalFormula', 'lensCoating', 'Tratamiento')}
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
  );
}

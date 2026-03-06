import CostComparison from './CostComparison.jsx';
import GradeGauge from './GradeGauge.jsx';
import { CheckIcon, ErrorIcon, WarningIcon } from './icons/StatusIcons.jsx';

function formatGrade(grade) {
  if (!grade) return '等級4未満';
  return `等級${grade}`;
}

function StatusBadge({ ok, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      {ok ? <CheckIcon size={16} /> : <WarningIcon size={16} />}
      <span className={ok ? 'text-green-700' : 'text-amber-700'}>{label}</span>
    </span>
  );
}

export default function ResultPanel({
  result,
  comparison,
  verifyState,
  onVerify,
  onExportAreaPdf,
  onExportCalcPdf,
}) {
  const ua = Number(result?.ua_value || 0);
  const etaAC = Number(result?.eta_a_c || 0);
  const grade = result?.grade;
  const thresholds = result?.thresholds || {};

  return (
    <div className="sticky bottom-3 z-30">
      <div className="bg-white/95 backdrop-blur border border-warm-200 rounded-2xl shadow-lg p-4 md:p-5">
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div>
            <div className="text-xs text-primary-500">UA値</div>
            <div className="text-2xl font-bold text-primary-800">{ua.toFixed(2)} W/m²K</div>
            <div className="text-sm">
              <StatusBadge ok={Boolean(grade)} label={formatGrade(grade)} />
            </div>
            <div className="text-xs mt-1">
              ZEH判定: <StatusBadge ok={Boolean(result?.zeh_ok)} label={result?.zeh_ok ? '適合' : '未達'} />
            </div>
          </div>

          <div>
            <div className="text-xs text-primary-500">ηAC値</div>
            <div className="text-2xl font-bold text-primary-800">{etaAC.toFixed(1)}</div>
            <div className="text-sm">
              <StatusBadge ok={etaAC <= 3.0} label={etaAC <= 3.0 ? '基準OK' : '基準超過'} />
            </div>
            <div className="text-xs text-primary-500 mt-1">
              窓コスト合計: ¥{Math.round(result?.window_cost_total || 0).toLocaleString('ja-JP')}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary text-xs md:text-sm py-2 px-3" onClick={onVerify}>
                公式APIで検証
              </button>
              <button type="button" className="btn-outline text-xs md:text-sm py-2 px-3" onClick={onExportAreaPdf}>
                求積表PDF
              </button>
              <button type="button" className="btn-outline text-xs md:text-sm py-2 px-3" onClick={onExportCalcPdf}>
                計算書PDF
              </button>
            </div>
            <CostComparison comparison={comparison} />
          </div>
        </div>

        <div className="mt-3">
          <GradeGauge ua={ua} thresholds={thresholds} />
        </div>

        {verifyState?.message && (
          <div className="mt-3">
            <div
              className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm font-medium ${
                verifyState.ok
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {verifyState.ok ? <CheckIcon size={20} /> : <WarningIcon size={20} />}
              {verifyState.message}
            </div>

            {verifyState.details && (
              <div className="grid md:grid-cols-3 gap-0 border border-t-0 border-warm-200 rounded-b-lg overflow-hidden">
                <div className="p-3 border-r border-warm-200 bg-white">
                  <div className="text-xs text-primary-500 font-medium mb-1">フロント CalcEngine</div>
                  <div className="text-lg font-bold text-primary-800">
                    UA {Number(verifyState.details.front?.ua || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-primary-600">
                    ηAC {Number(verifyState.details.front?.eta_a_c || 0).toFixed(1)}
                  </div>
                </div>

                <div className="p-3 border-r border-warm-200 bg-white">
                  <div className="text-xs text-primary-500 font-medium mb-1 flex items-center gap-1">
                    バックエンド ミラー
                    {verifyState.local_ok != null && (
                      verifyState.local_ok ? <CheckIcon size={14} /> : <WarningIcon size={14} />
                    )}
                  </div>
                  <div className="text-lg font-bold text-primary-800">
                    UA {Number(verifyState.details.backend?.ua || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-primary-600">
                    ηAC {Number(verifyState.details.backend?.eta_a_c || 0).toFixed(1)}
                  </div>
                </div>

                <div className="p-3 bg-white">
                  <div className="text-xs text-primary-500 font-medium mb-1 flex items-center gap-1">
                    公式API
                    {verifyState.details.official ? (
                      verifyState.official_ok ? <CheckIcon size={14} /> : <WarningIcon size={14} />
                    ) : (
                      <ErrorIcon size={14} />
                    )}
                  </div>
                  {verifyState.details.official ? (
                    <>
                      <div className="text-lg font-bold text-primary-800">
                        UA {Number(verifyState.details.official.ua || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-primary-600">
                        ηAC {Number(verifyState.details.official.eta_a_c || 0).toFixed(1)}
                      </div>
                      {verifyState.details.official.ua_standard != null
                        && verifyState.details.official.eta_a_c_standard != null && (
                        <div className="text-xs text-primary-400 mt-1">
                          基準: UA {Number(verifyState.details.official.ua_standard).toFixed(2)}
                          {' / '}
                          ηAC {Number(verifyState.details.official.eta_a_c_standard).toFixed(1)}
                        </div>
                        )}
                    </>
                  ) : (
                    <div className="text-sm text-amber-600">
                      接続エラー
                      <div className="text-xs text-amber-500">ローカル検証のみ</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

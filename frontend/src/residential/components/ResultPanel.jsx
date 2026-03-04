import CostComparison from './CostComparison.jsx';

function formatGrade(grade) {
  if (!grade) return '等級4未満';
  return `等級${grade}`;
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
            <div className="text-sm text-primary-600">{grade ? `✅ ${formatGrade(grade)}` : '⚠ 等級4未満'}</div>
            <div className="text-xs text-primary-500 mt-1">ZEH判定: {result?.zeh_ok ? '✅ 適合' : '⚠ 未達'}</div>
          </div>

          <div>
            <div className="text-xs text-primary-500">ηAC値</div>
            <div className="text-2xl font-bold text-primary-800">{etaAC.toFixed(1)}</div>
            <div className="text-sm text-primary-600">{etaAC <= 3.0 ? '✅ 基準OK (≤3.0)' : '⚠ 基準超過'}</div>
            <div className="text-xs text-primary-500 mt-1">窓コスト合計: ¥{Math.round(result?.window_cost_total || 0).toLocaleString('ja-JP')}</div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary text-xs md:text-sm py-2 px-3" onClick={onVerify}>公式APIで検証</button>
              <button type="button" className="btn-outline text-xs md:text-sm py-2 px-3" onClick={onExportAreaPdf}>求積表PDF</button>
              <button type="button" className="btn-outline text-xs md:text-sm py-2 px-3" onClick={onExportCalcPdf}>計算書PDF</button>
            </div>
            <CostComparison comparison={comparison} />
          </div>
        </div>

        <div className="mt-3 grid md:grid-cols-4 gap-2 text-xs text-primary-500">
          {[4, 5, 6, 7].map((g) => (
            <div key={g} className="bg-warm-50 border border-warm-200 rounded-md px-2 py-1">
              等級{g}: ≤{Number(thresholds[g] || 0).toFixed(2)}
            </div>
          ))}
        </div>

        {verifyState?.message && (
          <div className={`mt-3 text-xs md:text-sm rounded-lg px-3 py-2 border ${verifyState.ok ? 'bg-green-50 text-green-800 border-green-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
            <div>{verifyState.message}</div>
            {verifyState.details && (
              <div className="mt-2 space-y-1">
                <div>フロント CalcEngine: UA {Number(verifyState.details.front?.ua || 0).toFixed(2)} / ηAC {Number(verifyState.details.front?.eta_a_c || 0).toFixed(1)}</div>
                <div>
                  バックエンド ミラー: UA {Number(verifyState.details.backend?.ua || 0).toFixed(2)} / ηAC {Number(verifyState.details.backend?.eta_a_c || 0).toFixed(1)}
                  {verifyState.local_ok ? ' ✅' : ' ⚠'}
                </div>
                {verifyState.details.official ? (
                  <div>
                    公式API: UA {Number(verifyState.details.official.ua || 0).toFixed(2)} / ηAC {Number(verifyState.details.official.eta_a_c || 0).toFixed(1)}
                    {verifyState.official_ok ? ' ✅' : ' ⚠'}
                    {verifyState.details.official.ua_standard != null && verifyState.details.official.eta_a_c_standard != null && (
                      <span> （基準: UA ≤ {Number(verifyState.details.official.ua_standard).toFixed(2)} / ηAC ≤ {Number(verifyState.details.official.eta_a_c_standard).toFixed(1)}）</span>
                    )}
                  </div>
                ) : (
                  <div>公式API: ⚠ 接続エラー（ローカル検証のみ） {verifyState.details.official_error || ''}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

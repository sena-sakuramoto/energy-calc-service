import Layout from '../components/Layout';
import ResidentialCalc from '../residential/components/ResidentialCalc.jsx';

export default function ResidentialPage() {
  return (
    <Layout
      title="楽々省エネ計算 | 住宅外皮計算"
      description="住宅のUA値・ηAC値をリアルタイムで算定し、求積表PDFと計算書PDFを出力します。"
      keywords="住宅,UA値,ηAC,外皮計算,省エネ"
      url="/residential"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
          <p className="font-semibold">対応範囲</p>
          <p className="mt-1">
            戸建住宅（木造在来・2×4・鉄骨造・RC造）の外皮性能計算（UA値・ηAC値）に対応。
            共同住宅は今後対応予定。
          </p>
        </div>
        <ResidentialCalc />
      </div>
    </Layout>
  );
}

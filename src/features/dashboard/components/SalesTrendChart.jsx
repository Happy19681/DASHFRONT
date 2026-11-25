import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ChartOptionsMenu from "@/features/dashboard/components/ChartOptionsMenu";
import { dashboardPeriods } from "@/features/dashboard/data/periods";

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const revenueFormatter = new Intl.NumberFormat("en-US");

function SalesTrendChart({ selectedDate, selectedPeriod, onPeriodChange, revenue, salesTrend = [] }) {
  const [progress, setProgress] = useState(0);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [isSelectionPinned, setIsSelectionPinned] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const duration = 1100;
    let startTime;
    let animationFrame;

    function animate(timestamp) {
      if (startTime === undefined) startTime = timestamp;
      const linearProgress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - linearProgress) ** 3;

      setProgress(easedProgress);
      if (linearProgress < 1) animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const monthlyRevenue = months.map((_, index) => salesTrend[index] ?? { revenue: 0, previousYearRevenue: 0 });
  const maxRevenue = Math.max(1, ...monthlyRevenue.flatMap(({ revenue: current, previousYearRevenue }) => [current, previousYearRevenue]));
  const revenueValue = Number(revenue.replace(/[^\d.-]/g, "")) || 0;
  const displayedRevenue = `$${revenueFormatter.format(revenueValue * progress)}`;
  const plot = { left: 52, right: 808, top: 14, bottom: 298 };
  const plotHeight = plot.bottom - plot.top;
  const plotWidth = plot.right - plot.left;
  const monthWidth = plotWidth / months.length;
  const columnsPerMonth = 5;
  const cellSize = 9;
  const cellGap = 2;
  const columnWidth = columnsPerMonth * (cellSize + cellGap) - cellGap;
  const selectedMonthIndex = hoverPoint?.monthIndex ?? selectedDate.getMonth();
  const activeMonthX = hoverPoint?.x ?? plot.left + selectedMonthIndex * monthWidth + monthWidth / 2;
  const activeMonth = monthlyRevenue[selectedMonthIndex];
  const activeMonthY = hoverPoint?.y ?? plot.bottom - (Math.max(activeMonth.revenue, activeMonth.previousYearRevenue) * progress / maxRevenue) * plotHeight;
  const tooltipWidth = 154;
  const tooltipHeight = 112;
  const octoberMidpointX = plot.left + 9.5 * monthWidth;
  const showTooltipOnLeft = selectedMonthIndex > 9 ||
    (selectedMonthIndex === 9 && activeMonthX >= octoberMidpointX);
  const tooltipX = showTooltipOnLeft
    ? Math.max(plot.left, activeMonthX - tooltipWidth - 12)
    : Math.min(plot.right - tooltipWidth, Math.max(plot.left, activeMonthX + 12));
  const tooltipY = hoverPoint
    ? Math.min(plot.bottom - tooltipHeight, Math.max(plot.top, hoverPoint.y - 58))
    : Math.min(plot.bottom - tooltipHeight, Math.max(plot.top, activeMonthY - 24));
  const tooltipDate = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })
    .format(new Date(selectedDate.getFullYear(), selectedMonthIndex, 1));
  const tooltipCurrentRevenue = `$${revenueFormatter.format(activeMonth.revenue * progress)}`;
  const tooltipPreviousRevenue = `$${revenueFormatter.format(activeMonth.previousYearRevenue * progress)}`;

  function getPointFromEvent(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 820;
    const y = ((event.clientY - bounds.top) / bounds.height) * 350;
    if (x < plot.left || x > plot.right || y < plot.top || y > plot.bottom) return null;

    const monthIndex = Math.max(0, Math.min(11, Math.floor((x - plot.left) / monthWidth)));
    return {
      x,
      y,
      monthIndex,
    };
  }

  function handleChartPointerMove(event) {
    if (isSelectionPinned) return;
    const point = getPointFromEvent(event);
    if (point) setHoverPoint(point);
  }

  function handleChartClick(event) {
    if (isSelectionPinned) {
      setIsSelectionPinned(false);
      return;
    }

    const point = getPointFromEvent(event);
    if (!point) return;
    setHoverPoint(point);
    setIsSelectionPinned(true);
  }

  return (
    <Card className="min-w-0 overflow-hidden rounded-xl border-0 bg-[#F5F4F2] p-px shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
      <CardHeader className="flex h-9 grid-cols-none grid-rows-none items-center justify-between px-4 py-0">
        <div className="flex items-center gap-1.5">
          <h2 className="origin-left scale-y-[1.2] font-sans text-[10px] font-semibold leading-[14px] text-[#6B7280]">
            SALES TREND
          </h2>
          <Info aria-hidden="true" className="text-[#9CA3AF]" size={12} />
        </div>
        <ChartOptionsMenu
          chartRef={chartRef}
          csvRows={[
            ["Month", "Revenue", "Previous year revenue"],
            ...monthlyRevenue.map(({ revenue: current, previousYearRevenue }, index) => [
              months[index],
              current,
              previousYearRevenue,
            ]),
          ]}
          label="Sales trend"
          onResetSelection={() => {
            setHoverPoint(null);
            setIsSelectionPinned(false);
          }}
          selectedDate={selectedDate}
          selectedPeriod={selectedPeriod}
        />
      </CardHeader>

      <CardContent className="rounded-xl border border-[#E5E7EB] bg-white px-3 pb-2 pt-3 sm:px-5">
        <div className="relative mb-1 flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-2 pl-4 pr-[1.46%]">
          <div className="flex items-baseline gap-3 whitespace-nowrap">
            <span className="text-[12px] leading-4 text-[#6B7280]">Total Revenue :</span>
            <span className="font-sans text-[24px] font-semibold leading-7 tracking-[-0.02em] text-[#111827]">
              {displayedRevenue}
            </span>
          </div>
          <div className="mx-auto flex shrink-0 items-center gap-4 font-sans text-[10px] font-semibold leading-[14px] text-[#6B7280] md:absolute md:left-1/2 md:top-1/2 md:mx-0 md:-translate-x-1/2 md:-translate-y-1/2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span aria-hidden="true" className="size-1.5 rounded-full border border-[#D1D5DB] bg-white" />
              <span className="origin-left scale-y-[1.2]">PREVIOUS YEAR</span>
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#111827]" />
              <span className="origin-left scale-y-[1.2]">CURRENT YEAR</span>
            </span>
          </div>
          <div aria-label="Sales trend reporting period" className="ml-auto flex shrink-0 rounded-full bg-[#F4F4F6] p-0.5 font-sans" role="group">
            {dashboardPeriods.map((option) => (
              <button
                aria-pressed={selectedPeriod === option}
                className={`rounded-full px-3 py-1.5 text-[10px] font-normal transition-colors ${
                  selectedPeriod === option
                    ? "bg-white text-[#111827] shadow-sm"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
                key={option}
                onClick={() => onPeriodChange(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <svg
          aria-label={`Monthly revenue for ${selectedDate.getFullYear()} compared with the previous year`}
          className="block h-[300px] w-full cursor-crosshair overflow-visible"
          onClick={handleChartClick}
          onPointerMove={handleChartPointerMove}
          preserveAspectRatio="none"
          ref={chartRef}
          role="img"
          viewBox="0 0 820 350"
        >
          <defs>
            <pattern height="14" id="sales-trend-grid" patternUnits="userSpaceOnUse" width="14">
              <rect fill="#F8F8F8" height="12.5" stroke="#FFFFFF" strokeWidth="0.7" width="12.5" x="0.75" y="0.75" />
            </pattern>
          </defs>

          <rect fill="url(#sales-trend-grid)" height={plotHeight} width={plotWidth} x={plot.left} y={plot.top} />

          {[0, 1, 2, 3, 4, 5, 6].map((tick) => {
            const value = maxRevenue * tick / 6;
            const y = plot.bottom - (tick / 6) * plotHeight;
            return (
              <g key={tick}>
                <line stroke="#9CA3AF" strokeWidth="1" x1={plot.left - 5} x2={plot.left - 1} y1={y} y2={y} />
                <text fill="#9CA3AF" fontFamily="Inter, sans-serif" fontSize="12" textAnchor="end" x="42" y={y + 4}>
                  {`$${revenueFormatter.format(value)}`}
                </text>
              </g>
            );
          })}

          {months.map((month, monthIndex) => {
            const groupX = plot.left + monthIndex * monthWidth + (monthWidth - columnWidth) / 2;
            const values = monthlyRevenue[monthIndex];
            return (
              <g key={month}>
                {Array.from({ length: columnsPerMonth }, (_, columnIndex) => {
                  const x = groupX + columnIndex * (cellSize + cellGap);
                  const isPreviousYear = columnIndex < 2;
                  const targetRows = Math.round(((isPreviousYear ? values.previousYearRevenue : values.revenue) / maxRevenue) * 28);
                  const rows = Math.floor(targetRows * progress);

                  return (
                    <g key={`${month}-${columnIndex}`}>
                      {Array.from({ length: rows }, (_, row) => (
                        <rect
                          fill={isPreviousYear ? "#D1D5DB" : "#111111"}
                          height={cellSize}
                          key={`revenue-${row}`}
                          rx="0.6"
                          width={cellSize}
                          x={x}
                          y={plot.bottom - (row + 1) * (cellSize + cellGap) + cellGap}
                        />
                      ))}
                    </g>
                  );
                })}
                <text
                  fill={monthIndex === selectedMonthIndex ? "#111827" : "#6B7280"}
                  fontFamily="Inter, sans-serif"
                  fontSize="11"
                  fontWeight={monthIndex === selectedMonthIndex ? "600" : "400"}
                  textAnchor="middle"
                  x={plot.left + monthIndex * monthWidth + monthWidth / 2}
                  y="337"
                >
                  {month}
                </text>
                {monthIndex < months.length - 1 && (
                  <circle cx={plot.left + monthIndex * monthWidth + monthWidth - 3} cy="333" fill="#D1D5DB" r="1" />
                )}
              </g>
            );
          })}

          <line stroke="#9CA3AF" strokeWidth="1" x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} />
          <line stroke="#6B7280" strokeDasharray="2 3" strokeWidth="1" x1={activeMonthX} x2={activeMonthX} y1={plot.top} y2={plot.bottom} />
          <line
            stroke="#6B7280"
            strokeDasharray="2 3"
            strokeWidth="1"
            x1={activeMonthX}
            x2={activeMonthX <= tooltipX ? tooltipX : tooltipX + tooltipWidth}
            y1={activeMonthY}
            y2={Math.max(tooltipY, Math.min(tooltipY + tooltipHeight, activeMonthY))}
          />
          <circle cx={activeMonthX} cy={activeMonthY} fill="#111827" r="4.5" stroke="white" strokeWidth="1.5" />
          <g transform={`translate(${tooltipX}, ${tooltipY})`}>
            <rect fill="white" height="112" rx="8" stroke="#D1D5DB" strokeWidth="1" width="154" />
            <path d="M8 1H146a7 7 0 0 1 7 7v24H1V8a7 7 0 0 1 7-7Z" fill="#F8F8F8" />
            <text fill="#6B7280" fontFamily="Inter, sans-serif" fontSize="13" x="12" y="21">
                  {tooltipDate}
            </text>
            <circle cx="14" cy="54" fill="#D1D5DB" r="2.2" />
            <text fill="#6B7280" fontFamily="Inter, sans-serif" fontSize="12" x="22" y="58">Previous year</text>
            <text fill="#111827" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" textAnchor="end" x="140" y="58">{tooltipPreviousRevenue}</text>
            <circle cx="14" cy="84" fill="#111827" r="2.2" />
            <text fill="#6B7280" fontFamily="Inter, sans-serif" fontSize="12" x="22" y="88">Current year</text>
            <text fill="#111827" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" textAnchor="end" x="140" y="88">{tooltipCurrentRevenue}</text>
          </g>
        </svg>
      </CardContent>
    </Card>
  );
}

export default SalesTrendChart;

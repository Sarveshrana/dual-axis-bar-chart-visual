import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import { getVisualSettings, VisualFormattingSettingsModel, VisualSettings } from "./settings";

type DataView            = powerbi.DataView;
type DataViewCategorical = powerbi.DataViewCategorical;
type DataViewValueColumns = powerbi.DataViewValueColumns;
type FormattingModel     = powerbi.visuals.FormattingModel;
type PrimitiveValue      = powerbi.PrimitiveValue;
type IViewport           = powerbi.IViewport;
type VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type IVisual             = powerbi.extensibility.visual.IVisual;

interface ChartDatum {
    category:  string;
    primary:   number;
    secondary: number;
}

interface TooltipDatum {
    category:     string;
    measureName:  string;
    value:        number;
    displayUnits: string;
}

interface RenderedBarDatum {
    key:   typeof BAR_KEYS[number];
    datum: ChartDatum;
}

interface AxisDomain {
    min: number;
    max: number;
}

const BAR_KEYS = ["primary", "secondary"] as const;

export class Visual implements IVisual {
    private readonly svg:             d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private readonly rootGroup:       d3.Selection<SVGGElement, unknown, null, undefined>;
    private readonly gridLinesGroup:  d3.Selection<SVGGElement, unknown, null, undefined>;
    private readonly plotArea:        d3.Selection<SVGGElement, unknown, null, undefined>;
    private readonly xAxisGroup:      d3.Selection<SVGGElement, unknown, null, undefined>;
    private readonly leftYAxisGroup:  d3.Selection<SVGGElement, unknown, null, undefined>;
    private readonly rightYAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private readonly legendGroup:     d3.Selection<SVGGElement, unknown, null, undefined>;
    private readonly zeroLine:        d3.Selection<SVGLineElement, unknown, null, undefined>;
    private readonly tooltip:              d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private readonly tooltipCategoryLine:  d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private readonly tooltipValueLine:     d3.Selection<HTMLDivElement, unknown, null, undefined>;

    private readonly formattingSettingsService: FormattingSettingsService;
    private formattingSettings: VisualFormattingSettingsModel;
    private settings: VisualSettings;

    constructor(options?: VisualConstructorOptions) {
        if (!options) {
            throw new Error("Visual constructor options are required.");
        }

        const element = options.element;

        this.formattingSettingsService = new FormattingSettingsService();
        this.formattingSettings = new VisualFormattingSettingsModel();
        this.settings = getVisualSettings(this.formattingSettings);

        this.svg = d3.select(element)
            .append("svg")
            .attr("class", "dual-axis-chart")
            .style("overflow", "visible");

        this.rootGroup       = this.svg.append("g").attr("class", "chart-root");
        this.gridLinesGroup  = this.rootGroup.append("g").attr("class", "grid-lines");
        this.plotArea        = this.rootGroup.append("g").attr("class", "plot-area");
        this.xAxisGroup      = this.rootGroup.append("g").attr("class", "x-axis");
        this.leftYAxisGroup  = this.rootGroup.append("g").attr("class", "y-axis y-axis-left");
        this.rightYAxisGroup = this.rootGroup.append("g").attr("class", "y-axis y-axis-right");
        this.legendGroup     = this.rootGroup.append("g").attr("class", "legend-group");
        this.zeroLine        = this.plotArea.append("line").attr("class", "zero-line");

        this.tooltip = d3.select(element)
            .append("div")
            .attr("class", "custom-tooltip")
            .style("position",       "absolute")
            .style("pointer-events", "none")
            .style("opacity",        "0")
            .style("padding",        "8px 10px")
            .style("border-radius",  "6px")
            .style("background",     "rgba(17, 24, 39, 0.92)")
            .style("color",          "#f9fafb")
            .style("font",           "13px Segoe UI, sans-serif")
            .style("box-shadow",     "0 4px 12px rgba(0,0,0,0.25)")
            .style("z-index",        "9999")
            .style("max-width",      "220px");

        this.tooltipCategoryLine = this.tooltip.append("div")
            .style("font-weight", "600")
            .style("margin-bottom", "3px");

        this.tooltipValueLine = this.tooltip.append("div")
            .style("font-size", "12px")
            .style("color",     "#d1d5db");
    }

    public update(options: VisualUpdateOptions): void {
        const dataView: DataView | undefined = options.dataViews?.[0];
        const viewport = options.viewport;

        this.svg
            .attr("width",  viewport.width)
            .attr("height", viewport.height);

        if (!dataView?.categorical) {
            this.renderEmptyState(viewport, "Add one category and two measures to render the visual.");
            return;
        }

        const categorical = dataView.categorical;

        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel, dataView
        );
        this.settings = getVisualSettings(this.formattingSettings);

        const chartData = this.getChartData(categorical);

        if (chartData.length === 0) {
            this.renderEmptyState(viewport, "No data is available for the selected fields.");
            return;
        }

        this.renderChart(chartData, categorical, viewport);
    }

    public getFormattingModel(): FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    // ── Empty state ───────────────────────────────────────────────────────────

    private renderEmptyState(viewport: IViewport, message: string): void {
        this.rootGroup.selectAll(".empty-state").remove();
        this.rootGroup.selectAll(".axis-title").remove();
        this.plotArea.selectAll(".category-group").remove();
        this.gridLinesGroup.selectAll("*").remove();
        this.legendGroup.selectAll("*").remove();
        this.zeroLine.attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 0);
        this.xAxisGroup.selectAll("*").remove();
        this.leftYAxisGroup.selectAll("*").remove();
        this.rightYAxisGroup.selectAll("*").remove();
        this.tooltip.style("opacity", "0");

        this.rootGroup
            .append("text")
            .attr("class",       "empty-state")
            .attr("x",           viewport.width  / 2)
            .attr("y",           viewport.height / 2)
            .attr("text-anchor", "middle")
            .attr("fill",        "#9ca3af")
            .style("font",       "14px Segoe UI, sans-serif")
            .text(message);
    }

    // ── Main render ───────────────────────────────────────────────────────────

    private renderChart(
        chartData:   ChartDatum[],
        categorical: DataViewCategorical,
        viewport:    IViewport
    ): void {
        this.rootGroup.selectAll(".empty-state").remove();

        const s      = this.settings;
        const margin = this.computeMargins();
        const width  = Math.max(0, viewport.width  - margin.left - margin.right);
        const height = Math.max(0, viewport.height - margin.top  - margin.bottom);

        this.rootGroup.attr("transform", `translate(${margin.left},${margin.top})`);

        // ── Y-axis domains ────────────────────────────────────────────────────
        const primaryExtent   = d3.extent(chartData, (d: ChartDatum) => d.primary);
        const secondaryExtent = d3.extent(chartData, (d: ChartDatum) => d.secondary);

        let primaryDomain:   AxisDomain;
        let secondaryDomain: AxisDomain;

        if (!s.leftAxisAutoRange) {
            primaryDomain = {
                min: Math.min(s.leftAxisMin, s.leftAxisMax),
                max: Math.max(s.leftAxisMin, s.leftAxisMax)
            };
        } else {
            primaryDomain = this.getIndependentAxisDomain(primaryExtent);
        }

        if (!s.rightAxisAutoRange) {
            secondaryDomain = {
                min: Math.min(s.rightAxisMin, s.rightAxisMax),
                max: Math.max(s.rightAxisMin, s.rightAxisMax)
            };
        } else {
            secondaryDomain = this.getIndependentAxisDomain(secondaryExtent);
        }

        // Apply .nice() to each domain independently, then align zeros so that
        // 0 sits at the identical pixel on both the left and right axes.
        const _tempP = d3.scaleLinear().domain([primaryDomain.min,   primaryDomain.max  ]).nice();
        const _tempS = d3.scaleLinear().domain([secondaryDomain.min, secondaryDomain.max]).nice();
        const [nPMin, nPMax] = _tempP.domain() as [number, number];
        const [nSMin, nSMax] = _tempS.domain() as [number, number];

        if (s.leftAxisAutoRange || s.rightAxisAutoRange) {
            const aligned = this.alignZeros(
                { min: nPMin, max: nPMax },
                { min: nSMin, max: nSMax }
            );
            if (s.leftAxisAutoRange)  { primaryDomain   = aligned.primary;   }
            if (s.rightAxisAutoRange) { secondaryDomain = aligned.secondary; }
        } else {
            primaryDomain   = { min: nPMin, max: nPMax };
            secondaryDomain = { min: nSMin, max: nSMax };
        }

        // ── Scales ────────────────────────────────────────────────────────────
        const xScale = d3.scaleBand<string>()
            .domain(chartData.map(d => d.category))
            .range([0, width])
            .paddingInner(0.24)
            .paddingOuter(0.14);

        const innerBand = d3.scaleBand<typeof BAR_KEYS[number]>()
            .domain(BAR_KEYS)
            .range([0, xScale.bandwidth()])
            .padding(0.1);

        const primaryScale   = d3.scaleLinear()
            .domain([primaryDomain.min,   primaryDomain.max  ])
            .range([height, 0]);
        const secondaryScale = d3.scaleLinear()
            .domain([secondaryDomain.min, secondaryDomain.max])
            .range([height, 0]);

        const zeroY = primaryScale(0);  // equals secondaryScale(0) after alignment

        // ── Grid lines ────────────────────────────────────────────────────────
        this.renderGridLines(primaryScale, width, height);

        // ── Zero baseline ─────────────────────────────────────────────────────
        this.plotArea.attr("transform", "translate(0,0)");
        this.zeroLine
            .attr("x1", 0).attr("x2", width)
            .attr("y1", zeroY).attr("y2", zeroY)
            .attr("stroke", "#374151")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "0");

        // ── Axes ──────────────────────────────────────────────────────────────
        const tickCount   = Math.max(2, Math.min(6, Math.floor(height / 50)));
        const leftAxisFn  = d3.axisLeft(primaryScale).ticks(tickCount)
            .tickFormat((v) => this.formatWithUnits(v as number, s.leftAxisDisplayUnits));
        const rightAxisFn = d3.axisRight(secondaryScale).ticks(tickCount)
            .tickFormat((v) => this.formatWithUnits(v as number, s.rightAxisDisplayUnits));
        const xAxisFn     = d3.axisBottom(xScale).tickSize(4);

        if (s.showXAxis) {
            this.xAxisGroup
                .attr("transform", `translate(0,${height})`)
                .style("display", "")
                .call(xAxisFn);
            this.styleAxis(this.xAxisGroup, s.xAxisFontSize);
            this.applyXAxisRotation(s.xAxisLabelRotation);
            this.applyLabelTruncation(s.xAxisMaxLabelLength);
        } else {
            this.xAxisGroup.style("display", "none").selectAll("*").remove();
        }

        this.leftYAxisGroup
            .attr("transform", "translate(0,0)")
            .style("display", s.showLeftAxis ? "" : "none");
        if (s.showLeftAxis) {
            this.leftYAxisGroup.call(leftAxisFn);
            this.styleAxis(this.leftYAxisGroup, s.leftAxisFontSize);
        }

        this.rightYAxisGroup
            .attr("transform", `translate(${width},0)`)
            .style("display", s.showRightAxis ? "" : "none");
        if (s.showRightAxis) {
            this.rightYAxisGroup.call(rightAxisFn);
            this.styleAxis(this.rightYAxisGroup, s.rightAxisFontSize);
        }

        // ── Bars ──────────────────────────────────────────────────────────────
        const groupSelection = this.plotArea
            .selectAll<SVGGElement, ChartDatum>(".category-group")
            .data(chartData, (d: ChartDatum) => d.category)
            .join((enter: d3.Selection<d3.EnterElement, ChartDatum, SVGGElement, unknown>) =>
                enter.append("g").attr("class", "category-group")
            );

        groupSelection.attr("transform", (d: ChartDatum) =>
            `translate(${xScale(d.category) ?? 0},0)`
        );

        const bars = groupSelection
            .selectAll<SVGRectElement, RenderedBarDatum>("rect.bar")
            .data((d: ChartDatum): RenderedBarDatum[] => [
                { key: "primary",   datum: d },
                { key: "secondary", datum: d }
            ])
            .join((enter: d3.Selection<d3.EnterElement, RenderedBarDatum, SVGGElement, ChartDatum>) =>
                enter.append("rect").attr("class", "bar")
            );

        bars
            .attr("x",      (item: RenderedBarDatum) => innerBand(item.key) ?? 0)
            .attr("width",  innerBand.bandwidth())
            .attr("rx",     s.barCornerRadius)
            .attr("ry",     s.barCornerRadius)
            .attr("y", (item: RenderedBarDatum) => {
                const scale = item.key === "primary" ? primaryScale : secondaryScale;
                const val   = item.datum[item.key];
                return val >= 0 ? scale(val) : zeroY;
            })
            .attr("height", (item: RenderedBarDatum) => {
                const scale = item.key === "primary" ? primaryScale : secondaryScale;
                return Math.max(0, Math.abs(scale(item.datum[item.key]) - zeroY));
            })
            .attr("fill", (item: RenderedBarDatum) => {
                const isNeg = item.datum[item.key] < 0;
                if (item.key === "primary") {
                    return (isNeg && s.enableNegativeColors) ? s.primaryBarNegColor : s.primaryBarColor;
                }
                return (isNeg && s.enableNegativeColors) ? s.secondaryBarNegColor : s.secondaryBarColor;
            })
            .style("fill-opacity", String(s.barOpacity / 100))
            .on("pointermove", (event: PointerEvent, item: RenderedBarDatum) => {
                const units = item.key === "primary"
                    ? s.leftAxisDisplayUnits
                    : s.rightAxisDisplayUnits;
                this.showTooltip(event, {
                    category:     item.datum.category,
                    measureName:  this.getMeasureDisplayName(categorical, item.key),
                    value:        item.datum[item.key],
                    displayUnits: units
                });
            })
            .on("pointerleave", () => this.hideTooltip());

        // ── Data labels ───────────────────────────────────────────────────────
        if (s.showDataLabels) {
            const labels = groupSelection
                .selectAll<SVGTextElement, RenderedBarDatum>("text.data-label")
                .data((d: ChartDatum): RenderedBarDatum[] => [
                    { key: "primary",   datum: d },
                    { key: "secondary", datum: d }
                ])
                .join((enter: d3.Selection<d3.EnterElement, RenderedBarDatum, SVGGElement, ChartDatum>) =>
                    enter.append("text").attr("class", "data-label")
                );

            labels
                .attr("x", (item: RenderedBarDatum) =>
                    (innerBand(item.key) ?? 0) + innerBand.bandwidth() / 2
                )
                .attr("y", (item: RenderedBarDatum) => {
                    const scale  = item.key === "primary" ? primaryScale : secondaryScale;
                    const valueY = scale(item.datum[item.key]);
                    return item.datum[item.key] >= 0
                        ? valueY - 5
                        : valueY + s.dataLabelsFontSize + 2;
                })
                .attr("text-anchor", "middle")
                .attr("fill", (item: RenderedBarDatum) =>
                    item.key === "primary"
                        ? s.dataLabelsPrimaryColor
                        : s.dataLabelsSecondaryColor
                )
                .style("font",        `${s.dataLabelsFontSize}px Segoe UI, sans-serif`)
                .style("font-weight", "600")
                .text((item: RenderedBarDatum) => {
                    const units = item.key === "primary"
                        ? s.leftAxisDisplayUnits
                        : s.rightAxisDisplayUnits;
                    return this.formatWithUnits(item.datum[item.key], units);
                });
        } else {
            groupSelection.selectAll("text.data-label").remove();
        }

        // ── Legend ────────────────────────────────────────────────────────────
        const primaryLabel   = s.legendPrimaryLabel.trim()
            || this.getMeasureDisplayName(categorical, "primary");
        const secondaryLabel = s.legendSecondaryLabel.trim()
            || this.getMeasureDisplayName(categorical, "secondary");
        this.renderLegend(width, height, margin, primaryLabel, secondaryLabel);

        // default axis titles to measure names when user hasn't typed one
        this._defaultLeftTitle  = s.leftAxisTitle.trim()  || this.getMeasureDisplayName(categorical, "primary");
        this._defaultRightTitle = s.rightAxisTitle.trim() || this.getMeasureDisplayName(categorical, "secondary");
        this.renderAxisTitles(width, height, margin);
    }

    // ── Axis helpers ──────────────────────────────────────────────────────────

    private styleAxis(
        axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
        fontSize: number = 12
    ): void {
        axisGroup.selectAll<SVGTextElement, unknown>("text")
            .style("font", `${fontSize}px Segoe UI, sans-serif`)
            .attr("fill", "#374151");
        axisGroup.selectAll<SVGPathElement, unknown>("path").attr("stroke", "#d1d5db");
        axisGroup.selectAll<SVGLineElement, unknown>("line").attr("stroke", "#d1d5db");
    }

    private _defaultLeftTitle  = "";
    private _defaultRightTitle = "";

    private renderAxisTitles(
        width:  number,
        height: number,
        margin: { top: number; right: number; bottom: number; left: number }
    ): void {
        this.rootGroup.selectAll(".axis-title").remove();

        const s          = this.settings;
        const xTitle     = s.xAxisTitle.trim();
        const leftTitle  = this._defaultLeftTitle;
        const rightTitle = this._defaultRightTitle;

        if (xTitle && s.showXAxis) {
            this.rootGroup.append("text")
                .attr("class",       "axis-title axis-title-x")
                .attr("x",           width / 2)
                .attr("y",           height + margin.bottom - 6)
                .attr("text-anchor", "middle")
                .attr("fill",        "#6b7280")
                .style("font",       `${s.xAxisFontSize}px Segoe UI Semibold, sans-serif`)
                .text(xTitle);
        }

        if (s.showLeftAxis && leftTitle) {
            this.rootGroup.append("text")
                .attr("class",       "axis-title axis-title-left")
                .attr("transform",   `translate(${-(margin.left - 14)},${height / 2}) rotate(-90)`)
                .attr("text-anchor", "middle")
                .attr("fill",        "#6b7280")
                .style("font",       `${s.leftAxisFontSize}px Segoe UI Semibold, sans-serif`)
                .text(leftTitle);
        }

        if (s.showRightAxis && rightTitle) {
            this.rootGroup.append("text")
                .attr("class",       "axis-title axis-title-right")
                .attr("transform",   `translate(${width + margin.right - 14},${height / 2}) rotate(90)`)
                .attr("text-anchor", "middle")
                .attr("fill",        "#6b7280")
                .style("font",       `${s.rightAxisFontSize}px Segoe UI Semibold, sans-serif`)
                .text(rightTitle);
        }
    }

    // ── Data helpers ──────────────────────────────────────────────────────────

    private getChartData(categorical: DataViewCategorical): ChartDatum[] {
        const categories = categorical.categories?.[0]?.values ?? [];
        const values     = categorical.values;

        if (!values || categories.length === 0) {
            return [];
        }

        const primaryIndex   = this.getValueColumnIndex(values, "primaryValue",   0);
        const secondaryIndex = this.getValueColumnIndex(values, "secondaryValue", 1);

        const primaryValues   = values[primaryIndex]?.values   ?? [];
        const secondaryValues = values[secondaryIndex]?.values ?? [];

        return categories.map((category, index) => ({
            category:  this.formatCategory(category),
            primary:   this.toNumber(primaryValues[index]),
            secondary: this.toNumber(secondaryValues[index])
        }));
    }

    private getValueColumnIndex(
        values:        DataViewValueColumns,
        roleName:      string,
        fallbackIndex: number
    ): number {
        const roleIndex = values.findIndex(column => Boolean(column.source.roles?.[roleName]));
        if (roleIndex >= 0) { return roleIndex; }
        return Math.min(fallbackIndex, Math.max(0, values.length - 1));
    }

    private getMeasureDisplayName(
        categorical: DataViewCategorical,
        key:         typeof BAR_KEYS[number]
    ): string {
        const roleName = key === "primary" ? "primaryValue" : "secondaryValue";
        const fallback = key === "primary" ? "Primary Value" : "Secondary Value";
        const values   = categorical.values;
        if (!values) { return fallback; }
        const index = this.getValueColumnIndex(values, roleName, key === "primary" ? 0 : 1);
        return values[index]?.source.displayName ?? fallback;
    }

    /**
     * Align both axis domains so that 0 sits at the same pixel on both.
     * Whichever axis has zero further from the top becomes the reference;
     * the other axis is extended on the opposite side to match.
     */
    private alignZeros(
        pDomain: AxisDomain,
        sDomain: AxisDomain
    ): { primary: AxisDomain; secondary: AxisDomain } {
        const pSpan = pDomain.max - pDomain.min;
        const sSpan = sDomain.max - sDomain.min;

        // Zero fraction from the BOTTOM of each axis (0 = all negative, 1 = all positive)
        const pZeroFrac = pSpan > 0 ? -pDomain.min / pSpan : 0.5;
        const sZeroFrac = sSpan > 0 ? -sDomain.min / sSpan : 0.5;

        // Pick the zero position that is lowest (furthest from top, most space below 0)
        // so neither axis clips its negative data.
        const sharedZeroFrac = Math.max(pZeroFrac, sZeroFrac);

        const adjust = (domain: AxisDomain): AxisDomain => {
            if (sharedZeroFrac <= 0) { return { min: 0, max: Math.max(domain.max, 1) }; }
            if (sharedZeroFrac >= 1) { return { min: Math.min(domain.min, -1), max: 0 }; }

            const posData = Math.max(0, domain.max);  // data above 0
            const negData = Math.max(0, -domain.min); // magnitude of data below 0

            // Calculate required total span so both positive and negative data fit
            // given the shared zero fraction.
            // pos side uses fraction sharedZeroFrac of the span
            // neg side uses fraction (1 - sharedZeroFrac) of the span
            const spanFromPos = sharedZeroFrac  > 0 ? posData / sharedZeroFrac          : 0;
            const spanFromNeg = (1 - sharedZeroFrac) > 0 ? negData / (1 - sharedZeroFrac) : 0;
            const totalSpan   = Math.max(spanFromPos, spanFromNeg, 1);

            return {
                min: -(totalSpan * (1 - sharedZeroFrac)),
                max:   totalSpan * sharedZeroFrac
            };
        };

        return { primary: adjust(pDomain), secondary: adjust(sDomain) };
    }

    /**
     * Each axis is scaled independently to its own data range.
     * Always includes 0 so bars always grow from the baseline.
     * A 10% headroom pad is added above the max (and below the min for negatives).
     */
    private getIndependentAxisDomain(
        extent: [number | undefined, number | undefined]
    ): AxisDomain {
        const dataMin = extent[0] ?? 0;
        const dataMax = extent[1] ?? 0;

        if (dataMin === dataMax) {
            // Flat data — give a symmetric range around the value
            const mag = Math.abs(dataMin) || 1;
            return { min: dataMin - mag * 0.5, max: dataMax + mag * 0.5 };
        }

        const axisMin = Math.min(0, dataMin);
        const axisMax = Math.max(0, dataMax);
        const span    = axisMax - axisMin;

        return {
            min: axisMin < 0 ? axisMin - span * 0.05 : 0,
            max: axisMax + span * 0.08
        };
    }

    // ── Tooltip ───────────────────────────────────────────────────────────────

    private showTooltip(event: PointerEvent, tooltipDatum: TooltipDatum): void {
        this.tooltip
            .style("opacity", "1")
            .style("left",    `${event.offsetX + 14}px`)
            .style("top",     `${event.offsetY - 10}px`);

        this.tooltipCategoryLine.text(tooltipDatum.category);
        this.tooltipValueLine.text(
            `${tooltipDatum.measureName}: ${this.formatWithUnits(tooltipDatum.value, tooltipDatum.displayUnits)}`
        );
    }

    private hideTooltip(): void {
        this.tooltip.style("opacity", "0");
    }

    // ── Formatting ────────────────────────────────────────────────────────────

    private formatCategory(value: PrimitiveValue): string {
        if (value === null || value === undefined || value === "") {
            return "(Blank)";
        }
        // Power BI passes dates as Date objects — format them cleanly
        if (value instanceof Date) {
            return isNaN(value.getTime())
                ? "(Invalid Date)"
                : this.formatDate(value);
        }
        const str = String(value);
        // Detect serialized Date strings (contain timezone info)
        // e.g. "Mon Apr 27 2026 05:30:00 GMT+0530 (India Standard Time)"
        if (/GMT[+-]\d{4}/.test(str) || /\(.*Standard Time\)/.test(str)) {
            const d = new Date(str);
            if (!isNaN(d.getTime())) { return this.formatDate(d); }
        }
        // ISO-8601 date strings like "2026-04-01T00:00:00.000Z"
        if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
            const d = new Date(str);
            if (!isNaN(d.getTime())) { return this.formatDate(d); }
        }
        return str;
    }

    /** Format a Date as a short human-readable string, auto-choosing granularity. */
    private formatDate(d: Date): string {
        // If day is always 1 across the data it's likely monthly — show "MMM YYYY"
        // Conservatively: if hours/minutes/seconds are all zero, show date only
        if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
            if (d.getDate() === 1) {
                // Monthly cadence — show "Jan 2026"
                return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
            }
            // Daily cadence — show "Apr 27"
            return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        }
        // Has time component — show date + time
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }

    private toNumber(value: PrimitiveValue): number {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
        const parsed = typeof value === "string" ? parseFloat(value) : NaN;
        return Number.isFinite(parsed) ? parsed : 0;
    }

    /** Format a number with optional unit suffix (K / M / B) or auto-detect. */
    private formatWithUnits(value: number, units: string): string {
        const abs = Math.abs(value);
        switch (units) {
            case "thousands":
                return (value / 1e3).toFixed(abs >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K";
            case "millions":
                return (value / 1e6).toFixed(abs >= 1e7  ? 0 : 1).replace(/\.0$/, "") + "M";
            case "billions":
                return (value / 1e9).toFixed(abs >= 1e10 ? 0 : 1).replace(/\.0$/, "") + "B";
            case "auto": {
                if (abs >= 1e9) return (value / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
                if (abs >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
                if (abs >= 1e3) return (value / 1e3).toFixed(abs >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K";
                return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
            }
            default:
                return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
        }
    }

    // ── Grid lines & legend ───────────────────────────────────────────────────

    private computeMargins(): { top: number; right: number; bottom: number; left: number } {
        const s           = this.settings;
        const rotation    = Math.abs(s.xAxisLabelRotation);
        const xLabelH     = rotation >= 70 ? 80 : rotation >= 40 ? 64 : rotation >= 20 ? 48 : 24;
        const xTitleH     = (s.showXAxis && s.xAxisTitle.trim()) ? s.xAxisFontSize + 12 : 0;
        const legendTopH    = s.showLegend && s.legendPosition === "top"    ? s.legendFontSize + 16 : 0;
        const legendBottomH = s.showLegend && s.legendPosition === "bottom" ? s.legendFontSize + 16 : 0;
        const leftW  = s.showLeftAxis  ? (s.leftAxisTitle.trim()  ? 76 : 54) : 16;
        const rightW = s.showRightAxis ? (s.rightAxisTitle.trim() ? 76 : 54) : 16;
        return {
            top:    20 + legendTopH,
            right:  rightW,
            bottom: (s.showXAxis ? xLabelH : 8) + xTitleH + legendBottomH + 8,
            left:   leftW
        };
    }

    private renderGridLines(
        scale:  d3.ScaleLinear<number, number>,
        width:  number,
        height: number
    ): void {
        this.gridLinesGroup.selectAll(".grid-line").remove();
        if (!this.settings.showGridLines) { return; }

        const ticks = scale.ticks(Math.max(2, Math.min(6, Math.floor(height / 50))));
        this.gridLinesGroup
            .selectAll<SVGLineElement, number>(".grid-line")
            .data(ticks)
            .join((enter: d3.Selection<d3.EnterElement, number, SVGGElement, unknown>) =>
                enter.append("line").attr("class", "grid-line")
            )
            .attr("x1", 0).attr("x2", width)
            .attr("y1", (v: number) => scale(v))
            .attr("y2", (v: number) => scale(v))
            .attr("stroke",           this.settings.gridLineColor)
            .attr("stroke-width",     0.8)
            .attr("stroke-dasharray", "4 3")
            .attr("opacity",          0.7);
    }

    private renderLegend(
        width:          number,
        height:         number,
        margin:         { top: number; right: number; bottom: number; left: number },
        primaryLabel:   string,
        secondaryLabel: string
    ): void {
        this.legendGroup.selectAll("*").remove();
        if (!this.settings.showLegend) { return; }

        const s   = this.settings;
        const fs  = s.legendFontSize;
        const sq  = fs;
        const pad = 6;
        const sep = 20;

        const primW  = primaryLabel.length   * fs * 0.58 + sq + pad;
        const secW   = secondaryLabel.length * fs * 0.58 + sq + pad;
        const totalW = primW + sep + secW;
        const startX = Math.max(0, (width - totalW) / 2);
        const legendY = s.legendPosition === "top"
            ? -(margin.top - fs - 6)
            : height + margin.bottom - fs - 6;

        this.legendGroup.attr("transform", `translate(${startX},${legendY})`);

        // Primary swatch + label
        this.legendGroup.append("rect")
            .attr("width", sq).attr("height", sq).attr("rx", 2)
            .attr("fill", s.primaryBarColor)
            .style("fill-opacity", String(s.barOpacity / 100));
        this.legendGroup.append("text")
            .attr("x", sq + pad).attr("y", sq - 1)
            .style("font", `${fs}px Segoe UI, sans-serif`)
            .attr("fill", "#374151")
            .text(primaryLabel);

        // Secondary swatch + label
        this.legendGroup.append("rect")
            .attr("x", primW + sep).attr("width", sq).attr("height", sq).attr("rx", 2)
            .attr("fill", s.secondaryBarColor)
            .style("fill-opacity", String(s.barOpacity / 100));
        this.legendGroup.append("text")
            .attr("x", primW + sep + sq + pad).attr("y", sq - 1)
            .style("font", `${fs}px Segoe UI, sans-serif`)
            .attr("fill", "#374151")
            .text(secondaryLabel);
    }

    private applyXAxisRotation(rotation: number): void {
        const texts = this.xAxisGroup.selectAll<SVGTextElement, unknown>("text");
        if (rotation === 0) {
            texts.attr("transform", null)
                 .attr("text-anchor", "middle")
                 .attr("dx", null)
                 .attr("dy", "0.71em");
            return;
        }
        texts
            .attr("transform",   `rotate(${rotation})`)
            .attr("text-anchor", rotation < 0 ? "end" : "start")
            .attr("dx",          rotation < 0 ? "-0.4em" : "0.4em")
            .attr("dy",          (rotation === -90 || rotation === 90) ? "0.35em" : "0.5em");
    }

    private applyLabelTruncation(maxLen: number): void {
        if (maxLen <= 0) { return; }
        this.xAxisGroup.selectAll<SVGTextElement, unknown>("text").each(function () {
            const el   = d3.select(this);
            const text = el.text();
            if (text.length > maxLen) {
                el.text(text.slice(0, maxLen) + "\u2026");
            }
        });
    }
}

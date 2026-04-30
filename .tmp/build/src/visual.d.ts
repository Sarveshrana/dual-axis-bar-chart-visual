import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
type FormattingModel = powerbi.visuals.FormattingModel;
type VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private readonly svg;
    private readonly rootGroup;
    private readonly gridLinesGroup;
    private readonly plotArea;
    private readonly xAxisGroup;
    private readonly leftYAxisGroup;
    private readonly rightYAxisGroup;
    private readonly legendGroup;
    private readonly zeroLine;
    private readonly tooltip;
    private readonly tooltipCategoryLine;
    private readonly tooltipValueLine;
    private readonly host;
    private readonly selectionManager;
    private readonly formattingSettingsService;
    private formattingSettings;
    private settings;
    constructor(options?: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    getFormattingModel(): FormattingModel;
    private renderEmptyState;
    private renderChart;
    private styleAxis;
    private _defaultLeftTitle;
    private _defaultRightTitle;
    private renderAxisTitles;
    private getChartData;
    private getValueColumnIndex;
    private getMeasureDisplayName;
    /**
     * Align both axis domains so that 0 sits at the same pixel on both.
     * Whichever axis has zero further from the top becomes the reference;
     * the other axis is extended on the opposite side to match.
     */
    private alignZeros;
    /**
     * Each axis is scaled independently to its own data range.
     * Always includes 0 so bars always grow from the baseline.
     * A 10% headroom pad is added above the max (and below the min for negatives).
     */
    private getIndependentAxisDomain;
    private showTooltip;
    private hideTooltip;
    private formatCategory;
    /** Format a Date as a short human-readable string, auto-choosing granularity. */
    private formatDate;
    private toNumber;
    /** Format a number with optional unit suffix (K / M / B) or auto-detect. */
    private formatWithUnits;
    private computeMargins;
    private renderGridLines;
    private renderLegend;
    private applyXAxisRotation;
    private applyLabelTruncation;
}
export {};

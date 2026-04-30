import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard  = formattingSettings.SimpleCard;
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsSlice  = formattingSettings.Slice;

// ── Shared drop-down item arrays ──────────────────────────────────────────────
const ROTATION_ITEMS: powerbi.IEnumMember[] = [
    { value: "0",   displayName: "0°"   },
    { value: "-30", displayName: "-30°" },
    { value: "-45", displayName: "-45°" },
    { value: "-90", displayName: "-90°" }
];

const DISPLAY_UNIT_ITEMS: powerbi.IEnumMember[] = [
    { value: "auto",      displayName: "Auto"          },
    { value: "none",      displayName: "None"          },
    { value: "thousands", displayName: "Thousands (K)" },
    { value: "millions",  displayName: "Millions (M)"  },
    { value: "billions",  displayName: "Billions (B)"  }
];

const LEGEND_POSITION_ITEMS: powerbi.IEnumMember[] = [
    { value: "top",    displayName: "Top"    },
    { value: "bottom", displayName: "Bottom" }
];

// ── Cards ─────────────────────────────────────────────────────────────────────
class BarColorsCard extends FormattingSettingsCard {
    primaryBarColor = new formattingSettings.ColorPicker({
        name: "primaryBarColor",
        displayName: "Primary Bar Color",
        value: { value: "#2563eb" }
    });
    secondaryBarColor = new formattingSettings.ColorPicker({
        name: "secondaryBarColor",
        displayName: "Secondary Bar Color",
        value: { value: "#f97316" }
    });
    barOpacity = new formattingSettings.NumUpDown({
        name: "barOpacity",
        displayName: "Bar Opacity (%)",
        value: 85
    });
    barCornerRadius = new formattingSettings.NumUpDown({
        name: "barCornerRadius",
        displayName: "Corner Radius (px)",
        value: 3
    });
    enableNegativeColors = new formattingSettings.ToggleSwitch({
        name: "enableNegativeColors",
        displayName: "Different Color for Negative Values",
        value: false
    });
    primaryBarNegColor = new formattingSettings.ColorPicker({
        name: "primaryBarNegColor",
        displayName: "Primary — Negative Color",
        value: { value: "#dc2626" }
    });
    secondaryBarNegColor = new formattingSettings.ColorPicker({
        name: "secondaryBarNegColor",
        displayName: "Secondary — Negative Color",
        value: { value: "#9a3412" }
    });
    name        = "barColors";
    displayName = "Bar Styling";
    slices: FormattingSettingsSlice[] = [
        this.primaryBarColor,     this.secondaryBarColor,
        this.barOpacity,          this.barCornerRadius,
        this.enableNegativeColors,
        this.primaryBarNegColor,  this.secondaryBarNegColor
    ];
}

class LegendCard extends FormattingSettingsCard {
    showLegend = new formattingSettings.ToggleSwitch({
        name: "showLegend",
        displayName: "Show Legend",
        value: true
    });
    legendPrimaryLabel = new formattingSettings.TextInput({
        name: "legendPrimaryLabel",
        displayName: "Primary Series Name",
        placeholder: "Auto (uses field name)",
        value: ""
    });
    legendSecondaryLabel = new formattingSettings.TextInput({
        name: "legendSecondaryLabel",
        displayName: "Secondary Series Name",
        placeholder: "Auto (uses field name)",
        value: ""
    });
    legendPosition = new formattingSettings.ItemDropdown({
        name: "legendPosition",
        displayName: "Position",
        items: LEGEND_POSITION_ITEMS,
        value: LEGEND_POSITION_ITEMS[0]
    });
    legendFontSize = new formattingSettings.NumUpDown({
        name: "legendFontSize",
        displayName: "Font Size",
        value: 12
    });
    name        = "legend";
    displayName = "Legend";
    slices: FormattingSettingsSlice[] = [
        this.showLegend,          this.legendPrimaryLabel,
        this.legendSecondaryLabel, this.legendPosition, this.legendFontSize
    ];
}

class XAxisCard extends FormattingSettingsCard {
    showXAxis = new formattingSettings.ToggleSwitch({
        name: "showXAxis",
        displayName: "Show X-Axis",
        value: true
    });
    xAxisTitle = new formattingSettings.TextInput({
        name: "xAxisTitle",
        displayName: "Axis Title",
        placeholder: "Enter X-axis title",
        value: ""
    });
    xAxisFontSize = new formattingSettings.NumUpDown({
        name: "xAxisFontSize",
        displayName: "Font Size",
        value: 11
    });
    xAxisLabelRotation = new formattingSettings.ItemDropdown({
        name: "xAxisLabelRotation",
        displayName: "Label Rotation",
        items: ROTATION_ITEMS,
        value: ROTATION_ITEMS[2]   // default -45°
    });
    xAxisMaxLabelLength = new formattingSettings.NumUpDown({
        name: "xAxisMaxLabelLength",
        displayName: "Max Label Length (0 = off)",
        value: 0
    });
    name        = "xAxis";
    displayName = "X-Axis";
    slices: FormattingSettingsSlice[] = [
        this.showXAxis, this.xAxisTitle, this.xAxisFontSize,
        this.xAxisLabelRotation, this.xAxisMaxLabelLength
    ];
}

class LeftAxisCard extends FormattingSettingsCard {
    showLeftAxis = new formattingSettings.ToggleSwitch({
        name: "showLeftAxis",
        displayName: "Show Left Y-Axis",
        value: true
    });
    leftAxisTitle = new formattingSettings.TextInput({
        name: "leftAxisTitle",
        displayName: "Axis Title",
        placeholder: "Enter title",
        value: "Primary Value"
    });
    leftAxisFontSize = new formattingSettings.NumUpDown({
        name: "leftAxisFontSize",
        displayName: "Font Size",
        value: 11
    });
    leftAxisDisplayUnits = new formattingSettings.ItemDropdown({
        name: "leftAxisDisplayUnits",
        displayName: "Display Units",
        items: DISPLAY_UNIT_ITEMS,
        value: DISPLAY_UNIT_ITEMS[0]
    });
    leftAxisDecimalPlaces = new formattingSettings.NumUpDown({
        name: "leftAxisDecimalPlaces",
        displayName: "Decimal Places",
        value: 2
    });
    leftAxisAutoRange = new formattingSettings.ToggleSwitch({
        name: "leftAxisAutoRange",
        displayName: "Auto Range",
        value: true
    });
    leftAxisMin = new formattingSettings.NumUpDown({
        name: "leftAxisMin",
        displayName: "Min Value (manual)",
        value: 0
    });
    leftAxisMax = new formattingSettings.NumUpDown({
        name: "leftAxisMax",
        displayName: "Max Value (manual)",
        value: 100
    });
    name        = "leftAxis";
    displayName = "Left Y-Axis (Primary)";
    slices: FormattingSettingsSlice[] = [
        this.showLeftAxis,        this.leftAxisTitle,   this.leftAxisFontSize,
        this.leftAxisDisplayUnits, this.leftAxisDecimalPlaces, this.leftAxisAutoRange,
        this.leftAxisMin,         this.leftAxisMax
    ];
}

class RightAxisCard extends FormattingSettingsCard {
    showRightAxis = new formattingSettings.ToggleSwitch({
        name: "showRightAxis",
        displayName: "Show Right Y-Axis",
        value: true
    });
    rightAxisTitle = new formattingSettings.TextInput({
        name: "rightAxisTitle",
        displayName: "Axis Title",
        placeholder: "Enter title",
        value: "Secondary Value"
    });
    rightAxisFontSize = new formattingSettings.NumUpDown({
        name: "rightAxisFontSize",
        displayName: "Font Size",
        value: 11
    });
    rightAxisDisplayUnits = new formattingSettings.ItemDropdown({
        name: "rightAxisDisplayUnits",
        displayName: "Display Units",
        items: DISPLAY_UNIT_ITEMS,
        value: DISPLAY_UNIT_ITEMS[0]
    });
    rightAxisDecimalPlaces = new formattingSettings.NumUpDown({
        name: "rightAxisDecimalPlaces",
        displayName: "Decimal Places",
        value: 2
    });
    rightAxisAutoRange = new formattingSettings.ToggleSwitch({
        name: "rightAxisAutoRange",
        displayName: "Auto Range",
        value: true
    });
    rightAxisMin = new formattingSettings.NumUpDown({
        name: "rightAxisMin",
        displayName: "Min Value (manual)",
        value: 0
    });
    rightAxisMax = new formattingSettings.NumUpDown({
        name: "rightAxisMax",
        displayName: "Max Value (manual)",
        value: 100
    });
    name        = "rightAxis";
    displayName = "Right Y-Axis (Secondary)";
    slices: FormattingSettingsSlice[] = [
        this.showRightAxis,        this.rightAxisTitle,   this.rightAxisFontSize,
        this.rightAxisDisplayUnits, this.rightAxisDecimalPlaces, this.rightAxisAutoRange,
        this.rightAxisMin,         this.rightAxisMax
    ];
}

class GridLinesCard extends FormattingSettingsCard {
    showGridLines = new formattingSettings.ToggleSwitch({
        name: "showGridLines",
        displayName: "Show Grid Lines",
        value: true
    });
    gridLineColor = new formattingSettings.ColorPicker({
        name: "gridLineColor",
        displayName: "Grid Line Color",
        value: { value: "#e5e7eb" }
    });
    name        = "gridLines";
    displayName = "Grid Lines";
    slices: FormattingSettingsSlice[] = [this.showGridLines, this.gridLineColor];
}

class DataLabelsCard extends FormattingSettingsCard {
    showDataLabels = new formattingSettings.ToggleSwitch({
        name: "showDataLabels",
        displayName: "Show Data Labels",
        value: false
    });
    dataLabelsFontSize = new formattingSettings.NumUpDown({
        name: "dataLabelsFontSize",
        displayName: "Font Size",
        value: 10
    });
    dataLabelsPrimaryColor = new formattingSettings.ColorPicker({
        name: "dataLabelsPrimaryColor",
        displayName: "Primary Label Color",
        value: { value: "#1e3a5f" }
    });
    dataLabelsSecondaryColor = new formattingSettings.ColorPicker({
        name: "dataLabelsSecondaryColor",
        displayName: "Secondary Label Color",
        value: { value: "#7c2d00" }
    });
    dataLabelsPrimaryDisplayUnits = new formattingSettings.ItemDropdown({
        name: "dataLabelsPrimaryDisplayUnits",
        displayName: "Primary Display Units",
        items: DISPLAY_UNIT_ITEMS,
        value: DISPLAY_UNIT_ITEMS[0]
    });
    dataLabelsSecondaryDisplayUnits = new formattingSettings.ItemDropdown({
        name: "dataLabelsSecondaryDisplayUnits",
        displayName: "Secondary Display Units",
        items: DISPLAY_UNIT_ITEMS,
        value: DISPLAY_UNIT_ITEMS[0]
    });
    dataLabelsPrimaryDecimalPlaces = new formattingSettings.NumUpDown({
        name: "dataLabelsPrimaryDecimalPlaces",
        displayName: "Primary Decimal Places",
        value: 2
    });
    dataLabelsSecondaryDecimalPlaces = new formattingSettings.NumUpDown({
        name: "dataLabelsSecondaryDecimalPlaces",
        displayName: "Secondary Decimal Places",
        value: 2
    });
    name        = "dataLabels";
    displayName = "Data Labels";
    slices: FormattingSettingsSlice[] = [
        this.showDataLabels,     this.dataLabelsFontSize,
        this.dataLabelsPrimaryColor, this.dataLabelsSecondaryColor,
        this.dataLabelsPrimaryDisplayUnits,
        this.dataLabelsSecondaryDisplayUnits,
        this.dataLabelsPrimaryDecimalPlaces,
        this.dataLabelsSecondaryDecimalPlaces
    ];
}

// ── Model ─────────────────────────────────────────────────────────────────────
export interface VisualSettings {
    primaryBarColor:          string;
    secondaryBarColor:        string;
    barOpacity:               number;
    barCornerRadius:          number;
    enableNegativeColors:     boolean;
    primaryBarNegColor:       string;
    secondaryBarNegColor:     string;
    showLegend:               boolean;
    legendPrimaryLabel:       string;
    legendSecondaryLabel:     string;
    legendPosition:           string;
    legendFontSize:           number;
    showXAxis:                boolean;
    xAxisTitle:               string;
    xAxisFontSize:            number;
    xAxisLabelRotation:       number;
    xAxisMaxLabelLength:      number;
    showLeftAxis:             boolean;
    leftAxisTitle:            string;
    leftAxisFontSize:         number;
    leftAxisDisplayUnits:     string;
    leftAxisDecimalPlaces:    number;
    leftAxisAutoRange:        boolean;
    leftAxisMin:              number;
    leftAxisMax:              number;
    showRightAxis:            boolean;
    rightAxisTitle:           string;
    rightAxisFontSize:        number;
    rightAxisDisplayUnits:    string;
    rightAxisDecimalPlaces:   number;
    rightAxisAutoRange:       boolean;
    rightAxisMin:             number;
    rightAxisMax:             number;
    showGridLines:            boolean;
    gridLineColor:            string;
    showDataLabels:           boolean;
    dataLabelsFontSize:       number;
    dataLabelsPrimaryColor:   string;
    dataLabelsSecondaryColor: string;
    dataLabelsPrimaryDisplayUnits: string;
    dataLabelsSecondaryDisplayUnits: string;
    dataLabelsPrimaryDecimalPlaces: number;
    dataLabelsSecondaryDecimalPlaces: number;
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    barColorsCard  = new BarColorsCard();
    legendCard     = new LegendCard();
    xAxisCard      = new XAxisCard();
    leftAxisCard   = new LeftAxisCard();
    rightAxisCard  = new RightAxisCard();
    gridLinesCard  = new GridLinesCard();
    dataLabelsCard = new DataLabelsCard();

    cards = [
        this.barColorsCard, this.legendCard,    this.xAxisCard,
        this.leftAxisCard,  this.rightAxisCard, this.gridLinesCard,
        this.dataLabelsCard
    ];
}

function enumVal(member: powerbi.IEnumMember | { value: string | number }): string {
    return String(member.value);
}

export function getVisualSettings(model?: VisualFormattingSettingsModel): VisualSettings {
    const m = model ?? new VisualFormattingSettingsModel();
    return {
        primaryBarColor:          m.barColorsCard.primaryBarColor.value.value,
        secondaryBarColor:        m.barColorsCard.secondaryBarColor.value.value,
        barOpacity:               Math.min(100, Math.max(0,  m.barColorsCard.barOpacity.value)),
        barCornerRadius:          Math.min(20,  Math.max(0,  m.barColorsCard.barCornerRadius.value)),
        enableNegativeColors:     m.barColorsCard.enableNegativeColors.value,
        primaryBarNegColor:       m.barColorsCard.primaryBarNegColor.value.value,
        secondaryBarNegColor:     m.barColorsCard.secondaryBarNegColor.value.value,
        showLegend:               m.legendCard.showLegend.value,
        legendPrimaryLabel:       m.legendCard.legendPrimaryLabel.value,
        legendSecondaryLabel:     m.legendCard.legendSecondaryLabel.value,
        legendPosition:           enumVal(m.legendCard.legendPosition.value),
        legendFontSize:           Math.min(24, Math.max(8,  m.legendCard.legendFontSize.value)),
        showXAxis:                m.xAxisCard.showXAxis.value,
        xAxisTitle:               m.xAxisCard.xAxisTitle.value,
        xAxisFontSize:            Math.min(24, Math.max(6,  m.xAxisCard.xAxisFontSize.value)),
        xAxisLabelRotation:       Number(enumVal(m.xAxisCard.xAxisLabelRotation.value)),
        xAxisMaxLabelLength:      Math.max(0,  m.xAxisCard.xAxisMaxLabelLength.value),
        showLeftAxis:             m.leftAxisCard.showLeftAxis.value,
        leftAxisTitle:            m.leftAxisCard.leftAxisTitle.value,
        leftAxisFontSize:         Math.min(24, Math.max(6,  m.leftAxisCard.leftAxisFontSize.value)),
        leftAxisDisplayUnits:     enumVal(m.leftAxisCard.leftAxisDisplayUnits.value),
        leftAxisDecimalPlaces:    Math.min(6, Math.max(0, m.leftAxisCard.leftAxisDecimalPlaces.value)),
        leftAxisAutoRange:        m.leftAxisCard.leftAxisAutoRange.value,
        leftAxisMin:              m.leftAxisCard.leftAxisMin.value,
        leftAxisMax:              m.leftAxisCard.leftAxisMax.value,
        showRightAxis:            m.rightAxisCard.showRightAxis.value,
        rightAxisTitle:           m.rightAxisCard.rightAxisTitle.value,
        rightAxisFontSize:        Math.min(24, Math.max(6,  m.rightAxisCard.rightAxisFontSize.value)),
        rightAxisDisplayUnits:    enumVal(m.rightAxisCard.rightAxisDisplayUnits.value),
        rightAxisDecimalPlaces:   Math.min(6, Math.max(0, m.rightAxisCard.rightAxisDecimalPlaces.value)),
        rightAxisAutoRange:       m.rightAxisCard.rightAxisAutoRange.value,
        rightAxisMin:             m.rightAxisCard.rightAxisMin.value,
        rightAxisMax:             m.rightAxisCard.rightAxisMax.value,
        showGridLines:            m.gridLinesCard.showGridLines.value,
        gridLineColor:            m.gridLinesCard.gridLineColor.value.value,
        showDataLabels:           m.dataLabelsCard.showDataLabels.value,
        dataLabelsFontSize:       Math.min(20, Math.max(6,  m.dataLabelsCard.dataLabelsFontSize.value)),
        dataLabelsPrimaryColor:   m.dataLabelsCard.dataLabelsPrimaryColor.value.value,
        dataLabelsSecondaryColor: m.dataLabelsCard.dataLabelsSecondaryColor.value.value,
        dataLabelsPrimaryDisplayUnits:   enumVal(m.dataLabelsCard.dataLabelsPrimaryDisplayUnits.value),
        dataLabelsSecondaryDisplayUnits: enumVal(m.dataLabelsCard.dataLabelsSecondaryDisplayUnits.value),
        dataLabelsPrimaryDecimalPlaces:   Math.min(6, Math.max(0, m.dataLabelsCard.dataLabelsPrimaryDecimalPlaces.value)),
        dataLabelsSecondaryDecimalPlaces: Math.min(6, Math.max(0, m.dataLabelsCard.dataLabelsSecondaryDecimalPlaces.value))
    };
}
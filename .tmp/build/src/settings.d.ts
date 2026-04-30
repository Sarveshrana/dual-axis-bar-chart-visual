import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsSlice = formattingSettings.Slice;
declare class BarColorsCard extends FormattingSettingsCard {
    primaryBarColor: formattingSettings.ColorPicker;
    secondaryBarColor: formattingSettings.ColorPicker;
    barOpacity: formattingSettings.NumUpDown;
    barCornerRadius: formattingSettings.NumUpDown;
    enableNegativeColors: formattingSettings.ToggleSwitch;
    primaryBarNegColor: formattingSettings.ColorPicker;
    secondaryBarNegColor: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class LegendCard extends FormattingSettingsCard {
    showLegend: formattingSettings.ToggleSwitch;
    legendPrimaryLabel: formattingSettings.TextInput;
    legendSecondaryLabel: formattingSettings.TextInput;
    legendPosition: formattingSettings.ItemDropdown;
    legendFontSize: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class XAxisCard extends FormattingSettingsCard {
    showXAxis: formattingSettings.ToggleSwitch;
    xAxisTitle: formattingSettings.TextInput;
    xAxisFontSize: formattingSettings.NumUpDown;
    xAxisLabelRotation: formattingSettings.ItemDropdown;
    xAxisMaxLabelLength: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class LeftAxisCard extends FormattingSettingsCard {
    showLeftAxis: formattingSettings.ToggleSwitch;
    leftAxisTitle: formattingSettings.TextInput;
    leftAxisFontSize: formattingSettings.NumUpDown;
    leftAxisDisplayUnits: formattingSettings.ItemDropdown;
    leftAxisDecimalPlaces: formattingSettings.NumUpDown;
    leftAxisAutoRange: formattingSettings.ToggleSwitch;
    leftAxisMin: formattingSettings.NumUpDown;
    leftAxisMax: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class RightAxisCard extends FormattingSettingsCard {
    showRightAxis: formattingSettings.ToggleSwitch;
    rightAxisTitle: formattingSettings.TextInput;
    rightAxisFontSize: formattingSettings.NumUpDown;
    rightAxisDisplayUnits: formattingSettings.ItemDropdown;
    rightAxisDecimalPlaces: formattingSettings.NumUpDown;
    rightAxisAutoRange: formattingSettings.ToggleSwitch;
    rightAxisMin: formattingSettings.NumUpDown;
    rightAxisMax: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class GridLinesCard extends FormattingSettingsCard {
    showGridLines: formattingSettings.ToggleSwitch;
    gridLineColor: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class DataLabelsCard extends FormattingSettingsCard {
    showDataLabels: formattingSettings.ToggleSwitch;
    dataLabelsFontSize: formattingSettings.NumUpDown;
    dataLabelsPrimaryColor: formattingSettings.ColorPicker;
    dataLabelsSecondaryColor: formattingSettings.ColorPicker;
    dataLabelsPrimaryDisplayUnits: formattingSettings.ItemDropdown;
    dataLabelsSecondaryDisplayUnits: formattingSettings.ItemDropdown;
    dataLabelsPrimaryDecimalPlaces: formattingSettings.NumUpDown;
    dataLabelsSecondaryDecimalPlaces: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
export interface VisualSettings {
    primaryBarColor: string;
    secondaryBarColor: string;
    barOpacity: number;
    barCornerRadius: number;
    enableNegativeColors: boolean;
    primaryBarNegColor: string;
    secondaryBarNegColor: string;
    showLegend: boolean;
    legendPrimaryLabel: string;
    legendSecondaryLabel: string;
    legendPosition: string;
    legendFontSize: number;
    showXAxis: boolean;
    xAxisTitle: string;
    xAxisFontSize: number;
    xAxisLabelRotation: number;
    xAxisMaxLabelLength: number;
    showLeftAxis: boolean;
    leftAxisTitle: string;
    leftAxisFontSize: number;
    leftAxisDisplayUnits: string;
    leftAxisDecimalPlaces: number;
    leftAxisAutoRange: boolean;
    leftAxisMin: number;
    leftAxisMax: number;
    showRightAxis: boolean;
    rightAxisTitle: string;
    rightAxisFontSize: number;
    rightAxisDisplayUnits: string;
    rightAxisDecimalPlaces: number;
    rightAxisAutoRange: boolean;
    rightAxisMin: number;
    rightAxisMax: number;
    showGridLines: boolean;
    gridLineColor: string;
    showDataLabels: boolean;
    dataLabelsFontSize: number;
    dataLabelsPrimaryColor: string;
    dataLabelsSecondaryColor: string;
    dataLabelsPrimaryDisplayUnits: string;
    dataLabelsSecondaryDisplayUnits: string;
    dataLabelsPrimaryDecimalPlaces: number;
    dataLabelsSecondaryDecimalPlaces: number;
}
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    barColorsCard: BarColorsCard;
    legendCard: LegendCard;
    xAxisCard: XAxisCard;
    leftAxisCard: LeftAxisCard;
    rightAxisCard: RightAxisCard;
    gridLinesCard: GridLinesCard;
    dataLabelsCard: DataLabelsCard;
    cards: (BarColorsCard | LegendCard | XAxisCard | LeftAxisCard | RightAxisCard | GridLinesCard | DataLabelsCard)[];
}
export declare function getVisualSettings(model?: VisualFormattingSettingsModel): VisualSettings;
export {};

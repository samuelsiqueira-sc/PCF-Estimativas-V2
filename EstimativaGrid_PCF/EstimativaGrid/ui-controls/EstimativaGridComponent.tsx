/**
 * Main component for the Estimativa Grid PCF control
 */

import * as React from 'react';
import { Stack, MessageBar, MessageBarType, Spinner, SpinnerSize } from '@fluentui/react';
import { Estimativa, LinhaDeEstimativa, ModeloDeEstimativa, Fase, Subfase, TipoDeDesenvolvimento } from '../models';
import { DataverseService } from '../services';
import { EstimationHeaderComponent } from './EstimationHeaderComponent';
import { EstimationLinesGridComponent } from './EstimationLinesGridComponent';
import { ModelImportDialog } from './ModelImportDialog';
import { recalculateAllLines, calculateTotalDevelopmentHours, calculateTotalSupportHours, calculateTotalProjectHours } from '../utils';

export interface EstimativaGridComponentProps {
    context: ComponentFramework.Context<any>;
    estimativaId?: string;
}

export interface EstimativaGridComponentState {
    loading: boolean;
    error?: string;
    estimativa?: Estimativa;
    lines: LinhaDeEstimativa[];
    fases: Fase[];
    subfases: Subfase[];
    tiposDesenvolvimento: TipoDeDesenvolvimento[];
    modelosEstimativa: ModeloDeEstimativa[];
    showModelImportDialog: boolean;
    isDirty: boolean;
    activityTypeLabels: Array<{ label: string; value: number }>;
    complexityLabels: Array<{ label: string; value: number }>;
    developmentLabel: string;
    processLabel: string;
    supportLabel: string;
}

export class EstimativaGridComponent extends React.Component<EstimativaGridComponentProps, EstimativaGridComponentState> {
    private dataverseService: DataverseService;

    constructor(props: EstimativaGridComponentProps) {
        super(props);
        this.dataverseService = new DataverseService(props.context.webAPI);
        this.state = {
            loading: true,
            lines: [],
            fases: [],
            subfases: [],
            tiposDesenvolvimento: [],
            modelosEstimativa: [],
            showModelImportDialog: false,
            isDirty: false,
            activityTypeLabels: [],
            complexityLabels: [],
            developmentLabel: 'Development',
            processLabel: 'Process',
            supportLabel: 'Support'
        };
    }

    async componentDidMount(): Promise<void> {
        await this.loadData();
    }

    async componentDidUpdate(prevProps: EstimativaGridComponentProps): Promise<void> {
        if (prevProps.estimativaId !== this.props.estimativaId && this.props.estimativaId) {
            await this.loadData();
        }
    }

    private async loadData(): Promise<void> {
        try {
            this.setState({ loading: true, error: undefined });

            // Load lookup data and option set labels
            const [fases, subfases, tiposDesenvolvimento, modelosEstimativa, activityTypeLabels, complexityLabels, developmentLabel, processLabel, supportLabel] = await Promise.all([
                this.dataverseService.retrieveFases(),
                this.dataverseService.retrieveSubfases(),
                this.dataverseService.retrieveTiposDeDesenvolvimento(),
                this.dataverseService.retrieveModelosDeEstimativa(),
                this.dataverseService.getActivityTypeLabels(),
                this.dataverseService.getComplexityLabels(),
                this.dataverseService.getDevelopmentLabel(),
                this.dataverseService.getProcessLabel(),
                this.dataverseService.getSupportLabel()
            ]);

            if (this.props.estimativaId) {
                // Load estimation and lines
                const [estimativa, lines] = await Promise.all([
                    this.dataverseService.retrieveEstimativa(this.props.estimativaId),
                    this.dataverseService.retrieveLinhasDeEstimativa(this.props.estimativaId)
                ]);

                this.setState({
                    loading: false,
                    estimativa,
                    lines,
                    fases,
                    subfases,
                    tiposDesenvolvimento,
                    modelosEstimativa,
                    activityTypeLabels,
                    complexityLabels,
                    developmentLabel,
                    processLabel,
                    supportLabel
                });
            } else {
                // New estimation - no ID yet
                this.setState({
                    loading: false,
                    estimativa: {},
                    lines: [],
                    fases,
                    subfases,
                    tiposDesenvolvimento,
                    modelosEstimativa,
                    activityTypeLabels,
                    complexityLabels,
                    developmentLabel,
                    processLabel,
                    supportLabel
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
            const errorMessage = error instanceof Error 
                ? `Failed to load data: ${error.message}` 
                : 'Failed to load data. Please check your connection and try again.';
            this.setState({
                loading: false,
                error: errorMessage
            });
        }
    }

    private handleEstimativaChange = (estimativa: Partial<Estimativa>): void => {
        this.setState(prevState => ({
            estimativa: { ...prevState.estimativa, ...estimativa },
            isDirty: true
        }));
    };

    private handleLineChange = (lineId: string, changes: Partial<LinhaDeEstimativa>): void => {
        this.setState(prevState => {
            const lines = prevState.lines.map(line => 
                line.smt_linhadeestimativaid === lineId ? { ...line, ...changes } : line
            );

            // Recalculate all lines with semantic labels
            const recalculatedLines = recalculateAllLines(
                lines, 
                prevState.developmentLabel, 
                prevState.processLabel, 
                prevState.supportLabel
            );

            // Update estimation totals
            const totalDevelopmentHours = calculateTotalDevelopmentHours(recalculatedLines, prevState.developmentLabel);
            const totalSupportHours = calculateTotalSupportHours(recalculatedLines, prevState.supportLabel);
            const totalProjectHours = calculateTotalProjectHours(totalDevelopmentHours, totalSupportHours);

            return {
                lines: recalculatedLines,
                estimativa: {
                    ...prevState.estimativa,
                    smt_totaldesenvolvimento: totalDevelopmentHours,
                    smt_totalhorasapoio: totalSupportHours,
                    smt_totalhorasprojeto: totalProjectHours
                },
                isDirty: true
            };
        });
    };

    private handleAddLine = (): void => {
        // Use crypto.randomUUID if available, fallback to timestamp-based ID
        // Always prefix with 'new-' to distinguish unsaved lines
        const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? `new-${crypto.randomUUID()}` 
            : `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
        const newLine: LinhaDeEstimativa = {
            smt_linhadeestimativaid: uniqueId,
            smt_estimativaid: this.props.estimativaId,
            smt_tipodeatividade: this.state.developmentLabel,
            smt_dimensionamento: 0,
            smt_estimativafinal: 0
        };

        this.setState(prevState => ({
            lines: [...prevState.lines, newLine],
            isDirty: true
        }));
    };

    private handleDeleteLine = async (lineId: string): Promise<void> => {
        const line = this.state.lines.find(l => l.smt_linhadeestimativaid === lineId);
        if (!line) return;

        // Prevent deletion of Process and Support lines
        if (line.smt_tipodeatividade === this.state.processLabel || line.smt_tipodeatividade === this.state.supportLabel) {
            this.setState({ error: 'Process and Support lines cannot be deleted as they are required for estimation calculations.' });
            return;
        }

        try {
            // Only delete from Dataverse if it's a persisted line
            if (!lineId.startsWith('new-')) {
                await this.dataverseService.deleteLinhaDeEstimativa(lineId);
            }

            this.setState(prevState => {
                const lines = prevState.lines.filter(l => l.smt_linhadeestimativaid !== lineId);
                const recalculatedLines = recalculateAllLines(
                    lines,
                    prevState.developmentLabel,
                    prevState.processLabel,
                    prevState.supportLabel
                );

                // Update estimation totals
                const totalDevelopmentHours = calculateTotalDevelopmentHours(recalculatedLines, prevState.developmentLabel);
                const totalSupportHours = calculateTotalSupportHours(recalculatedLines, prevState.supportLabel);
                const totalProjectHours = calculateTotalProjectHours(totalDevelopmentHours, totalSupportHours);

                return {
                    lines: recalculatedLines,
                    estimativa: {
                        ...prevState.estimativa,
                        smt_totaldesenvolvimento: totalDevelopmentHours,
                        smt_totalhorasapoio: totalSupportHours,
                        smt_totalhorasprojeto: totalProjectHours
                    },
                    isDirty: true
                };
            });
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? `Failed to delete line: ${error.message}` 
                : 'Failed to delete line. Please try again.';
            this.setState({ error: errorMessage });
        }
    };

    private handleOpenModelImport = (): void => {
        this.setState({ showModelImportDialog: true });
    };

    private handleCloseModelImport = (): void => {
        this.setState({ showModelImportDialog: false });
    };

    private handleImportModel = async (modelIds: string[]): Promise<void> => {
        try {
            this.setState({ loading: true, showModelImportDialog: false });

            if (!this.props.estimativaId) {
                throw new Error('No estimation ID available. The PCF control must be loaded within an estimation record.');
            }

            const startingOrder = this.state.lines.length;
            const importedLines: LinhaDeEstimativa[] = [];

            for (const modelId of modelIds) {
                const lines = await this.dataverseService.importModeloDeEstimativa(
                    this.props.estimativaId,
                    modelId,
                    startingOrder + importedLines.length
                );
                importedLines.push(...lines);
            }

            // Reload lines after import
            const lines = await this.dataverseService.retrieveLinhasDeEstimativa(this.props.estimativaId);
            const recalculatedLines = recalculateAllLines(
                lines,
                this.state.developmentLabel,
                this.state.processLabel,
                this.state.supportLabel
            );

            // Update estimation totals
            const totalDevelopmentHours = calculateTotalDevelopmentHours(recalculatedLines, this.state.developmentLabel);
            const totalSupportHours = calculateTotalSupportHours(recalculatedLines, this.state.supportLabel);
            const totalProjectHours = calculateTotalProjectHours(totalDevelopmentHours, totalSupportHours);

            this.setState({
                loading: false,
                lines: recalculatedLines,
                estimativa: {
                    ...this.state.estimativa,
                    smt_totaldesenvolvimento: totalDevelopmentHours,
                    smt_totalhorasapoio: totalSupportHours,
                    smt_totalhorasprojeto: totalProjectHours
                },
                isDirty: true
            });
        } catch (error) {
            console.error('Error during model import:', error);
            const errorMessage = error instanceof Error 
                ? `Failed to import model: ${error.message}` 
                : 'Failed to import model. Please try again.';
            this.setState({
                loading: false,
                error: errorMessage
            });
        }
    };

    private handleSave = async (): Promise<void> => {
        try {
            this.setState({ loading: true, error: undefined });

            const estimativaId = this.props.estimativaId;

            // Validate that we have an estimation ID
            if (!estimativaId) {
                throw new Error('Cannot save lines without a valid estimation ID. Please ensure the estimation record exists.');
            }

            // Save or update lines only
            if (estimativaId) {
                for (const line of this.state.lines) {
                    // Build a clean line object with only the properties we want to save
                    // Explicitly exclude navigation property display names
                    const cleanLine: Partial<LinhaDeEstimativa> = {
                        smt_linhadeestimativaid: line.smt_linhadeestimativaid,
                        smt_estimativaid: line.smt_estimativaid,
                        smt_faseid: line.smt_faseid,
                        smt_subfaseid: line.smt_subfaseid,
                        smt_tipodedesenvolvimentoid: line.smt_tipodedesenvolvimentoid,
                        smt_modulo: line.smt_modulo,
                        smt_requisitocliente: line.smt_requisitocliente,
                        smt_funcionalidade: line.smt_funcionalidade,
                        smt_descricao: line.smt_descricao,
                        smt_observacoestecnicas: line.smt_observacoestecnicas,
                        smt_dimensionamento: line.smt_dimensionamento,
                        smt_estimativafinal: line.smt_estimativafinal,
                        smt_tipodeatividade: line.smt_tipodeatividade,
                        smt_complexidade: line.smt_complexidade,
                        smt_dedesenvolvimento: line.smt_dedesenvolvimento
                    };
                    
                    if (line.smt_linhadeestimativaid?.startsWith('new-')) {
                        // Create new line
                        await this.dataverseService.createLinhaDeEstimativa({
                            ...cleanLine,
                            smt_estimativaid: estimativaId
                        });
                    } else if (line.smt_linhadeestimativaid) {
                        // Update existing line
                        await this.dataverseService.updateLinhaDeEstimativa(
                            line.smt_linhadeestimativaid,
                            cleanLine
                        );
                    }
                }
            }

            this.setState({ loading: false, isDirty: false });

            // Reload data to get updated values
            if (estimativaId) {
                await this.loadData();
            }
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? `Failed to save changes: ${error.message}` 
                : 'Failed to save changes. Please check required fields and try again.';
            this.setState({
                loading: false,
                error: errorMessage
            });
        }
    };

    private handleDevelopmentTypeChange = async (lineId: string, tipoId: string): Promise<void> => {
        try {
            // Retrieve the development type to get the default description
            const tipo = await this.dataverseService.retrieveTipoDeDesenvolvimento(tipoId);
            
            // Update the line with the development type and copy the default description
            this.handleLineChange(lineId, {
                smt_tipodedesenvolvimentoid: tipoId,
                smt_tipodedesenvolvimento: tipo.smt_nometipo,
                smt_descricao: tipo.smt_descricaopadrao || ''
            });
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? `Failed to retrieve development type: ${error.message}` 
                : 'Failed to retrieve development type details.';
            this.setState({ error: errorMessage });
        }
    };

    render(): React.ReactElement {
        const { loading, error, estimativa, lines, fases, subfases, tiposDesenvolvimento, modelosEstimativa, showModelImportDialog, activityTypeLabels, complexityLabels } = this.state;

        if (loading) {
            return (
                <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: '100%', padding: 20 } }}>
                    <Spinner size={SpinnerSize.large} label="Loading..." />
                </Stack>
            );
        }

        return (
            <Stack 
                styles={{ 
                    root: { 
                        height: '100%', 
                        width: '100%',
                        padding: '16px',
                        boxSizing: 'border-box',
                        overflow: 'auto'
                    } 
                }} 
                tokens={{ childrenGap: 16 }}
            >
                {error && (
                    <MessageBar
                        messageBarType={MessageBarType.error}
                        onDismiss={() => this.setState({ error: undefined })}
                    >
                        {error}
                    </MessageBar>
                )}

                {estimativa && (
                    <EstimationHeaderComponent
                        estimativa={estimativa}
                        modelosEstimativa={modelosEstimativa}
                        onChange={this.handleEstimativaChange}
                        onSave={this.handleSave}
                        onImportModel={this.handleOpenModelImport}
                        isDirty={this.state.isDirty}
                    />
                )}

                <EstimationLinesGridComponent
                    lines={lines}
                    fases={fases}
                    subfases={subfases}
                    tiposDesenvolvimento={tiposDesenvolvimento}
                    activityTypeLabels={activityTypeLabels}
                    complexityLabels={complexityLabels}
                    developmentLabel={this.state.developmentLabel}
                    processLabel={this.state.processLabel}
                    supportLabel={this.state.supportLabel}
                    onChange={this.handleLineChange}
                    onAdd={this.handleAddLine}
                    onDelete={this.handleDeleteLine}
                    onDevelopmentTypeChange={this.handleDevelopmentTypeChange}
                />

                {showModelImportDialog && (
                    <ModelImportDialog
                        modelos={modelosEstimativa}
                        onImport={this.handleImportModel}
                        onClose={this.handleCloseModelImport}
                    />
                )}
            </Stack>
        );
    }
}

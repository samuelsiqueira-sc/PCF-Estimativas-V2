/**
 * Estimation Lines Grid Component
 * Displays and allows inline editing of estimation lines
 */

import * as React from 'react';
import { 
    Stack, 
    DetailsList, 
    IColumn, 
    SelectionMode,
    TextField,
    Dropdown,
    IDropdownOption,
    IconButton,
    TooltipHost,
    Text,
    ConstrainMode
} from '@fluentui/react';
import { LinhaDeEstimativa, Fase, Subfase, TipoDeDesenvolvimento, ActivityType, Complexity } from '../models';

export interface EstimationLinesGridComponentProps {
    lines: LinhaDeEstimativa[];
    fases: Fase[];
    subfases: Subfase[];
    tiposDesenvolvimento: TipoDeDesenvolvimento[];
    activityTypeLabels: Array<{ label: string; value: number }>;
    complexityLabels: Array<{ label: string; value: number }>;
    developmentLabel: string;
    processLabel: string;
    supportLabel: string;
    onChange: (lineId: string, changes: Partial<LinhaDeEstimativa>) => void;
    onAdd: () => void;
    onDelete: (lineId: string) => void;
    onDevelopmentTypeChange: (lineId: string, tipoId: string) => void;
}

export const EstimationLinesGridComponent: React.FC<EstimationLinesGridComponentProps> = ({
    lines,
    fases,
    subfases,
    tiposDesenvolvimento,
    activityTypeLabels,
    complexityLabels,
    developmentLabel,
    processLabel,
    supportLabel,
    onChange,
    onAdd,
    onDelete,
    onDevelopmentTypeChange
}) => {
    // Use dynamic labels from Dataverse if available, otherwise use defaults
    const activityTypeOptions: IDropdownOption[] = activityTypeLabels.length > 0
        ? activityTypeLabels.map(({ label }) => ({ key: label, text: label }))
        : [
            { key: ActivityType.Development, text: 'Development' },
            { key: ActivityType.Process, text: 'Process' },
            { key: ActivityType.Support, text: 'Support' }
        ];

    const complexityOptions: IDropdownOption[] = complexityLabels.length > 0
        ? complexityLabels.map(({ label }) => ({ key: label, text: label }))
        : [
            { key: Complexity.VeryLow, text: 'Very Low' },
            { key: Complexity.Low, text: 'Low' },
            { key: Complexity.Medium, text: 'Medium' },
            { key: Complexity.High, text: 'High' },
            { key: Complexity.VeryHigh, text: 'Very High' }
        ];

    const faseOptions: IDropdownOption[] = fases.map(fase => ({
        key: (fase.smt_faseid || '').toLowerCase(),
        text: fase.smt_nomefase || ''
    }));

    const subfaseOptions: IDropdownOption[] = subfases.map(subfase => ({
        key: (subfase.smt_subfaseid || '').toLowerCase(),
        text: subfase.smt_nomesubfase || ''
    }));

    const tipoDesenvolvimentoOptions: IDropdownOption[] = tiposDesenvolvimento.map(tipo => ({
        key: (tipo.smt_tipodedesenvolvimentoid || '').toLowerCase(),
        text: tipo.smt_nometipo || ''
    }));

    const renderEditableTextField = (
        item: LinhaDeEstimativa,
        fieldName: keyof LinhaDeEstimativa,
        placeholder?: string
    ): JSX.Element => {
        return (
            <TextField
                value={String(item[fieldName] || '')}
                onChange={(_, value) => onChange(item.smt_linhadeestimativaid || '', { [fieldName]: value })}
                placeholder={placeholder}
                borderless
                styles={{ root: { width: '100%' }, field: { fontSize: 12 } }}
            />
        );
    };

    const renderEditableNumberField = (
        item: LinhaDeEstimativa,
        fieldName: keyof LinhaDeEstimativa,
        decimalPlaces: number = 2
    ): JSX.Element => {
        return (
            <TextField
                value={String(item[fieldName] !== undefined ? item[fieldName] : '')}
                onChange={(_, value) => {
                    const numValue = parseFloat(value || '0');
                    // Prevent negative values for dimensioning and percentage fields
                    const validValue = isNaN(numValue) ? 0 : Math.max(0, numValue);
                    onChange(item.smt_linhadeestimativaid || '', { [fieldName]: validValue });
                }}
                type="number"
                min="0"
                step={decimalPlaces === 2 ? "0.01" : "1"}
                borderless
                styles={{ root: { width: '100%' }, field: { fontSize: 12 } }}
            />
        );
    };

    const renderDropdown = (
        item: LinhaDeEstimativa,
        fieldName: keyof LinhaDeEstimativa,
        options: IDropdownOption[],
        onChange: (lineId: string, value: string) => void
    ): JSX.Element => {
        const selectedKey = item[fieldName] as string;
        // Normalize GUID to lowercase for consistent matching
        const normalizedKey = selectedKey?.toLowerCase();
        
        return (
            <Dropdown
                options={options}
                selectedKey={normalizedKey}
                onChange={(_, option) => onChange(item.smt_linhadeestimativaid || '', option?.key as string)}
                styles={{ root: { width: '100%' }, dropdown: { fontSize: 12 } }}
            />
        );
    };

    const columns: IColumn[] = [
        {
            key: 'actions',
            name: '',
            fieldName: 'actions',
            minWidth: 40,
            maxWidth: 40,
            onRender: (item: LinhaDeEstimativa) => {
                const canDelete = item.smt_tipodeatividade === developmentLabel;
                return (
                    <TooltipHost content={canDelete ? 'Delete' : 'Cannot delete Process/Support lines'}>
                        <IconButton
                            iconProps={{ iconName: 'Delete' }}
                            onClick={() => onDelete(item.smt_linhadeestimativaid || '')}
                            disabled={!canDelete}
                            styles={{ root: { height: 24 } }}
                        />
                    </TooltipHost>
                );
            }
        },
        {
            key: 'activityType',
            name: 'Activity Type',
            fieldName: 'smt_tipodeatividade',
            minWidth: 120,
            maxWidth: 120,
            onRender: (item: LinhaDeEstimativa) => 
                renderDropdown(item, 'smt_tipodeatividade', activityTypeOptions, (lineId, value) => 
                    onChange(lineId, { smt_tipodeatividade: value })
                )
        },
        {
            key: 'phase',
            name: 'Phase',
            fieldName: 'smt_fase',
            minWidth: 120,
            maxWidth: 120,
            onRender: (item: LinhaDeEstimativa) => 
                renderDropdown(item, 'smt_faseid', faseOptions, (lineId, value) => {
                    // Find the fase by lowercase comparison
                    const selectedFase = fases.find(f => (f.smt_faseid || '').toLowerCase() === value.toLowerCase());
                    onChange(lineId, { 
                        smt_faseid: selectedFase?.smt_faseid,
                        smt_fase: selectedFase?.smt_nomefase 
                    });
                })
        },
        {
            key: 'subphase',
            name: 'Subphase',
            fieldName: 'smt_subfase',
            minWidth: 120,
            maxWidth: 120,
            onRender: (item: LinhaDeEstimativa) => 
                renderDropdown(item, 'smt_subfaseid', subfaseOptions, (lineId, value) => {
                    // Find the subfase by lowercase comparison
                    const selectedSubfase = subfases.find(s => (s.smt_subfaseid || '').toLowerCase() === value.toLowerCase());
                    onChange(lineId, { 
                        smt_subfaseid: selectedSubfase?.smt_subfaseid,
                        smt_subfase: selectedSubfase?.smt_nomesubfase 
                    });
                })
        },
        {
            key: 'module',
            name: 'Module',
            fieldName: 'smt_modulo',
            minWidth: 100,
            maxWidth: 150,
            onRender: (item: LinhaDeEstimativa) => renderEditableTextField(item, 'smt_modulo', 'Module')
        },
        {
            key: 'requirement',
            name: 'Requirement',
            fieldName: 'smt_requisitodocliente',
            minWidth: 120,
            maxWidth: 180,
            onRender: (item: LinhaDeEstimativa) => renderEditableTextField(item, 'smt_requisitocliente', 'Requirement')
        },
        {
            key: 'functionality',
            name: 'Functionality',
            fieldName: 'smt_funcionalidade',
            minWidth: 150,
            maxWidth: 200,
            onRender: (item: LinhaDeEstimativa) => renderEditableTextField(item, 'smt_funcionalidade', 'Functionality')
        },
        {
            key: 'devType',
            name: 'Dev Type',
            fieldName: 'smt_tipodedesenvolvimento',
            minWidth: 120,
            maxWidth: 150,
            onRender: (item: LinhaDeEstimativa) => 
                renderDropdown(item, 'smt_tipodedesenvolvimentoid', tipoDesenvolvimentoOptions, (lineId, value) => {
                    // Find the tipo by lowercase comparison to get the original GUID
                    const selectedTipo = tiposDesenvolvimento.find(t => (t.smt_tipodedesenvolvimentoid || '').toLowerCase() === value.toLowerCase());
                    if (selectedTipo?.smt_tipodedesenvolvimentoid) {
                        onDevelopmentTypeChange(lineId, selectedTipo.smt_tipodedesenvolvimentoid);
                    }
                })
        },
        {
            key: 'complexity',
            name: 'Complexity',
            fieldName: 'smt_complexidade',
            minWidth: 100,
            maxWidth: 120,
            onRender: (item: LinhaDeEstimativa) => 
                renderDropdown(item, 'smt_complexidade', complexityOptions, (lineId, value) => 
                    onChange(lineId, { smt_complexidade: value })
                )
        },
        {
            key: 'description',
            name: 'Description',
            fieldName: 'smt_descricao',
            minWidth: 200,
            maxWidth: 300,
            isMultiline: true,
            onRender: (item: LinhaDeEstimativa) => renderEditableTextField(item, 'smt_descricao', 'Description')
        },
        {
            key: 'technicalNotes',
            name: 'Technical Notes',
            fieldName: 'smt_observacoestecnicas',
            minWidth: 150,
            maxWidth: 250,
            isMultiline: true,
            onRender: (item: LinhaDeEstimativa) => renderEditableTextField(item, 'smt_observacoestecnicas', 'Technical Notes')
        },
        {
            key: 'dimensioning',
            name: 'Dimensioning',
            fieldName: 'smt_dimensionamento',
            minWidth: 100,
            maxWidth: 100,
            onRender: (item: LinhaDeEstimativa) => {
                // For Support activities, dimensioning is calculated
                if (item.smt_tipodeatividade === supportLabel) {
                    return (
                        <Text styles={{ root: { fontSize: 12, padding: 8 } }}>
                            {item.smt_dimensionamento?.toFixed(2) || '0.00'}
                        </Text>
                    );
                }
                return renderEditableNumberField(item, 'smt_dimensionamento', 2);
            }
        },
        {
            key: 'percentDev',
            name: '% Dev',
            fieldName: 'smt_dedesenvolvimento',
            minWidth: 80,
            maxWidth: 80,
            onRender: (item: LinhaDeEstimativa) => {
                // Only show for Support activities
                if (item.smt_tipodeatividade === supportLabel) {
                    return renderEditableNumberField(item, 'smt_dedesenvolvimento', 2);
                }
                return <div />;
            }
        },
        {
            key: 'estimation',
            name: 'Estimation',
            fieldName: 'smt_estimativafinal',
            minWidth: 100,
            maxWidth: 100,
            onRender: (item: LinhaDeEstimativa) => (
                <Text styles={{ root: { fontSize: 12, padding: 8, fontWeight: 600 } }}>
                    {item.smt_estimativafinal || 0}
                </Text>
            )
        }
    ];

    return (
        <Stack 
            tokens={{ childrenGap: 12 }} 
            styles={{ 
                root: { 
                    flex: 1, 
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    borderRadius: 8,
                    boxShadow: '0 1.6px 3.6px rgba(0,0,0,0.13), 0 0.3px 0.9px rgba(0,0,0,0.11)',
                    boxSizing: 'border-box'
                } 
            }}
        >
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <Text variant="large" styles={{ root: { fontWeight: 600 } }}>
                    Estimation Lines ({lines.length})
                </Text>
                <IconButton
                    iconProps={{ iconName: 'Add' }}
                    text="Add Line"
                    onClick={onAdd}
                    styles={{ root: { height: 32 } }}
                />
            </Stack>

            <Stack 
                styles={{ 
                    root: { 
                        flex: 1, 
                        overflow: 'auto',
                        position: 'relative'
                    } 
                }}
            >
                <DetailsList
                    items={lines}
                    columns={columns}
                    selectionMode={SelectionMode.none}
                    constrainMode={ConstrainMode.unconstrained}
                    isHeaderVisible={true}
                    compact={true}
                    styles={{
                        root: {
                            overflowX: 'auto',
                            '.ms-DetailsRow': {
                                minHeight: 36
                            }
                        }
                    }}
                />
            </Stack>
        </Stack>
    );
};

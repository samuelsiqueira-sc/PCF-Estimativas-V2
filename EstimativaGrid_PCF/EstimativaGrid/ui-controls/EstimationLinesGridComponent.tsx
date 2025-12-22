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
    onChange,
    onAdd,
    onDelete,
    onDevelopmentTypeChange
}) => {
    const activityTypeOptions: IDropdownOption[] = [
        { key: ActivityType.Development, text: 'Development' },
        { key: ActivityType.Process, text: 'Process' },
        { key: ActivityType.Support, text: 'Support' }
    ];

    const complexityOptions: IDropdownOption[] = [
        { key: Complexity.VeryLow, text: 'Very Low' },
        { key: Complexity.Low, text: 'Low' },
        { key: Complexity.Medium, text: 'Medium' },
        { key: Complexity.High, text: 'High' },
        { key: Complexity.VeryHigh, text: 'Very High' }
    ];

    const faseOptions: IDropdownOption[] = fases.map(fase => ({
        key: fase.smt_faseid || '',
        text: fase.smt_name || ''
    }));

    const subfaseOptions: IDropdownOption[] = subfases.map(subfase => ({
        key: subfase.smt_subfaseid || '',
        text: subfase.smt_name || ''
    }));

    const tipoDesenvolvimentoOptions: IDropdownOption[] = tiposDesenvolvimento.map(tipo => ({
        key: tipo.smt_tipodedesenvolvimentoid || '',
        text: tipo.smt_name || ''
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
        return (
            <Dropdown
                options={options}
                selectedKey={item[fieldName] as string}
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
                const canDelete = item.smt_tipodeatividade === ActivityType.Development;
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
                renderDropdown(item, 'smt_faseid', faseOptions, (lineId, value) => 
                    onChange(lineId, { smt_faseid: value })
                )
        },
        {
            key: 'subphase',
            name: 'Subphase',
            fieldName: 'smt_subfase',
            minWidth: 120,
            maxWidth: 120,
            onRender: (item: LinhaDeEstimativa) => 
                renderDropdown(item, 'smt_subfaseid', subfaseOptions, (lineId, value) => 
                    onChange(lineId, { smt_subfaseid: value })
                )
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
            onRender: (item: LinhaDeEstimativa) => renderEditableTextField(item, 'smt_requisitodocliente', 'Requirement')
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
                renderDropdown(item, 'smt_tipodedesenvolvimentoid', tipoDesenvolvimentoOptions, onDevelopmentTypeChange)
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
                if (item.smt_tipodeatividade === ActivityType.Support) {
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
            fieldName: 'smt_percentualdedesenvolvimento',
            minWidth: 80,
            maxWidth: 80,
            onRender: (item: LinhaDeEstimativa) => {
                // Only show for Support activities
                if (item.smt_tipodeatividade === ActivityType.Support) {
                    return renderEditableNumberField(item, 'smt_percentualdedesenvolvimento', 2);
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
        <Stack tokens={{ childrenGap: 10 }} styles={{ root: { flex: 1, overflow: 'hidden' } }}>
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

            <Stack styles={{ root: { flex: 1, overflow: 'auto' } }}>
                <DetailsList
                    items={lines}
                    columns={columns}
                    selectionMode={SelectionMode.none}
                    constrainMode={ConstrainMode.unconstrained}
                    isHeaderVisible={true}
                    compact={true}
                />
            </Stack>
        </Stack>
    );
};

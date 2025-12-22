/**
 * Estimation Header Component
 * Displays and allows editing of estimation details
 */

import * as React from 'react';
import { 
    Stack, 
    TextField, 
    Dropdown, 
    IDropdownOption, 
    DatePicker, 
    PrimaryButton, 
    DefaultButton,
    Text,
    Separator
} from '@fluentui/react';
import { Estimativa, ModeloDeEstimativa } from '../models';

export interface EstimationHeaderComponentProps {
    estimativa: Estimativa;
    modelosEstimativa: ModeloDeEstimativa[];
    onChange: (changes: Partial<Estimativa>) => void;
    onSave: () => void;
    onImportModel: () => void;
    isDirty: boolean;
}

export const EstimationHeaderComponent: React.FC<EstimationHeaderComponentProps> = ({
    estimativa,
    modelosEstimativa,
    onChange,
    onSave,
    onImportModel,
    isDirty
}) => {
    const modeloOptions: IDropdownOption[] = modelosEstimativa.map(modelo => ({
        key: modelo.smt_modelodeestimativaid || '',
        text: modelo.smt_name || ''
    }));

    const formatDate = (date: Date | string | undefined): string => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString();
    };

    return (
        <Stack tokens={{ childrenGap: 15 }} styles={{ root: { backgroundColor: '#f3f2f1', padding: 15, borderRadius: 4 } }}>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
                    {estimativa.smt_name || 'New Estimation'}
                </Text>
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <DefaultButton text="Import Model" onClick={onImportModel} />
                    <PrimaryButton text="Save" onClick={onSave} disabled={!isDirty} />
                </Stack>
            </Stack>

            <Separator />

            <Stack horizontal tokens={{ childrenGap: 15 }}>
                <Stack styles={{ root: { flex: 1 } }}>
                    <TextField
                        label="Name"
                        value={estimativa.smt_name || ''}
                        onChange={(_, value) => onChange({ smt_name: value })}
                        required
                    />
                </Stack>
                <Stack styles={{ root: { flex: 1 } }}>
                    <TextField
                        label="Opportunity"
                        value={estimativa.smt_oportunidade || ''}
                        onChange={(_, value) => onChange({ smt_oportunidade: value })}
                    />
                </Stack>
            </Stack>

            <Stack horizontal tokens={{ childrenGap: 15 }}>
                <Stack styles={{ root: { flex: 1 } }}>
                    <Dropdown
                        label="Estimation Model"
                        options={modeloOptions}
                        selectedKey={estimativa.smt_modelodeestimativaid}
                        onChange={(_, option) => onChange({ 
                            smt_modelodeestimativaid: option?.key as string,
                            smt_modelodeestimativa: option?.text 
                        })}
                        required
                    />
                </Stack>
                <Stack styles={{ root: { flex: 1 } }}>
                    <DatePicker
                        label="Estimated Start Date"
                        value={estimativa.smt_datadeinicios ? new Date(estimativa.smt_datadeinicios) : undefined}
                        onSelectDate={(date) => onChange({ smt_datadeinicios: date?.toISOString() })}
                        formatDate={formatDate}
                    />
                </Stack>
            </Stack>

            <Separator />

            <Stack horizontal tokens={{ childrenGap: 30 }}>
                <Stack>
                    <Text variant="small" styles={{ root: { color: '#605e5c', fontWeight: 600 } }}>
                        Total Development Hours
                    </Text>
                    <Text variant="xxLarge" styles={{ root: { fontWeight: 600, color: '#0078d4' } }}>
                        {estimativa.smt_horasdedesenvolvimento?.toFixed(2) || '0.00'}
                    </Text>
                </Stack>
                <Stack>
                    <Text variant="small" styles={{ root: { color: '#605e5c', fontWeight: 600 } }}>
                        Total Support Hours
                    </Text>
                    <Text variant="xxLarge" styles={{ root: { fontWeight: 600, color: '#107c10' } }}>
                        {estimativa.smt_horasdesuporte?.toFixed(2) || '0.00'}
                    </Text>
                </Stack>
                <Stack>
                    <Text variant="small" styles={{ root: { color: '#605e5c', fontWeight: 600 } }}>
                        Total Project Hours
                    </Text>
                    <Text variant="xxLarge" styles={{ root: { fontWeight: 600, color: '#8764b8' } }}>
                        {estimativa.smt_horasdoprojeto?.toFixed(2) || '0.00'}
                    </Text>
                </Stack>
            </Stack>
        </Stack>
    );
};

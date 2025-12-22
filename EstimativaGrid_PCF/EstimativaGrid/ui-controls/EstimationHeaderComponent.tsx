/**
 * Estimation Header Component
 * Displays and allows editing of estimation details
 */

import * as React from 'react';
import { 
    Stack, 
    PrimaryButton, 
    DefaultButton,
    Text
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
    return (
        <Stack 
            tokens={{ childrenGap: 20 }} 
            styles={{ 
                root: { 
                    backgroundColor: '#ffffff', 
                    padding: '20px 24px', 
                    borderRadius: 8,
                    boxShadow: '0 1.6px 3.6px rgba(0,0,0,0.13), 0 0.3px 0.9px rgba(0,0,0,0.11)',
                    width: '100%',
                    boxSizing: 'border-box'
                } 
            }}
        >
            {/* Action Buttons */}
            <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 10 }}>
                <DefaultButton text="Import Model" onClick={onImportModel} />
                <PrimaryButton text="Save" onClick={onSave} disabled={!isDirty} />
            </Stack>

            {/* Total Hours Display - Prominent */}
            <Stack 
                horizontal 
                horizontalAlign="space-around" 
                wrap
                tokens={{ childrenGap: 20 }}
                styles={{ root: { width: '100%' } }}
            >
                <Stack 
                    horizontalAlign="center" 
                    styles={{ 
                        root: { 
                            minWidth: 160,
                            maxWidth: 220,
                            padding: '16px 20px',
                            backgroundColor: '#e6f2ff',
                            borderRadius: 6,
                            border: '2px solid #0078d4',
                            flex: 1
                        } 
                    }}
                >
                    <Text 
                        variant="small" 
                        styles={{ 
                            root: { 
                                color: '#323130', 
                                fontWeight: 600,
                                marginBottom: 6,
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                                fontSize: 11,
                                textAlign: 'center'
                            } 
                        }}
                    >
                        Development Hours
                    </Text>
                    <Text 
                        styles={{ 
                            root: { 
                                fontSize: 32, 
                                fontWeight: 700, 
                                color: '#0078d4',
                                lineHeight: 1.1
                            } 
                        }}
                    >
                        {estimativa.smt_totaldesenvolvimento?.toFixed(2) || '0.00'}
                    </Text>
                </Stack>

                <Stack 
                    horizontalAlign="center" 
                    styles={{ 
                        root: { 
                            minWidth: 160,
                            maxWidth: 220,
                            padding: '16px 20px',
                            backgroundColor: '#e6f7e6',
                            borderRadius: 6,
                            border: '2px solid #107c10',
                            flex: 1
                        } 
                    }}
                >
                    <Text 
                        variant="small" 
                        styles={{ 
                            root: { 
                                color: '#323130', 
                                fontWeight: 600,
                                marginBottom: 6,
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                                fontSize: 11,
                                textAlign: 'center'
                            } 
                        }}
                    >
                        Support Hours
                    </Text>
                    <Text 
                        styles={{ 
                            root: { 
                                fontSize: 32, 
                                fontWeight: 700, 
                                color: '#107c10',
                                lineHeight: 1.1
                            } 
                        }}
                    >
                        {estimativa.smt_totalhorasapoio?.toFixed(2) || '0.00'}
                    </Text>
                </Stack>

                <Stack 
                    horizontalAlign="center" 
                    styles={{ 
                        root: { 
                            minWidth: 160,
                            maxWidth: 220,
                            padding: '16px 20px',
                            backgroundColor: '#f4f0fa',
                            borderRadius: 6,
                            border: '2px solid #8764b8',
                            flex: 1
                        } 
                    }}
                >
                    <Text 
                        variant="small" 
                        styles={{ 
                            root: { 
                                color: '#323130', 
                                fontWeight: 600,
                                marginBottom: 6,
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                                fontSize: 11,
                                textAlign: 'center'
                            } 
                        }}
                    >
                        Project Hours
                    </Text>
                    <Text 
                        styles={{ 
                            root: { 
                                fontSize: 32, 
                                fontWeight: 700, 
                                color: '#8764b8',
                                lineHeight: 1.1
                            } 
                        }}
                    >
                        {estimativa.smt_totalhorasprojeto?.toFixed(2) || '0.00'}
                    </Text>
                </Stack>
            </Stack>
        </Stack>
    );
};

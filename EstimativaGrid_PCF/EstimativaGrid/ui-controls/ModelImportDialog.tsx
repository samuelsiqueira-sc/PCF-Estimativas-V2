/**
 * Model Import Dialog Component
 * Allows selection and import of estimation models
 */

import * as React from 'react';
import { 
    Dialog, 
    DialogType, 
    DialogFooter, 
    PrimaryButton, 
    DefaultButton,
    Stack,
    Checkbox,
    Text
} from '@fluentui/react';
import { ModeloDeEstimativa } from '../models';

export interface ModelImportDialogProps {
    modelos: ModeloDeEstimativa[];
    onImport: (modelIds: string[]) => void;
    onClose: () => void;
}

export const ModelImportDialog: React.FC<ModelImportDialogProps> = ({
    modelos,
    onImport,
    onClose
}) => {
    const [selectedModels, setSelectedModels] = React.useState<Set<string>>(new Set());

    const handleToggleModel = (modelId: string, checked: boolean): void => {
        const newSelection = new Set(selectedModels);
        if (checked) {
            newSelection.add(modelId);
        } else {
            newSelection.delete(modelId);
        }
        setSelectedModels(newSelection);
    };

    const handleImport = (): void => {
        onImport(Array.from(selectedModels));
    };

    return (
        <Dialog
            hidden={false}
            onDismiss={onClose}
            dialogContentProps={{
                type: DialogType.normal,
                title: 'Import Estimation Model',
                subText: 'Select one or more estimation models to import. Model lines will be copied into this estimation.'
            }}
            modalProps={{
                isBlocking: false,
                styles: { main: { maxWidth: 500 } }
            }}
        >
            <Stack tokens={{ childrenGap: 10 }} styles={{ root: { paddingTop: 10 } }}>
                {modelos.length === 0 ? (
                    <Text>No estimation models available.</Text>
                ) : (
                    modelos.map(modelo => (
                        <Checkbox
                            key={modelo.smt_modelodeestimativaid}
                            label={modelo.smt_nomemodelo}
                            checked={selectedModels.has(modelo.smt_modelodeestimativaid || '')}
                            onChange={(_, checked) => handleToggleModel(modelo.smt_modelodeestimativaid || '', checked || false)}
                        />
                    ))
                )}
            </Stack>

            <DialogFooter>
                <PrimaryButton 
                    onClick={handleImport} 
                    text="Import" 
                    disabled={selectedModels.size === 0}
                />
                <DefaultButton onClick={onClose} text="Cancel" />
            </DialogFooter>
        </Dialog>
    );
};

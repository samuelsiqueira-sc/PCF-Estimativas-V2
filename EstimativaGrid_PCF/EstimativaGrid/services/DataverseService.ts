/**
 * Service for interacting with Dataverse using WebAPI
 */

import {
    Estimativa,
    LinhaDeEstimativa,
    ModeloDeEstimativa,
    LinhaDeModeloDeEstimativa,
    TipoDeDesenvolvimento,
    Fase,
    Subfase
} from '../models';

export class DataverseService {
    private webAPI: ComponentFramework.WebApi;
    private activityTypeMapping: Map<string, number> = new Map();
    private activityTypeReverseMapping: Map<number, string> = new Map();
    private complexityMapping: Map<string, number> = new Map();
    private complexityReverseMapping: Map<number, string> = new Map();
    private optionSetsInitialized: boolean = false;

    constructor(webAPI: ComponentFramework.WebApi) {
        this.webAPI = webAPI;
    }

    /**
     * Initialize option set mappings by querying a sample record from Dataverse
     * This retrieves the actual option set values and labels dynamically
     */
    private async initializeOptionSets(): Promise<void> {
        if (this.optionSetsInitialized) return;

        try {
            // Query existing records to get option set formatted values
            const result = await this.webAPI.retrieveMultipleRecords(
                'smt_linhadeestimativa',
                '?$select=smt_tipodeatividade,smt_complexidade&$top=100'
            );

            // Build mappings from the retrieved data
            for (const entity of result.entities) {
                // Activity Type mappings
                if (entity.smt_tipodeatividade !== undefined && entity.smt_tipodeatividade !== null) {
                    const value = entity.smt_tipodeatividade;
                    const formattedValue = entity['smt_tipodeatividade@OData.Community.Display.V1.FormattedValue'];
                    if (formattedValue && !this.activityTypeMapping.has(formattedValue)) {
                        this.activityTypeMapping.set(formattedValue, value);
                        this.activityTypeReverseMapping.set(value, formattedValue);
                    }
                }

                // Complexity mappings
                if (entity.smt_complexidade !== undefined && entity.smt_complexidade !== null) {
                    const value = entity.smt_complexidade;
                    const formattedValue = entity['smt_complexidade@OData.Community.Display.V1.FormattedValue'];
                    if (formattedValue && !this.complexityMapping.has(formattedValue)) {
                        this.complexityMapping.set(formattedValue, value);
                        this.complexityReverseMapping.set(value, formattedValue);
                    }
                }
            }

            // If no records exist, set default mappings based on the error message values
            // These are fallback values that should work with the standard Dataverse schema
            if (this.activityTypeMapping.size === 0) {
                this.activityTypeMapping.set('Development', 922340000);
                this.activityTypeMapping.set('Process', 922340001);
                this.activityTypeMapping.set('Support', 922340002);
                this.activityTypeReverseMapping.set(922340000, 'Development');
                this.activityTypeReverseMapping.set(922340001, 'Process');
                this.activityTypeReverseMapping.set(922340002, 'Support');
            }

            if (this.complexityMapping.size === 0) {
                // Set default complexity values - these may need adjustment
                this.complexityMapping.set('Very Low', 922340000);
                this.complexityMapping.set('Low', 922340001);
                this.complexityMapping.set('Medium', 922340002);
                this.complexityMapping.set('High', 922340003);
                this.complexityMapping.set('Very High', 922340004);
                this.complexityReverseMapping.set(922340000, 'Very Low');
                this.complexityReverseMapping.set(922340001, 'Low');
                this.complexityReverseMapping.set(922340002, 'Medium');
                this.complexityReverseMapping.set(922340003, 'High');
                this.complexityReverseMapping.set(922340004, 'Very High');
            }

            this.optionSetsInitialized = true;
        } catch (error) {
            console.error('Error initializing option sets:', error);
            // Set fallback values if query fails
            this.activityTypeMapping.set('Development', 922340000);
            this.activityTypeMapping.set('Process', 922340001);
            this.activityTypeMapping.set('Support', 922340002);
            this.activityTypeReverseMapping.set(922340000, 'Development');
            this.activityTypeReverseMapping.set(922340001, 'Process');
            this.activityTypeReverseMapping.set(922340002, 'Support');
            
            this.complexityMapping.set('Very Low', 922340000);
            this.complexityMapping.set('Low', 922340001);
            this.complexityMapping.set('Medium', 922340002);
            this.complexityMapping.set('High', 922340003);
            this.complexityMapping.set('Very High', 922340004);
            this.complexityReverseMapping.set(922340000, 'Very Low');
            this.complexityReverseMapping.set(922340001, 'Low');
            this.complexityReverseMapping.set(922340002, 'Medium');
            this.complexityReverseMapping.set(922340003, 'High');
            this.complexityReverseMapping.set(922340004, 'Very High');
            
            this.optionSetsInitialized = true;
        }
    }

    /**
     * Convert ActivityType string to Dataverse option set value
     */
    private async activityTypeToOptionSet(activityType: string | undefined): Promise<number | undefined> {
        if (!activityType) return undefined;
        await this.initializeOptionSets();
        return this.activityTypeMapping.get(activityType);
    }

    /**
     * Convert Dataverse option set value to ActivityType string
     */
    private async activityTypeFromOptionSet(optionSetValue: number | undefined): Promise<string | undefined> {
        if (optionSetValue === undefined) return undefined;
        await this.initializeOptionSets();
        return this.activityTypeReverseMapping.get(optionSetValue);
    }

    /**
     * Convert Complexity string to Dataverse option set value
     */
    private async complexityToOptionSet(complexity: string | undefined): Promise<number | undefined> {
        if (!complexity) return undefined;
        await this.initializeOptionSets();
        return this.complexityMapping.get(complexity);
    }

    /**
     * Convert Dataverse option set value to Complexity string
     */
    private async complexityFromOptionSet(optionSetValue: number | undefined): Promise<string | undefined> {
        if (optionSetValue === undefined) return undefined;
        await this.initializeOptionSets();
        return this.complexityReverseMapping.get(optionSetValue);
    }

    /**
     * Get all activity type labels from Dataverse
     * Returns an array of [label, value] pairs sorted by value
     */
    public async getActivityTypeLabels(): Promise<Array<{ label: string; value: number }>> {
        await this.initializeOptionSets();
        const labels: Array<{ label: string; value: number }> = [];
        this.activityTypeMapping.forEach((value, label) => {
            labels.push({ label, value });
        });
        // Sort by value for consistent ordering
        return labels.sort((a, b) => a.value - b.value);
    }

    /**
     * Get all complexity labels from Dataverse
     * Returns an array of [label, value] pairs sorted by value
     */
    public async getComplexityLabels(): Promise<Array<{ label: string; value: number }>> {
        await this.initializeOptionSets();
        const labels: Array<{ label: string; value: number }> = [];
        this.complexityMapping.forEach((value, label) => {
            labels.push({ label, value });
        });
        // Sort by value for consistent ordering
        return labels.sort((a, b) => a.value - b.value);
    }

    /**
     * Get the label for Development activity type (value 922340000)
     */
    public async getDevelopmentLabel(): Promise<string> {
        await this.initializeOptionSets();
        return this.activityTypeReverseMapping.get(922340000) || 'Development';
    }

    /**
     * Get the label for Process activity type (value 922340001)
     */
    public async getProcessLabel(): Promise<string> {
        await this.initializeOptionSets();
        return this.activityTypeReverseMapping.get(922340001) || 'Process';
    }

    /**
     * Get the label for Support activity type (value 922340002)
     */
    public async getSupportLabel(): Promise<string> {
        await this.initializeOptionSets();
        return this.activityTypeReverseMapping.get(922340002) || 'Support';
    }

    // ============= Estimativa (Estimation) Operations =============

    /**
     * Create a new estimation
     * @param estimativa - Estimation data to create
     * @returns A LookupValue containing the created estimation's ID and name
     * @throws Error if the creation fails or required fields are missing
     */
    async createEstimativa(estimativa: Estimativa): Promise<ComponentFramework.LookupValue> {
        const record: ComponentFramework.WebApi.Entity = {};
        
        if (estimativa.smt_nome) record['smt_nome'] = estimativa.smt_nome;
        if (estimativa.smt_oportunidade) record['smt_oportunidade'] = estimativa.smt_oportunidade;
        if (estimativa.smt_totaldesenvolvimento !== undefined) 
            record['smt_totaldesenvolvimento'] = estimativa.smt_totaldesenvolvimento;
        if (estimativa.smt_totalhorasapoio !== undefined) 
            record['smt_totalhorasapoio'] = estimativa.smt_totalhorasapoio;
        if (estimativa.smt_totalhorasprojeto !== undefined) 
            record['smt_totalhorasprojeto'] = estimativa.smt_totalhorasprojeto;
        if (estimativa.smt_modelodeestimativaid) 
            record['smt_modelodeestimativa@odata.bind'] = `/smt_modelodeestimativas(${estimativa.smt_modelodeestimativaid})`;
        if (estimativa.smt_datainicioestimada) 
            record['smt_datainicioestimada'] = estimativa.smt_datainicioestimada;

        const result = await this.webAPI.createRecord('smt_estimativa', record);
        return {
            id: result.id,
            name: estimativa.smt_nome || '',
            entityType: 'smt_estimativa'
        };
    }

    /**
     * Update an existing estimation
     */
    async updateEstimativa(estimativaId: string, estimativa: Partial<Estimativa>): Promise<void> {
        const record: ComponentFramework.WebApi.Entity = {};
        
        if (estimativa.smt_nome !== undefined) record['smt_nome'] = estimativa.smt_nome;
        if (estimativa.smt_oportunidade !== undefined) record['smt_oportunidade'] = estimativa.smt_oportunidade;
        if (estimativa.smt_totaldesenvolvimento !== undefined) 
            record['smt_totaldesenvolvimento'] = estimativa.smt_totaldesenvolvimento;
        if (estimativa.smt_totalhorasapoio !== undefined) 
            record['smt_totalhorasapoio'] = estimativa.smt_totalhorasapoio;
        if (estimativa.smt_totalhorasprojeto !== undefined) 
            record['smt_totalhorasprojeto'] = estimativa.smt_totalhorasprojeto;
        if (estimativa.smt_modelodeestimativaid) 
            record['smt_modelodeestimativa@odata.bind'] = `/smt_modelodeestimativas(${estimativa.smt_modelodeestimativaid})`;
        if (estimativa.smt_datainicioestimada !== undefined) 
            record['smt_datainicioestimada'] = estimativa.smt_datainicioestimada;
        await this.webAPI.updateRecord('smt_estimativa', estimativaId, record);
    }

    /**
     * Retrieve an estimation by ID
     */
    async retrieveEstimativa(estimativaId: string): Promise<Estimativa> {
        const result = await this.webAPI.retrieveRecord(
            'smt_estimativa',
            estimativaId,
            '?$select=smt_estimativaid,smt_nome,smt_oportunidade,smt_totaldesenvolvimento,smt_totalhorasapoio,smt_totalhorasprojeto,smt_datainicioestimada,versionnumber'
        );

        return {
            smt_estimativaid: result.smt_estimativaid,
            smt_nome: result.smt_nome,
            smt_oportunidade: result.smt_oportunidade,
            smt_totaldesenvolvimento: result.smt_totaldesenvolvimento,
            smt_totalhorasapoio: result.smt_totalhorasapoio,
            smt_totalhorasprojeto: result.smt_totalhorasprojeto,
            smt_datainicioestimada: result.smt_datainicioestimada,
            versionnumber: result.versionnumber
        };
    }

    // ============= LinhaDeEstimativa (Estimation Line) Operations =============

    /**
     * Create a new estimation line
     */
    async createLinhaDeEstimativa(linha: LinhaDeEstimativa): Promise<ComponentFramework.LookupValue> {
        const record: ComponentFramework.WebApi.Entity = {};
        
        // Only include lookup IDs, not navigation property names
        if (linha.smt_estimativaid) 
            record['smt_estimativa@odata.bind'] = `/smt_estimativas(${linha.smt_estimativaid})`;
        if (linha.smt_faseid) 
            record['smt_fase@odata.bind'] = `/smt_fases(${linha.smt_faseid})`;
        if (linha.smt_subfaseid) 
            record['smt_subfase@odata.bind'] = `/smt_subfases(${linha.smt_subfaseid})`;
        if (linha.smt_tipodedesenvolvimentoid) 
            record['smt_tipodedesenvolvimento@odata.bind'] = `/smt_tipodedesenvolvimentos(${linha.smt_tipodedesenvolvimentoid})`;
        
        // Add regular properties (never add smt_fase, smt_subfase, smt_tipodedesenvolvimento, smt_estimativa)
        if (linha.smt_modulo) record['smt_modulo'] = linha.smt_modulo;
        if (linha.smt_requisitocliente) record['smt_requisitocliente'] = linha.smt_requisitocliente;
        if (linha.smt_funcionalidade) record['smt_funcionalidade'] = linha.smt_funcionalidade;
        if (linha.smt_descricao) record['smt_descricao'] = linha.smt_descricao;
        if (linha.smt_observacoestecnicas) record['smt_observacoestecnicas'] = linha.smt_observacoestecnicas;
        if (linha.smt_dimensionamento !== undefined) record['smt_dimensionamento'] = linha.smt_dimensionamento;
        if (linha.smt_estimativafinal !== undefined) record['smt_estimativafinal'] = linha.smt_estimativafinal;
        
        // Convert ActivityType string to option set integer
        const activityTypeValue = await this.activityTypeToOptionSet(linha.smt_tipodeatividade as string);
        if (activityTypeValue !== undefined) record['smt_tipodeatividade'] = activityTypeValue;
        
        // Convert Complexity string to option set integer
        const complexityValue = await this.complexityToOptionSet(linha.smt_complexidade as string);
        if (complexityValue !== undefined) record['smt_complexidade'] = complexityValue;
        
        if (linha.smt_dedesenvolvimento !== undefined) 
            record['smt_dedesenvolvimento'] = linha.smt_dedesenvolvimento;
        //if (linha.smt_ordem !== undefined) record['smt_ordem'] = linha.smt_ordem;

        const result = await this.webAPI.createRecord('smt_linhadeestimativa', record);
        return {
            id: result.id,
            name: linha.smt_funcionalidade || '',
            entityType: 'smt_linhadeestimativa'
        };
    }

    /**
     * Update an existing estimation line
     */
    async updateLinhaDeEstimativa(linhaId: string, linha: Partial<LinhaDeEstimativa>): Promise<void> {
        const record: ComponentFramework.WebApi.Entity = {};
        
        // Handle lookup fields - only add if they have valid values
        if (linha.smt_faseid !== undefined && linha.smt_faseid) {
            record['smt_fase@odata.bind'] = `/smt_fases(${linha.smt_faseid})`;
        }
        if (linha.smt_subfaseid !== undefined && linha.smt_subfaseid) {
            record['smt_subfase@odata.bind'] = `/smt_subfases(${linha.smt_subfaseid})`;
        }
        if (linha.smt_tipodedesenvolvimentoid !== undefined && linha.smt_tipodedesenvolvimentoid) {
            record['smt_tipodedesenvolvimento@odata.bind'] = `/smt_tipodedesenvolvimentos(${linha.smt_tipodedesenvolvimentoid})`;
        }
        
        // Handle regular properties
        if (linha.smt_modulo !== undefined) record['smt_modulo'] = linha.smt_modulo;
        if (linha.smt_requisitocliente !== undefined) record['smt_requisitocliente'] = linha.smt_requisitocliente;
        if (linha.smt_funcionalidade !== undefined) record['smt_funcionalidade'] = linha.smt_funcionalidade;
        if (linha.smt_descricao !== undefined) record['smt_descricao'] = linha.smt_descricao;
        if (linha.smt_observacoestecnicas !== undefined) record['smt_observacoestecnicas'] = linha.smt_observacoestecnicas;
        if (linha.smt_dimensionamento !== undefined) record['smt_dimensionamento'] = linha.smt_dimensionamento;
        if (linha.smt_estimativafinal !== undefined) record['smt_estimativafinal'] = linha.smt_estimativafinal;
        
        // Convert ActivityType string to option set integer
        if (linha.smt_tipodeatividade !== undefined) {
            const activityTypeValue = await this.activityTypeToOptionSet(linha.smt_tipodeatividade as string);
            if (activityTypeValue !== undefined) record['smt_tipodeatividade'] = activityTypeValue;
        }
        
        // Convert Complexity string to option set integer
        if (linha.smt_complexidade !== undefined) {
            const complexityValue = await this.complexityToOptionSet(linha.smt_complexidade as string);
            if (complexityValue !== undefined) record['smt_complexidade'] = complexityValue;
        }
        
        if (linha.smt_dedesenvolvimento !== undefined) 
            record['smt_dedesenvolvimento'] = linha.smt_dedesenvolvimento;
        //if (linha.smt_ordem !== undefined) record['smt_ordem'] = linha.smt_ordem;

        await this.webAPI.updateRecord('smt_linhadeestimativa', linhaId, record);
    }

    /**
     * Delete an estimation line
     */
    async deleteLinhaDeEstimativa(linhaId: string): Promise<void> {
        await this.webAPI.deleteRecord('smt_linhadeestimativa', linhaId);
    }

    /**
     * Retrieve estimation lines for a specific estimation
     * @param estimativaId - GUID of the estimation (validated to be a valid GUID format)
     * @returns Array of estimation lines
     */
    async retrieveLinhasDeEstimativa(estimativaId: string): Promise<LinhaDeEstimativa[]> {
        // Validate GUID format
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!guidRegex.test(estimativaId)) {
            throw new Error('Invalid estimation ID format');
        }
        
        const fetchXml = `
            <fetch>
                <entity name="smt_linhadeestimativa">
                    <attribute name="smt_linhadeestimativaid" />
                    <attribute name="smt_modulo" />
                    <attribute name="smt_requisitocliente" />
                    <attribute name="smt_funcionalidade" />
                    <attribute name="smt_descricao" />
                    <attribute name="smt_observacoestecnicas" />
                    <attribute name="smt_dimensionamento" />
                    <attribute name="smt_estimativafinal" />
                    <attribute name="smt_tipodeatividade" />
                    <attribute name="smt_complexidade" />
                    <attribute name="smt_dedesenvolvimento" />
                    <attribute name="versionnumber" />
                    <filter>
                        <condition attribute="smt_estimativa" operator="eq" value="${estimativaId}" />
                    </filter>
                    <link-entity name="smt_fase" from="smt_faseid" to="smt_fase" alias="fase" link-type="outer">
                        <attribute name="smt_faseid" />
                        <attribute name="smt_nomefase" />
                    </link-entity>
                    <link-entity name="smt_subfase" from="smt_subfaseid" to="smt_subfase" alias="subfase" link-type="outer">
                        <attribute name="smt_subfaseid" />
                        <attribute name="smt_nomesubfase" />
                    </link-entity>
                    <link-entity name="smt_tipodedesenvolvimento" from="smt_tipodedesenvolvimentoid" to="smt_tipodedesenvolvimento" alias="tipo" link-type="outer">
                        <attribute name="smt_tipodedesenvolvimentoid" />
                        <attribute name="smt_nometipo" />
                    </link-entity>
                </entity>
            </fetch>
        `;

        const result = await this.webAPI.retrieveMultipleRecords('smt_linhadeestimativa', `?fetchXml=${encodeURIComponent(fetchXml)}`);
        
        const lines = [];
        for (const entity of result.entities) {
            lines.push({
                smt_linhadeestimativaid: entity.smt_linhadeestimativaid,
                smt_estimativaid: estimativaId,
                smt_faseid: entity['_smt_fase_value'],
                smt_fase: entity['fase.smt_nomefase'],
                smt_subfaseid: entity['_smt_subfase_value'],
                smt_subfase: entity['subfase.smt_nomesubfase'],
                smt_tipodedesenvolvimentoid: entity['_smt_tipodedesenvolvimento_value'],
                smt_tipodedesenvolvimento: entity['tipo.smt_nometipo'],
                smt_modulo: entity.smt_modulo,
                smt_requisitocliente: entity.smt_requisitocliente,
                smt_funcionalidade: entity.smt_funcionalidade,
                smt_descricao: entity.smt_descricao,
                smt_observacoestecnicas: entity.smt_observacoestecnicas,
                smt_dimensionamento: entity.smt_dimensionamento,
                smt_estimativafinal: entity.smt_estimativafinal,
                // Convert option set integer values back to string enums
                smt_tipodeatividade: await this.activityTypeFromOptionSet(entity.smt_tipodeatividade),
                smt_complexidade: await this.complexityFromOptionSet(entity.smt_complexidade),
                smt_dedesenvolvimento: entity.smt_dedesenvolvimento,
                versionnumber: entity.versionnumber
            });
        }
        
        return lines;
    }

    // ============= Lookup Tables Operations =============

    /**
     * Retrieve all phases
     */
    async retrieveFases(): Promise<Fase[]> {
        const result = await this.webAPI.retrieveMultipleRecords(
            'smt_fase',
            '?$select=smt_faseid,smt_nomefase,smt_exibirnocronograma,smt_cor&$orderby=smt_ordem asc'
        );
        
        return result.entities.map(entity => ({
            smt_faseid: entity.smt_faseid,
            smt_nomefase: entity.smt_nomefase,
            smt_exibirnocronograma: entity.smt_exibirnocronograma,
            smt_cor: entity.smt_cor
        }));
    }

    /**
     * Retrieve all subphases
     */
    async retrieveSubfases(): Promise<Subfase[]> {
        const result = await this.webAPI.retrieveMultipleRecords(
            'smt_subfase',
            '?$select=smt_subfaseid,smt_nomesubfase,smt_ordem,smt_ordemproposta,smt_cor&$expand=smt_Fase($select=smt_faseid,smt_nomefase)&$orderby=smt_ordem asc'
        );
        
        return result.entities.map(entity => ({
            smt_subfaseid: entity.smt_subfaseid,
            smt_nomesubfase: entity.smt_nomesubfase,
            smt_faseid: entity._smt_fase_value,
            smt_fase: entity.smt_fase?.smt_nomefase,
            smt_ordem: entity.smt_ordem,
            smt_ordemproposta: entity.smt_ordemproposta,
            smt_cor: entity.smt_cor
        }));
    }

    /**
     * Retrieve all development types
     */
    async retrieveTiposDeDesenvolvimento(): Promise<TipoDeDesenvolvimento[]> {
        const result = await this.webAPI.retrieveMultipleRecords(
            'smt_tipodedesenvolvimento',
            '?$select=smt_tipodedesenvolvimentoid,smt_nometipo,smt_descricaopadrao'
        );
        
        return result.entities.map(entity => ({
            smt_tipodedesenvolvimentoid: entity.smt_tipodedesenvolvimentoid,
            smt_nometipo: entity.smt_nometipo,
            smt_descricaopadrao: entity.smt_descricaopadrao
        }));
    }

    /**
     * Retrieve a single development type by ID
     */
    async retrieveTipoDeDesenvolvimento(tipoId: string): Promise<TipoDeDesenvolvimento> {
        const result = await this.webAPI.retrieveRecord(
            'smt_tipodedesenvolvimento',
            tipoId,
            '?$select=smt_tipodedesenvolvimentoid,smt_nometipo,smt_descricaopadrao'
        );
        
        return {
            smt_tipodedesenvolvimentoid: result.smt_tipodedesenvolvimentoid,
            smt_nometipo: result.smt_nometipo,
            smt_descricaopadrao: result.smt_descricaopadrao
        };
    }

    // ============= Estimation Model Operations =============

    /**
     * Retrieve all estimation models
     */
    async retrieveModelosDeEstimativa(): Promise<ModeloDeEstimativa[]> {
        const result = await this.webAPI.retrieveMultipleRecords(
            'smt_modelodeestimativa',
            '?$select=smt_modelodeestimativaid,smt_nomemodelo'
        );
        
        return result.entities.map(entity => ({
            smt_modelodeestimativaid: entity.smt_modelodeestimativaid,
            smt_nomemodelo: entity.smt_nomemodelo
        }));
    }

    /**
     * Retrieve model lines for a specific estimation model
     */
    async retrieveLinhasDeModelo(modeloId: string): Promise<LinhaDeModeloDeEstimativa[]> {
        const fetchXml = `
            <fetch>
                <entity name="smt_linhademodelodeestimativa">
                    <attribute name="smt_linhademodelodeestimativaid" />
                    <attribute name="smt_modulo" />
                    <attribute name="smt_requisitodocliente" />
                    <attribute name="smt_funcionalidade" />
                    <attribute name="smt_descricao" />
                    <attribute name="smt_observacoestecnicas" />
                    <attribute name="smt_dimensionamento" />
                    <attribute name="smt_tipodeatividade" />
                    <attribute name="smt_complexidade" />
                    <attribute name="smt_dedesenvolvimento" />
                    <attribute name="smt_ordem" />
                    <filter>
                        <condition attribute="smt_modelodeestimativa" operator="eq" value="${modeloId}" />
                    </filter>
                    <order attribute="smt_ordem" descending="false" />
                    <link-entity name="smt_fase" from="smt_faseid" to="smt_fase" alias="fase" link-type="outer">
                        <attribute name="smt_faseid" />
                    </link-entity>
                    <link-entity name="smt_subfase" from="smt_subfaseid" to="smt_subfase" alias="subfase" link-type="outer">
                        <attribute name="smt_subfaseid" />
                    </link-entity>
                    <link-entity name="smt_tipodedesenvolvimento" from="smt_tipodedesenvolvimentoid" to="smt_tipodedesenvolvimento" alias="tipo" link-type="outer">
                        <attribute name="smt_tipodedesenvolvimentoid" />
                    </link-entity>
                </entity>
            </fetch>
        `;

        const result = await this.webAPI.retrieveMultipleRecords(
            'smt_linhademodelodeestimativa',
            `?fetchXml=${encodeURIComponent(fetchXml)}`
        );
        
        const modelLines = [];
        for (const entity of result.entities) {
            modelLines.push({
                smt_linhademodelodeestimativaid: entity.smt_linhademodelodeestimativaid,
                smt_modelodeestimativaid: modeloId,
                smt_faseid: entity['_smt_fase_value'] || entity['fase.smt_faseid'],
                smt_subfaseid: entity['_smt_subfase_value'] || entity['subfase.smt_subfaseid'],
                smt_tipodedesenvolvimentoid: entity['_smt_tipodedesenvolvimento_value'] || entity['tipo.smt_tipodedesenvolvimentoid'],
                smt_modulo: entity.smt_modulo,
                smt_requisitodocliente: entity.smt_requisitodocliente,
                smt_funcionalidade: entity.smt_funcionalidade,
                smt_descricao: entity.smt_descricao,
                smt_observacoestecnicas: entity.smt_observacoestecnicas,
                smt_dimensionamento: entity.smt_dimensionamento,
                // Convert option set integer values back to string enums
                smt_tipodeatividade: await this.activityTypeFromOptionSet(entity.smt_tipodeatividade),
                smt_complexidade: await this.complexityFromOptionSet(entity.smt_complexidade),
                smt_dodesenvolvimento: entity.smt_dedesenvolvimento,
                smt_ordem: entity.smt_ordem
            });
        }
        
        return modelLines;
    }

    /**
     * Import estimation model lines into an estimation
     * Creates new estimation lines based on model lines
     */
    async importModeloDeEstimativa(
        estimativaId: string,
        modeloId: string,
        startingOrder: number = 0
    ): Promise<LinhaDeEstimativa[]> {
        const modelLines = await this.retrieveLinhasDeModelo(modeloId);
        const createdLines: LinhaDeEstimativa[] = [];

        for (let i = 0; i < modelLines.length; i++) {
            const modelLine = modelLines[i];
            const newLine: LinhaDeEstimativa = {
                smt_estimativaid: estimativaId,
                smt_faseid: modelLine.smt_faseid,
                smt_subfaseid: modelLine.smt_subfaseid,
                smt_tipodedesenvolvimentoid: modelLine.smt_tipodedesenvolvimentoid,
                smt_modulo: modelLine.smt_modulo,
                smt_requisitocliente: modelLine.smt_requisitodocliente,
                smt_funcionalidade: modelLine.smt_funcionalidade,
                smt_descricao: modelLine.smt_descricao,
                smt_observacoestecnicas: modelLine.smt_observacoestecnicas,
                smt_dimensionamento: modelLine.smt_dimensionamento,
                smt_tipodeatividade: modelLine.smt_tipodeatividade,
                smt_complexidade: modelLine.smt_complexidade,
                smt_dedesenvolvimento: modelLine.smt_dodesenvolvimento,
                // smt_ordem: startingOrder + i,
                smt_estimativafinal: 0
            };

            const result = await this.createLinhaDeEstimativa(newLine);
            createdLines.push({
                ...newLine,
                smt_linhadeestimativaid: result.id
            });
        }

        return createdLines;
    }
}

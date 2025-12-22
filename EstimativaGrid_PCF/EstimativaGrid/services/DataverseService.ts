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

    constructor(webAPI: ComponentFramework.WebApi) {
        this.webAPI = webAPI;
    }

    // ============= Estimativa (Estimation) Operations =============

    /**
     * Create a new estimation
     */
    async createEstimativa(estimativa: Estimativa): Promise<ComponentFramework.LookupValue> {
        const record: ComponentFramework.WebApi.Entity = {};
        
        if (estimativa.smt_name) record['smt_name'] = estimativa.smt_name;
        if (estimativa.smt_oportunidade) record['smt_oportunidade'] = estimativa.smt_oportunidade;
        if (estimativa.smt_horasdedesenvolvimento !== undefined) 
            record['smt_horasdedesenvolvimento'] = estimativa.smt_horasdedesenvolvimento;
        if (estimativa.smt_horasdesuporte !== undefined) 
            record['smt_horasdesuporte'] = estimativa.smt_horasdesuporte;
        if (estimativa.smt_horasdoprojeto !== undefined) 
            record['smt_horasdoprojeto'] = estimativa.smt_horasdoprojeto;
        if (estimativa.smt_modelodeestimativaid) 
            record['smt_modelodeestimativa@odata.bind'] = `/smt_modelodeestimativas(${estimativa.smt_modelodeestimativaid})`;
        if (estimativa.smt_datadeinicios) 
            record['smt_datadeinicios'] = estimativa.smt_datadeinicios;

        const result = await this.webAPI.createRecord('smt_estimativa', record);
        return {
            id: result.id,
            name: estimativa.smt_name || '',
            entityType: 'smt_estimativa'
        };
    }

    /**
     * Update an existing estimation
     */
    async updateEstimativa(estimativaId: string, estimativa: Partial<Estimativa>): Promise<void> {
        const record: ComponentFramework.WebApi.Entity = {};
        
        if (estimativa.smt_name !== undefined) record['smt_name'] = estimativa.smt_name;
        if (estimativa.smt_oportunidade !== undefined) record['smt_oportunidade'] = estimativa.smt_oportunidade;
        if (estimativa.smt_horasdedesenvolvimento !== undefined) 
            record['smt_horasdedesenvolvimento'] = estimativa.smt_horasdedesenvolvimento;
        if (estimativa.smt_horasdesuporte !== undefined) 
            record['smt_horasdesuporte'] = estimativa.smt_horasdesuporte;
        if (estimativa.smt_horasdoprojeto !== undefined) 
            record['smt_horasdoprojeto'] = estimativa.smt_horasdoprojeto;
        if (estimativa.smt_modelodeestimativaid) 
            record['smt_modelodeestimativa@odata.bind'] = `/smt_modelodeestimativas(${estimativa.smt_modelodeestimativaid})`;
        if (estimativa.smt_datadeinicios !== undefined) 
            record['smt_datadeinicios'] = estimativa.smt_datadeinicios;

        await this.webAPI.updateRecord('smt_estimativa', estimativaId, record);
    }

    /**
     * Retrieve an estimation by ID
     */
    async retrieveEstimativa(estimativaId: string): Promise<Estimativa> {
        const result = await this.webAPI.retrieveRecord(
            'smt_estimativa',
            estimativaId,
            '?$select=smt_estimativaid,smt_name,smt_oportunidade,smt_horasdedesenvolvimento,smt_horasdesuporte,smt_horasdoprojeto,smt_datadeinicios,smt_numeroid&$expand=smt_modelodeestimativa($select=smt_modelodeestimativaid,smt_name)'
        );

        return {
            smt_estimativaid: result.smt_estimativaid,
            smt_name: result.smt_name,
            smt_oportunidade: result.smt_oportunidade,
            smt_horasdedesenvolvimento: result.smt_horasdedesenvolvimento,
            smt_horasdesuporte: result.smt_horasdesuporte,
            smt_horasdoprojeto: result.smt_horasdoprojeto,
            smt_modelodeestimativaid: result._smt_modelodeestimativa_value,
            smt_modelodeestimativa: result.smt_modelodeestimativa?.smt_name,
            smt_datadeinicios: result.smt_datadeinicios,
            smt_numeroid: result.smt_numeroid
        };
    }

    // ============= LinhaDeEstimativa (Estimation Line) Operations =============

    /**
     * Create a new estimation line
     */
    async createLinhaDeEstimativa(linha: LinhaDeEstimativa): Promise<ComponentFramework.LookupValue> {
        const record: ComponentFramework.WebApi.Entity = {};
        
        if (linha.smt_estimativaid) 
            record['smt_estimativa@odata.bind'] = `/smt_estimativas(${linha.smt_estimativaid})`;
        if (linha.smt_faseid) 
            record['smt_fase@odata.bind'] = `/smt_fases(${linha.smt_faseid})`;
        if (linha.smt_subfaseid) 
            record['smt_subfase@odata.bind'] = `/smt_subfases(${linha.smt_subfaseid})`;
        if (linha.smt_tipodedesenvolvimentoid) 
            record['smt_tipodedesenvolvimento@odata.bind'] = `/smt_tipodedesenvolvimentos(${linha.smt_tipodedesenvolvimentoid})`;
        
        if (linha.smt_modulo) record['smt_modulo'] = linha.smt_modulo;
        if (linha.smt_requisitodocliente) record['smt_requisitodocliente'] = linha.smt_requisitodocliente;
        if (linha.smt_funcionalidade) record['smt_funcionalidade'] = linha.smt_funcionalidade;
        if (linha.smt_descricao) record['smt_descricao'] = linha.smt_descricao;
        if (linha.smt_observacoestecnicas) record['smt_observacoestecnicas'] = linha.smt_observacoestecnicas;
        if (linha.smt_dimensionamento !== undefined) record['smt_dimensionamento'] = linha.smt_dimensionamento;
        if (linha.smt_estimativafinal !== undefined) record['smt_estimativafinal'] = linha.smt_estimativafinal;
        if (linha.smt_tipodeatividade) record['smt_tipodeatividade'] = linha.smt_tipodeatividade;
        if (linha.smt_complexidade) record['smt_complexidade'] = linha.smt_complexidade;
        if (linha.smt_percentualdedesenvolvimento !== undefined) 
            record['smt_percentualdedesenvolvimento'] = linha.smt_percentualdedesenvolvimento;
        if (linha.smt_ordem !== undefined) record['smt_ordem'] = linha.smt_ordem;

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
        
        if (linha.smt_faseid !== undefined) {
            if (linha.smt_faseid) {
                record['smt_fase@odata.bind'] = `/smt_fases(${linha.smt_faseid})`;
            } else {
                record['smt_fase@odata.bind'] = null;
            }
        }
        if (linha.smt_subfaseid !== undefined) {
            if (linha.smt_subfaseid) {
                record['smt_subfase@odata.bind'] = `/smt_subfases(${linha.smt_subfaseid})`;
            } else {
                record['smt_subfase@odata.bind'] = null;
            }
        }
        if (linha.smt_tipodedesenvolvimentoid !== undefined) {
            if (linha.smt_tipodedesenvolvimentoid) {
                record['smt_tipodedesenvolvimento@odata.bind'] = `/smt_tipodedesenvolvimentos(${linha.smt_tipodedesenvolvimentoid})`;
            } else {
                record['smt_tipodedesenvolvimento@odata.bind'] = null;
            }
        }
        
        if (linha.smt_modulo !== undefined) record['smt_modulo'] = linha.smt_modulo;
        if (linha.smt_requisitodocliente !== undefined) record['smt_requisitodocliente'] = linha.smt_requisitodocliente;
        if (linha.smt_funcionalidade !== undefined) record['smt_funcionalidade'] = linha.smt_funcionalidade;
        if (linha.smt_descricao !== undefined) record['smt_descricao'] = linha.smt_descricao;
        if (linha.smt_observacoestecnicas !== undefined) record['smt_observacoestecnicas'] = linha.smt_observacoestecnicas;
        if (linha.smt_dimensionamento !== undefined) record['smt_dimensionamento'] = linha.smt_dimensionamento;
        if (linha.smt_estimativafinal !== undefined) record['smt_estimativafinal'] = linha.smt_estimativafinal;
        if (linha.smt_tipodeatividade !== undefined) record['smt_tipodeatividade'] = linha.smt_tipodeatividade;
        if (linha.smt_complexidade !== undefined) record['smt_complexidade'] = linha.smt_complexidade;
        if (linha.smt_percentualdedesenvolvimento !== undefined) 
            record['smt_percentualdedesenvolvimento'] = linha.smt_percentualdedesenvolvimento;
        if (linha.smt_ordem !== undefined) record['smt_ordem'] = linha.smt_ordem;

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
     */
    async retrieveLinhasDeEstimativa(estimativaId: string): Promise<LinhaDeEstimativa[]> {
        const fetchXml = `
            <fetch>
                <entity name="smt_linhadeestimativa">
                    <attribute name="smt_linhadeestimativaid" />
                    <attribute name="smt_modulo" />
                    <attribute name="smt_requisitodocliente" />
                    <attribute name="smt_funcionalidade" />
                    <attribute name="smt_descricao" />
                    <attribute name="smt_observacoestecnicas" />
                    <attribute name="smt_dimensionamento" />
                    <attribute name="smt_estimativafinal" />
                    <attribute name="smt_tipodeatividade" />
                    <attribute name="smt_complexidade" />
                    <attribute name="smt_percentualdedesenvolvimento" />
                    <attribute name="smt_ordem" />
                    <attribute name="smt_numeroid" />
                    <filter>
                        <condition attribute="smt_estimativa" operator="eq" value="${estimativaId}" />
                    </filter>
                    <order attribute="smt_ordem" descending="false" />
                    <link-entity name="smt_fase" from="smt_faseid" to="smt_fase" alias="fase" link-type="outer">
                        <attribute name="smt_faseid" />
                        <attribute name="smt_name" />
                    </link-entity>
                    <link-entity name="smt_subfase" from="smt_subfaseid" to="smt_subfase" alias="subfase" link-type="outer">
                        <attribute name="smt_subfaseid" />
                        <attribute name="smt_name" />
                    </link-entity>
                    <link-entity name="smt_tipodedesenvolvimento" from="smt_tipodedesenvolvimentoid" to="smt_tipodedesenvolvimento" alias="tipo" link-type="outer">
                        <attribute name="smt_tipodedesenvolvimentoid" />
                        <attribute name="smt_name" />
                    </link-entity>
                </entity>
            </fetch>
        `;

        const result = await this.webAPI.retrieveMultipleRecords('smt_linhadeestimativa', `?fetchXml=${encodeURIComponent(fetchXml)}`);
        
        return result.entities.map(entity => ({
            smt_linhadeestimativaid: entity.smt_linhadeestimativaid,
            smt_estimativaid: estimativaId,
            smt_faseid: entity['_smt_fase_value'],
            smt_fase: entity['fase.smt_name'],
            smt_subfaseid: entity['_smt_subfase_value'],
            smt_subfase: entity['subfase.smt_name'],
            smt_tipodedesenvolvimentoid: entity['_smt_tipodedesenvolvimento_value'],
            smt_tipodedesenvolvimento: entity['tipo.smt_name'],
            smt_modulo: entity.smt_modulo,
            smt_requisitodocliente: entity.smt_requisitodocliente,
            smt_funcionalidade: entity.smt_funcionalidade,
            smt_descricao: entity.smt_descricao,
            smt_observacoestecnicas: entity.smt_observacoestecnicas,
            smt_dimensionamento: entity.smt_dimensionamento,
            smt_estimativafinal: entity.smt_estimativafinal,
            smt_tipodeatividade: entity.smt_tipodeatividade,
            smt_complexidade: entity.smt_complexidade,
            smt_percentualdedesenvolvimento: entity.smt_percentualdedesenvolvimento,
            smt_ordem: entity.smt_ordem,
            smt_numeroid: entity.smt_numeroid
        }));
    }

    // ============= Lookup Tables Operations =============

    /**
     * Retrieve all phases
     */
    async retrieveFases(): Promise<Fase[]> {
        const result = await this.webAPI.retrieveMultipleRecords(
            'smt_fase',
            '?$select=smt_faseid,smt_name,smt_exibirnalinha,smt_ordem,smt_cor&$orderby=smt_ordem asc'
        );
        
        return result.entities.map(entity => ({
            smt_faseid: entity.smt_faseid,
            smt_name: entity.smt_name,
            smt_exibirnalinha: entity.smt_exibirnalinha,
            smt_ordem: entity.smt_ordem,
            smt_cor: entity.smt_cor
        }));
    }

    /**
     * Retrieve all subphases
     */
    async retrieveSubfases(): Promise<Subfase[]> {
        const result = await this.webAPI.retrieveMultipleRecords(
            'smt_subfase',
            '?$select=smt_subfaseid,smt_name,smt_ordem,smt_ordemproposta,smt_cor&$expand=smt_fase($select=smt_faseid,smt_name)&$orderby=smt_ordem asc'
        );
        
        return result.entities.map(entity => ({
            smt_subfaseid: entity.smt_subfaseid,
            smt_name: entity.smt_name,
            smt_faseid: entity._smt_fase_value,
            smt_fase: entity.smt_fase?.smt_name,
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
            '?$select=smt_tipodedesenvolvimentoid,smt_name,smt_descricaopadrao'
        );
        
        return result.entities.map(entity => ({
            smt_tipodedesenvolvimentoid: entity.smt_tipodedesenvolvimentoid,
            smt_name: entity.smt_name,
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
            '?$select=smt_tipodedesenvolvimentoid,smt_name,smt_descricaopadrao'
        );
        
        return {
            smt_tipodedesenvolvimentoid: result.smt_tipodedesenvolvimentoid,
            smt_name: result.smt_name,
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
            '?$select=smt_modelodeestimativaid,smt_name'
        );
        
        return result.entities.map(entity => ({
            smt_modelodeestimativaid: entity.smt_modelodeestimativaid,
            smt_name: entity.smt_name
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
                    <attribute name="smt_percentualdedesenvolvimento" />
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
        
        return result.entities.map(entity => ({
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
            smt_tipodeatividade: entity.smt_tipodeatividade,
            smt_complexidade: entity.smt_complexidade,
            smt_percentualdedesenvolvimento: entity.smt_percentualdedesenvolvimento,
            smt_ordem: entity.smt_ordem
        }));
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
                smt_requisitodocliente: modelLine.smt_requisitodocliente,
                smt_funcionalidade: modelLine.smt_funcionalidade,
                smt_descricao: modelLine.smt_descricao,
                smt_observacoestecnicas: modelLine.smt_observacoestecnicas,
                smt_dimensionamento: modelLine.smt_dimensionamento,
                smt_tipodeatividade: modelLine.smt_tipodeatividade,
                smt_complexidade: modelLine.smt_complexidade,
                smt_percentualdedesenvolvimento: modelLine.smt_percentualdedesenvolvimento,
                smt_ordem: startingOrder + i,
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

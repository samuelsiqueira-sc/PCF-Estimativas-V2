/**
 * TypeScript type definitions for Dataverse tables
 */

import { ActivityType, Complexity } from './enums';

/**
 * smt_estimativa (Estimation)
 */
export interface Estimativa {
    smt_estimativaid?: string;
    smt_name?: string;
    smt_oportunidade?: string; // opportunity
    smt_horasdedesenvolvimento?: number; // total development hours
    smt_horasdesuporte?: number; // total support hours
    smt_horasdoprojeto?: number; // total project hours
    smt_modelodeestimativa?: string; // lookup to estimation model (required)
    smt_modelodeestimativaid?: string;
    smt_datadeinicios?: Date | string; // estimated start date
    smt_numeroid?: string; // auto-numbered ID
}

/**
 * smt_linhadeestimativa (Estimation Line)
 */
export interface LinhaDeEstimativa {
    smt_linhadeestimativaid?: string;
    smt_estimativa?: string; // lookup to estimation
    smt_estimativaid?: string;
    smt_fase?: string; // lookup to phase
    smt_faseid?: string;
    smt_subfase?: string; // lookup to subphase
    smt_subfaseid?: string;
    smt_modulo?: string; // module (text)
    smt_requisitodocliente?: string; // customer requirement (text)
    smt_funcionalidade?: string; // functionality (text)
    smt_descricao?: string; // description (text)
    smt_observacoestecnicas?: string; // technical notes (text)
    smt_dimensionamento?: number; // dimensioning (decimal with 2 decimal places)
    smt_estimativafinal?: number; // final estimation (calculated integer)
    smt_tipodeatividade?: ActivityType | string; // activity type
    smt_tipodedesenvolvimento?: string; // lookup to development type
    smt_tipodedesenvolvimentoid?: string;
    smt_complexidade?: Complexity | string; // complexity
    smt_numeroid?: string; // auto-numbered ID
    smt_percentualdedesenvolvimento?: number; // percentage of development (for Support activities)
    smt_ordem?: number; // order
}

/**
 * smt_modelodeestimativa (Estimation Model)
 */
export interface ModeloDeEstimativa {
    smt_modelodeestimativaid?: string;
    smt_name?: string;
}

/**
 * smt_linhademodelodeestimativa (Estimation Model Line)
 */
export interface LinhaDeModeloDeEstimativa {
    smt_linhademodelodeestimativaid?: string;
    smt_modelodeestimativa?: string; // lookup to estimation model
    smt_modelodeestimativaid?: string;
    smt_fase?: string; // lookup to phase
    smt_faseid?: string;
    smt_subfase?: string; // lookup to subphase
    smt_subfaseid?: string;
    smt_modulo?: string;
    smt_requisitodocliente?: string;
    smt_funcionalidade?: string;
    smt_descricao?: string;
    smt_observacoestecnicas?: string;
    smt_dimensionamento?: number;
    smt_tipodeatividade?: ActivityType | string;
    smt_tipodedesenvolvimento?: string;
    smt_tipodedesenvolvimentoid?: string;
    smt_complexidade?: Complexity | string;
    smt_percentualdedesenvolvimento?: number;
    smt_ordem?: number;
}

/**
 * smt_tipodedesenvolvimento (Development Type)
 */
export interface TipoDeDesenvolvimento {
    smt_tipodedesenvolvimentoid?: string;
    smt_name?: string;
    smt_descricaopadrao?: string; // default description
}

/**
 * smt_fase (Phase)
 */
export interface Fase {
    smt_faseid?: string;
    smt_name?: string;
    smt_exibirnalinha?: boolean; // display in timeline flag
    smt_ordem?: number; // order
    smt_cor?: string; // color (hex code)
}

/**
 * smt_subfase (Subphase)
 */
export interface Subfase {
    smt_subfaseid?: string;
    smt_name?: string;
    smt_fase?: string; // lookup to phase
    smt_faseid?: string;
    smt_ordem?: number; // order
    smt_ordemproposta?: number; // proposed order
    smt_cor?: string; // color (hex code)
}

/**
 * smt_planodeequipe (Team Plan)
 */
export interface PlanoDeEquipe {
    smt_planodeequipeid?: string;
    smt_name?: string;
}

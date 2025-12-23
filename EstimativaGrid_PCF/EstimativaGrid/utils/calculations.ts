/**
 * Calculation utilities for the PCF Estimativas control
 */

import { LinhaDeEstimativa, ActivityType } from '../models';

/**
 * Calculate total development hours from estimation lines
 * Sum of Dimensionamento for Development-type lines
 * @param lines - Array of estimation lines
 * @param developmentLabel - The label used for Development activity type in Dataverse
 */
export function calculateTotalDevelopmentHours(lines: LinhaDeEstimativa[], developmentLabel?: string): number {
    const devLabel = developmentLabel || ActivityType.Development;
    return lines
        .filter(line => line.smt_tipodeatividade === devLabel)
        .reduce((sum, line) => sum + (line.smt_dimensionamento || 0), 0);
}

/**
 * Calculate total support hours from estimation lines
 * Sum of Dimensionamento for Support-type lines
 * @param lines - Array of estimation lines
 * @param supportLabel - The label used for Support activity type in Dataverse
 */
export function calculateTotalSupportHours(lines: LinhaDeEstimativa[], supportLabel?: string): number {
    const suppLabel = supportLabel || ActivityType.Support;
    return lines
        .filter(line => line.smt_tipodeatividade === suppLabel)
        .reduce((sum, line) => sum + (line.smt_dimensionamento || 0), 0);
}

/**
 * Calculate total project hours
 * Sum of development and support hours
 */
export function calculateTotalProjectHours(developmentHours: number, supportHours: number): number {
    return developmentHours + supportHours;
}

/**
 * Calculate support ratio
 * Ratio of total support hours to total development hours
 * @param totalSupportHours - Total support hours (must be non-negative)
 * @param totalDevelopmentHours - Total development hours (must be non-negative)
 * @returns The support ratio, or 0 if development hours is 0
 */
export function calculateSupportRatio(totalSupportHours: number, totalDevelopmentHours: number): number {
    // Validate inputs
    if (isNaN(totalSupportHours) || isNaN(totalDevelopmentHours) || 
        !isFinite(totalSupportHours) || !isFinite(totalDevelopmentHours)) {
        return 0;
    }
    if (totalSupportHours < 0 || totalDevelopmentHours < 0) {
        return 0;
    }
    if (totalDevelopmentHours === 0) return 0;
    return totalSupportHours / totalDevelopmentHours;
}

/**
 * Calculate final estimation for Development activities
 * Formula: Dimensionamento * (1 + supportRatio), rounded up
 */
export function calculateDevelopmentEstimation(
    dimensionamento: number,
    totalSupportHours: number,
    totalDevelopmentHours: number
): number {
    const supportRatio = calculateSupportRatio(totalSupportHours, totalDevelopmentHours);
    const result = dimensionamento * (1 + supportRatio);
    return Math.ceil(result);
}

/**
 * Calculate dimensioning for Support activities
 * Formula: percentualDeDesenvolvimento * totalDevelopmentHours, rounded up
 */
export function calculateSupportDimensioning(
    percentualDeDesenvolvimento: number,
    totalDevelopmentHours: number
): number {
    const result = (percentualDeDesenvolvimento / 100) * totalDevelopmentHours;
    return Math.ceil(result);
}

/**
 * Calculate final estimation for Process activities
 * Formula: Dimensionamento (no modification)
 */
export function calculateProcessEstimation(dimensionamento: number): number {
    return dimensionamento;
}

/**
 * Calculate final estimation for Support activities
 * Always returns 0
 */
export function calculateSupportEstimation(): number {
    return 0;
}

/**
 * Calculate final estimation based on activity type
 * @param line - The estimation line
 * @param totalDevelopmentHours - Total development hours
 * @param totalSupportHours - Total support hours
 * @param developmentLabel - The label used for Development activity type in Dataverse
 * @param processLabel - The label used for Process activity type in Dataverse
 * @param supportLabel - The label used for Support activity type in Dataverse
 */
export function calculateFinalEstimation(
    line: LinhaDeEstimativa,
    totalDevelopmentHours: number,
    totalSupportHours: number,
    developmentLabel?: string,
    processLabel?: string,
    supportLabel?: string
): number {
    const devLabel = developmentLabel || ActivityType.Development;
    const procLabel = processLabel || ActivityType.Process;
    const suppLabel = supportLabel || ActivityType.Support;
    
    if (line.smt_tipodeatividade === devLabel) {
        return calculateDevelopmentEstimation(
            line.smt_dimensionamento || 0,
            totalSupportHours,
            totalDevelopmentHours
        );
    } else if (line.smt_tipodeatividade === procLabel) {
        return calculateProcessEstimation(line.smt_dimensionamento || 0);
    } else if (line.smt_tipodeatividade === suppLabel) {
        return calculateSupportEstimation();
    } else {
        return 0;
    }
}

/**
 * Recalculate all estimation lines
 * This function updates dimensionamento for Support lines and estimativafinal for all lines
 * @param lines - Array of estimation lines
 * @param developmentLabel - The label used for Development activity type in Dataverse
 * @param processLabel - The label used for Process activity type in Dataverse
 * @param supportLabel - The label used for Support activity type in Dataverse
 */
export function recalculateAllLines(
    lines: LinhaDeEstimativa[],
    developmentLabel?: string,
    processLabel?: string,
    supportLabel?: string
): LinhaDeEstimativa[] {
    const suppLabel = supportLabel || ActivityType.Support;
    
    // First pass: calculate totals (excluding Support lines which will be recalculated)
    const totalDevelopmentHours = calculateTotalDevelopmentHours(lines, developmentLabel);
    
    // Second pass: update Support dimensioning
    const linesWithUpdatedDimensioning = lines.map(line => {
        if (line.smt_tipodeatividade === suppLabel) {
            return {
                ...line,
                smt_dimensionamento: calculateSupportDimensioning(
                    line.smt_dedesenvolvimento || 0,
                    totalDevelopmentHours
                )
            };
        }
        return line;
    });
    
    // Third pass: recalculate total support hours with updated dimensioning
    const totalSupportHours = calculateTotalSupportHours(linesWithUpdatedDimensioning, supportLabel);
    
    // Fourth pass: calculate final estimations
    const linesWithFinalEstimations = linesWithUpdatedDimensioning.map(line => ({
        ...line,
        smt_estimativafinal: calculateFinalEstimation(line, totalDevelopmentHours, totalSupportHours, developmentLabel, processLabel, supportLabel)
    }));
    
    return linesWithFinalEstimations;
}

# PCF Estimativas V2

A PowerApps Component Framework (PCF) control for managing estimations in Model-driven Apps, built with React and TypeScript.

## Overview

This PCF control provides a rich, spreadsheet-like interface for creating and managing project estimations. It's bound to the `smt_estimativa` table and manages related estimation lines in `smt_linhadeestimativa`.

## Features

- **Estimation Management**: Create and edit estimations with name, opportunity, model selection, and start date
- **Real-time Calculations**: Automatic calculation of development, support, and total project hours
- **Inline Editing**: Edit estimation lines directly in a grid view
- **Model Import**: Import pre-configured estimation models with Process and Support lines
- **Development Type Auto-fill**: Automatically copies default descriptions when selecting development types
- **Business Rules**: Prevents deletion of Process and Support lines
- **Fluent UI**: Clean, minimalist design using Microsoft Fluent UI components

## Architecture

The solution follows a clean layered architecture:

```
EstimativaGrid_PCF/EstimativaGrid/
├── models/              # TypeScript type definitions
│   ├── types.ts        # Dataverse table interfaces
│   ├── enums.ts        # Enums for ActivityType, Complexity
│   └── index.ts
├── services/           # Dataverse WebAPI access layer
│   ├── DataverseService.ts  # CRUD operations
│   └── index.ts
├── utils/              # Business logic and calculations
│   ├── calculations.ts # Calculation functions
│   └── index.ts
├── ui-controls/        # React UI components
│   ├── EstimativaGridComponent.tsx
│   ├── EstimationHeaderComponent.tsx
│   ├── EstimationLinesGridComponent.tsx
│   ├── ModelImportDialog.tsx
│   └── index.ts
└── index.ts            # Main PCF control entry point
```

## Dataverse Tables

### Main Tables
- **smt_estimativa**: Estimation header with totals and metadata
- **smt_linhadeestimativa**: Individual estimation lines

### Lookup Tables
- **smt_fase**: Project phases
- **smt_subfase**: Sub-phases within phases
- **smt_tipodedesenvolvimento**: Development types (data model, workflow, JavaScript, etc.)
- **smt_modelodeestimativa**: Estimation models (Sales, Contact Center, etc.)

## Calculation Rules

### Development Activities
- **Dimensionamento**: User-editable decimal field
- **Estimation**: `Dimensionamento × (1 + Support Ratio)`, rounded up
- **Support Ratio**: `Total Support Hours / Total Development Hours`

### Process Activities
- **Dimensionamento**: User-editable decimal field
- **Estimation**: Equals `Dimensionamento` (no modification)

### Support Activities
- **% Development**: User-editable percentage field
- **Dimensionamento**: `(% Development × Total Development Hours)`, rounded up
- **Estimation**: Always 0

### Totals
- **Total Development Hours**: Sum of Dimensionamento for Development lines
- **Total Support Hours**: Sum of Dimensionamento for Support lines
- **Total Project Hours**: Development Hours + Support Hours

## Business Rules

1. **Auto-copy Description**: When a Development Type is selected, its default description is automatically copied to the estimation line
2. **Model Import**: When importing an estimation model, Process and Support lines are created
3. **Non-deletable Lines**: Process and Support lines cannot be deleted
4. **Real-time Recalculation**: All calculations update in real-time as values change
5. **Frontend Calculations**: All calculations occur on the frontend, with final values persisted to Dataverse

## Development

### Prerequisites
- Node.js 14 or later
- PowerApps CLI tools

### Build
```bash
npm install
npm run build
```

### Lint
```bash
npm run lint
```

### Watch Mode
```bash
npm run start:watch
```

## Usage

1. **Create New Estimation**:
   - Enter estimation name and opportunity
   - Select an estimation model (required)
   - Optionally set an estimated start date
   - Click "Import Model" to populate Process and Support lines

2. **Add Development Lines**:
   - Click "Add Line" to create new estimation lines
   - Select activity type, phase, subphase
   - Choose development type (auto-fills description)
   - Enter dimensioning hours
   - View real-time calculation results

3. **Edit Lines**:
   - All fields are editable inline
   - Changes trigger automatic recalculation
   - Totals update in the header section

4. **Save**:
   - Click "Save" to persist all changes to Dataverse
   - All calculated values are saved

5. **Import Additional Models**:
   - Click "Import Model" to add more Process/Support lines
   - Select one or more models
   - Lines are appended to existing estimation

## Field Descriptions

### Estimation Fields
- **Name**: Estimation name
- **Opportunity**: Associated opportunity
- **Estimation Model**: Base model for Process/Support lines
- **Estimated Start Date**: Project start date
- **Total Development Hours**: Calculated sum of Development dimensioning
- **Total Support Hours**: Calculated sum of Support dimensioning
- **Total Project Hours**: Calculated total of all hours

### Estimation Line Fields
- **Activity Type**: Development, Process, or Support
- **Phase**: Project phase lookup
- **Subphase**: Sub-phase within phase
- **Module**: Text field for module name
- **Requirement**: Customer requirement description
- **Functionality**: Functionality description
- **Dev Type**: Development type lookup (triggers auto-fill)
- **Complexity**: Very Low, Low, Medium, High, Very High
- **Description**: Detailed description (auto-filled from Dev Type)
- **Technical Notes**: Additional technical information
- **Dimensioning**: Hours estimate (calculated for Support)
- **% Dev**: Percentage field (Support activities only)
- **Estimation**: Final calculated estimation value

## License

Copyright © 2025. All rights reserved.

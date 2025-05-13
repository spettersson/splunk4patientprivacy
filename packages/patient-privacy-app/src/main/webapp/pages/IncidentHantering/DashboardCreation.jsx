import React from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import NextGenIncidentTabell from '@splunk/next-gen-incident-tabell';
import definition from './definition.json';

// use DashboardCore to render a simple dashboard
const customPreset = {
    ...EnterpriseViewOnlyPreset,
    visualizations: {
        ...EnterpriseViewOnlyPreset.visualizations,
        'splunk.NextGenIncidentTabell': NextGenIncidentTabell,
    },
};

const DashboardCreation = () => {
    return (
        <DashboardContextProvider preset={customPreset} initialDefinition={definition}>
            <DashboardCore width="100%" height="100%" />
        </DashboardContextProvider>
    );
};

export default DashboardCreation;

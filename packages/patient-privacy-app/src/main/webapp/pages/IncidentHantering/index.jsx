import React from 'react';
import layout from '@splunk/react-page';
import DashboardCreation from './DashboardCreation';
import { DashboardContainer, DashboardHeader } from './styles';

const PageWithHeader = () => {
    return (
        <DashboardContainer>
            <DashboardHeader>
                <h1>Hantering av Larm</h1>
                <p>
                    Denna arbetsyta möjliggör för att se och hantera identifierade larm
                    kopplade till olika vårdgivare. Vilken information som är tillgänglig beror på
                    din behörighet.
                </p>
            </DashboardHeader>
            <DashboardCreation />
        </DashboardContainer>
    );
};

layout(<PageWithHeader />, {
    pageTitle: 'Journalövervakning | Incidenthantering',
    hideFooter: true,
    layout: 'fixed',
});

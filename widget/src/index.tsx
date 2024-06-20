import React from 'react';
import ReactDOM from 'react-dom/client';
import { SettingsREON } from './utils/createSettingsFooter';
import { widgetControllerTrigger } from './api';
import { WidgetControllerDto } from './types/widgetControllerDto';
import WidgetMainSettings from './views/settingsReon/WidgetMainSettings';

const createReactRoot = (domElementId: string, rootComponent: React.JSX.Element ): void => {
    const rootDOMElement: HTMLElement | null = document.getElementById(domElementId);
    if (rootDOMElement) {
        const modalRoot = ReactDOM.createRoot(rootDOMElement);
        modalRoot.render(
            <>
                {rootComponent}
            </>
        );
    }
}

const Wid = {
    render: async () => {
        return true;
    },
    init: async () => {
        return true;
    },
    bind_actions() {
        return true;
    },
    advancedSettings() {
        return true;
    },
    dpSettings() {
        return true;
    },
    settings() {
        const settingsRoot = document.getElementById('widget_settings__fields_wrapper') as HTMLElement;
        SettingsREON.createSettingsFooter();
        SettingsREON.hideSystemFields(settingsRoot);
        SettingsREON.insertSettingsCarcass(settingsRoot);
        
        createReactRoot('reon-widget-settings__content', <WidgetMainSettings />)
        
        SettingsREON.replaceSaveButton(settingsRoot);
        
        return true;
    },
    onSave: async (newLead: WidgetControllerDto) => {
        await widgetControllerTrigger(newLead);
        return true;
    },
    destroy: async () => {
        return true;
    },
};

export default Wid;
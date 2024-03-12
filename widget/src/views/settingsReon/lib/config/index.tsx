import React from 'react';
import WidgetSettingsPayment from "../../components/widget-settings-payment/WidgetSettingsPayment";
import WidgetSettingsUser from "../../components/widget-settings-user/WidgetSettingsUser";

export enum SettingsOptionsId {
    user =  'reon_main_settings',
    payment = 'reon_payment',
}

export const SettingsConfig = [
    {
        id: SettingsOptionsId.user,
        title: "Настройки",
        Components: <WidgetSettingsUser />,
    },
    {
        id: SettingsOptionsId.payment,
        title: "Подписка",
        Components: <WidgetSettingsPayment />,
    },
] as const;
